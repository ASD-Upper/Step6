import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faTimes, 
  faImage, 
  faLink, 
  faPlay,
  faEdit,
  faEye,
  faExternalLinkAlt,
  faVideo
} from '@fortawesome/free-solid-svg-icons';

const VideoForm = ({ videos = [], onSubmit, isEditMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const initialFormState = {
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    embedUrl: '',
    externalUrl: '',
    previewUrl: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load video data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const videoToEdit = videos.find(v => v.id === id);
      if (videoToEdit) {
        setFormData(videoToEdit);
        setThumbnailPreview(videoToEdit.thumbnail);
      } else {
        navigate('/admin/videos');
      }
    }
  }, [isEditMode, id, videos, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Show thumbnail preview when URL changes
    if (name === 'thumbnail' && value) {
      setThumbnailPreview(value);
    }
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.thumbnail.trim()) {
      errors.thumbnail = 'Thumbnail URL is required';
    } else if (!isValidUrl(formData.thumbnail)) {
      errors.thumbnail = 'Please enter a valid URL';
    }
    
    if (!formData.videoUrl.trim()) {
      errors.videoUrl = 'Video URL is required';
    } else if (!isValidUrl(formData.videoUrl)) {
      errors.videoUrl = 'Please enter a valid URL';
    }
    
    if (formData.embedUrl && !isValidUrl(formData.embedUrl)) {
      errors.embedUrl = 'Please enter a valid URL';
    }
    
    if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
      errors.externalUrl = 'Please enter a valid URL';
    }
    
    if (formData.previewUrl && !isValidUrl(formData.previewUrl)) {
      errors.previewUrl = 'Please enter a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        await onSubmit(id, formData);
      } else {
        await onSubmit(formData);
      }
      
      // Reset form after submission if adding new video
      if (!isEditMode) {
        setFormData(initialFormState);
        setThumbnailPreview('');
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/videos');
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <h2>{isEditMode ? 'Edit Video' : 'Add New Video'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row">
          <div className="admin-form-col">
            <div className="admin-form-group">
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                className={formErrors.title ? 'admin-input-error' : ''}
              />
              {formErrors.title && <div className="admin-form-error">{formErrors.title}</div>}
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter video description"
                rows="3"
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="thumbnail">Thumbnail URL*</label>
              <div className="admin-input-with-icon">
                <FontAwesomeIcon icon={faImage} className="admin-input-icon" />
                <input
                  type="text"
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={formErrors.thumbnail ? 'admin-input-error' : ''}
                />
              </div>
              {formErrors.thumbnail && <div className="admin-form-error">{formErrors.thumbnail}</div>}
            </div>
          </div>
          
          <div className="admin-form-col">
            {thumbnailPreview && (
              <div className="admin-thumbnail-preview">
                <h3>Thumbnail Preview</h3>
                <div className="admin-preview-image-container">
                  <img 
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x180?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="videoUrl">Video URL*</label>
          <div className="admin-input-with-icon">
            <FontAwesomeIcon icon={faLink} className="admin-input-icon" />
            <input
              type="text"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://example.com/video"
              className={formErrors.videoUrl ? 'admin-input-error' : ''}
            />
          </div>
          {formErrors.videoUrl && <div className="admin-form-error">{formErrors.videoUrl}</div>}
        </div>
        
        <div className="admin-form-row">
          <div className="admin-form-col">
            <div className="admin-form-group">
              <label htmlFor="embedUrl">Embed URL (optional)</label>
              <div className="admin-input-with-icon">
                <FontAwesomeIcon icon={faLink} className="admin-input-icon" />
                <input
                  type="text"
                  id="embedUrl"
                  name="embedUrl"
                  value={formData.embedUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/embed/video"
                  className={formErrors.embedUrl ? 'admin-input-error' : ''}
                />
              </div>
              {formErrors.embedUrl && <div className="admin-form-error">{formErrors.embedUrl}</div>}
            </div>
          </div>
          
          <div className="admin-form-col">
            <div className="admin-form-group">
              <label htmlFor="externalUrl">External URL (optional)</label>
              <div className="admin-input-with-icon">
                <FontAwesomeIcon icon={faLink} className="admin-input-icon" />
                <input
                  type="text"
                  id="externalUrl"
                  name="externalUrl"
                  value={formData.externalUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/external-link"
                  className={formErrors.externalUrl ? 'admin-input-error' : ''}
                />
              </div>
              {formErrors.externalUrl && <div className="admin-form-error">{formErrors.externalUrl}</div>}
            </div>
          </div>
        </div>
        
        <div className="admin-form-row">
          <div className="admin-form-col">
            <div className="admin-form-group">
              <label htmlFor="previewUrl">Preview Video URL (optional)</label>
              <div className="admin-input-with-icon">
                <FontAwesomeIcon icon={faVideo} className="admin-input-icon" />
                <input
                  type="text"
                  id="previewUrl"
                  name="previewUrl"
                  value={formData.previewUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/preview.mp4"
                  className={formErrors.previewUrl ? 'admin-input-error' : ''}
                />
              </div>
              {formErrors.previewUrl && <div className="admin-form-error">{formErrors.previewUrl}</div>}
              <small className="admin-form-help">Short video clip that plays when hovering over thumbnail</small>
            </div>
          </div>
        </div>
        
        {/* Video Card Preview Section */}
        {(formData.title || formData.thumbnail) && (
          <div className="video-card-preview-section">
            <h3>Video Card Preview</h3>
            <p className="preview-subtitle">This is how your video will appear in the collection</p>
            
            <div className="video-card-preview">
              <div className="video-card">
                <div className="thumbnail">
                  <img 
                    src={formData.thumbnail || 'https://via.placeholder.com/300x180?text=Add+Thumbnail'} 
                    alt={formData.title || 'Video thumbnail'}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x180?text=Invalid+Image+URL';
                    }}
                  />
                  <div className="play-button">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  <div className="video-duration">00:00</div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{formData.title || 'Video Title'}</h3>
                  <p className="video-description">{formData.description || 'Video description will appear here'}</p>
                  <div className="video-meta">
                    <span className="video-views">
                      <FontAwesomeIcon icon={faEye} /> 0 views
                    </span>
                    <span className="video-date">
                      Added today
                    </span>
                  </div>
                  <div className="video-actions">
                    <button type="button" className="action-button watch">
                      <FontAwesomeIcon icon={faPlay} /> Watch
                    </button>
                    <button type="button" className="action-button edit">
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    {formData.externalUrl && (
                      <button type="button" className="action-button external">
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Source
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="admin-form-actions">
          <button 
            type="button" 
            className="admin-btn admin-btn-secondary" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            type="submit" 
            className="admin-btn admin-btn-primary" 
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Video' : 'Add Video')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;
