import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlusCircle, 
  faFilm, 
  faHeading, 
  faAlignLeft, 
  faImage, 
  faLink, 
  faCode, 
  faTimes, 
  faPlus,
  faVideo
} from '@fortawesome/free-solid-svg-icons';

const AddVideoSection = ({ onAddVideo }) => {
  const initialFormState = {
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    embedUrl: '',
    previewUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.thumbnail.trim()) errors.thumbnail = 'Thumbnail URL is required';
    if (!formData.videoUrl.trim()) errors.videoUrl = 'Video URL is required';
    
    // Validate URLs
    const urlFields = ['thumbnail', 'videoUrl', 'embedUrl', 'previewUrl'];
    urlFields.forEach(field => {
      if (formData[field]) {
        if (field === 'previewUrl') {
          // Handle multiple preview URLs
          const previewUrls = formData[field].split(',').map(url => url.trim());
          const invalidUrls = previewUrls.filter(url => !isValidUrl(url));
          
          if (invalidUrls.length > 0) {
            errors[field] = 'One or more preview URLs are invalid';
          }
          
          // Check if at least one URL is a valid video
          const validVideoUrls = previewUrls.filter(url => isValidVideoUrl(url));
          if (previewUrls.length > 0 && validVideoUrls.length === 0) {
            errors[field] = 'At least one preview URL must be a valid video file (mp4, webm, ogg)';
          }
        } else if (!isValidUrl(formData[field])) {
          errors[field] = 'Please enter a valid URL';
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    if (!string) return true; // Empty is okay for optional fields
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidVideoUrl = (url) => {
    if (!url) return true;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        let previewUrls = [];
        
        // Process multiple preview URLs
        if (formData.previewUrl) {
          previewUrls = formData.previewUrl.split(',').map(url => url.trim());
          
          // Test at least the first URL for accessibility
          if (previewUrls.length > 0) {
            try {
              const response = await fetch(previewUrls[0], { method: 'HEAD' });
              if (!response.ok) {
                console.warn('First preview URL may not be accessible');
              }
            } catch (error) {
              console.warn('Could not check preview URL accessibility:', error);
            }
          }
        }

        onAddVideo({
          title: formData.title,
          description: formData.description,
          thumbnail: formData.thumbnail,
          videoUrl: formData.videoUrl,
          embedUrl: formData.embedUrl || null,
          previewUrl: previewUrls.length > 0 ? previewUrls.join(',') : null
        });
        
        // Reset and close form
        setFormData(initialFormState);
        setShowForm(false);
      } catch (error) {
        setFormErrors({
          ...formErrors,
          previewUrl: error.message
        });
      }
    }
  };

  return (
    <div className="add-video-section">
      {!showForm ? (
        <button className="show-form-btn" onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add New Video
        </button>
      ) : (
        <form className="add-video-form" onSubmit={handleSubmit}>
          <h3><FontAwesomeIcon icon={faFilm} /> Add New Video</h3>
          <div className="form-group">
            <label htmlFor="video-title">
              <FontAwesomeIcon icon={faHeading} className="input-icon" /> Title
            </label>
            <input 
              type="text" 
              id="video-title" 
              placeholder="Enter video title" 
              value={formData.title}
              onChange={handleChange}
              required 
            />
            <div className="form-feedback">{formErrors.title}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="video-description">
              <FontAwesomeIcon icon={faAlignLeft} className="input-icon" /> Description
            </label>
            <input 
              type="text" 
              id="video-description" 
              placeholder="Enter video description" 
              value={formData.description}
              onChange={handleChange}
              required 
            />
            <div className="form-feedback">{formErrors.description}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="video-thumbnail">
              <FontAwesomeIcon icon={faImage} className="input-icon" /> Thumbnail URL
            </label>
            <input 
              type="url" 
              id="video-thumbnail" 
              placeholder="Enter thumbnail URL" 
              value={formData.thumbnail}
              onChange={handleChange}
              required 
            />
            <div className="form-feedback">{formErrors.thumbnail}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="video-videoUrl">
              <FontAwesomeIcon icon={faLink} className="input-icon" /> Video URL
            </label>
            <input 
              type="url" 
              id="video-videoUrl" 
              placeholder="Enter video URL" 
              value={formData.videoUrl}
              onChange={handleChange}
              required 
            />
            <div className="form-feedback">{formErrors.videoUrl}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="video-embedUrl">
              <FontAwesomeIcon icon={faCode} className="input-icon" /> Embed URL (optional)
            </label>
            <input 
              type="url" 
              id="video-embedUrl" 
              placeholder="Enter embed URL (optional)" 
              value={formData.embedUrl}
              onChange={handleChange}
            />
            <div className="form-feedback">{formErrors.embedUrl}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="previewUrl">Preview Video URL(s):</label>
            <input
              type="text"
              id="previewUrl"
              name="previewUrl"
              value={formData.previewUrl}
              onChange={handleChange}
              className={formErrors.previewUrl ? 'has-error' : ''}
              placeholder="Enter preview video URLs (separate multiple URLs with commas)"
            />
            {formErrors.previewUrl && <div className="error-message">{formErrors.previewUrl}</div>}
            <div className="field-hint">
              For multiple preview sources, separate URLs with commas. First working source will be used.
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">Add Video</button>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddVideoSection;
