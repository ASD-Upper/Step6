import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilm, 
  faHeading, 
  faAlignLeft, 
  faImage, 
  faLink, 
  faCode, 
  faTimes, 
  faSave,
  faVideo
} from '@fortawesome/free-solid-svg-icons';

const EditModal = ({ video, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    embedUrl: '',
    externalUrl: '',
    previewUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (video) {
      setFormData({
        id: video.id,
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        videoUrl: video.videoUrl || '',
        embedUrl: video.embedUrl || '',
        externalUrl: video.externalUrl || '',
        previewUrl: video.previewUrl || ''
      });
    }
  }, [video]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('edit-', '');
    
    setFormData({
      ...formData,
      [fieldName]: value
    });
    
    // Clear error when typing
    if (formErrors[fieldName]) {
      setFormErrors({
        ...formErrors,
        [fieldName]: ''
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
    const urlFields = ['thumbnail', 'videoUrl', 'embedUrl', 'externalUrl', 'previewUrl'];
    urlFields.forEach(field => {
      if (formData[field] && !isValidUrl(formData[field])) {
        errors[field] = 'Please enter a valid URL';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="edit-modal" style={{ display: 'block' }}>
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h2><FontAwesomeIcon icon={faFilm} /> Edit Video</h2>
          <button className="close-edit-modal" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form id="edit-video-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">
              <FontAwesomeIcon icon={faHeading} className="input-icon" /> Title
            </label>
            <input 
              type="text" 
              id="edit-title" 
              placeholder="Enter video title" 
              value={formData.title}
              onChange={handleInputChange}
              required 
            />
            <div className="form-feedback">{formErrors.title}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-description">
              <FontAwesomeIcon icon={faAlignLeft} className="input-icon" /> Description
            </label>
            <input 
              type="text" 
              id="edit-description" 
              placeholder="Enter video description" 
              value={formData.description}
              onChange={handleInputChange}
              required 
            />
            <div className="form-feedback">{formErrors.description}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-thumbnail">
              <FontAwesomeIcon icon={faImage} className="input-icon" /> Thumbnail URL
            </label>
            <input 
              type="url" 
              id="edit-thumbnail" 
              placeholder="Enter thumbnail URL" 
              value={formData.thumbnail}
              onChange={handleInputChange}
              required 
            />
            <div className="form-feedback">{formErrors.thumbnail}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-videoUrl">
              <FontAwesomeIcon icon={faLink} className="input-icon" /> Video URL
            </label>
            <input 
              type="url" 
              id="edit-videoUrl" 
              placeholder="Enter video URL" 
              value={formData.videoUrl}
              onChange={handleInputChange}
              required 
            />
            <div className="form-feedback">{formErrors.videoUrl}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-embedUrl">
              <FontAwesomeIcon icon={faCode} className="input-icon" /> Embed URL (optional)
            </label>
            <input 
              type="url" 
              id="edit-embedUrl" 
              placeholder="Enter embed URL (optional)" 
              value={formData.embedUrl}
              onChange={handleInputChange}
            />
            <div className="form-feedback">{formErrors.embedUrl}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-externalUrl">
              <FontAwesomeIcon icon={faLink} className="input-icon" /> External URL (optional)
            </label>
            <input 
              type="url" 
              id="edit-externalUrl" 
              placeholder="Enter external URL (optional)" 
              value={formData.externalUrl}
              onChange={handleInputChange}
            />
            <div className="form-feedback">{formErrors.externalUrl}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-previewUrl">
              <FontAwesomeIcon icon={faVideo} className="input-icon" /> Preview Video URL (optional)
            </label>
            <input 
              type="url" 
              id="edit-previewUrl" 
              placeholder="Enter preview video URL (optional)" 
              value={formData.previewUrl}
              onChange={handleInputChange}
            />
            <div className="form-feedback">{formErrors.previewUrl}</div>
          </div>
          
          <div className="form-buttons">
            <button type="button" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
            <button type="submit">
              <FontAwesomeIcon icon={faSave} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
