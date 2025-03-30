import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMoon, 
  faSun, 
  faUser, 
  faHeart, 
  faBell, 
  faBookmark,
  faPlayCircle,
  faUpload,
  faCirclePlus,
  faHeading,
  faAlignLeft,
  faImage,
  faFilm,
  faVideo,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = ({ 
  currentTheme, 
  toggleTheme, 
  onSearch,
  favorites,
  showFavoritesOnly,
  toggleShowFavoritesOnly,
  isVisible = true,
  onAddVideo
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  
  // Add state for the video form data
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    previewUrl: '',
    embedUrl: ''
  });

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle showing/hiding the Add Video form
  const handleAddVideoClick = () => {
    setShowAddVideoForm(!showAddVideoForm);
    // Reset form data when opening
    if (!showAddVideoForm) {
      setVideoFormData({
        title: '',
        description: '',
        thumbnail: '',
        videoUrl: '',
        previewUrl: '',
        embedUrl: ''
      });
    }
  };
  
  // Handle form input changes
  const handleFormInputChange = (e) => {
    const fieldName = e.target.id.replace('video-', '');
    setVideoFormData({
      ...videoFormData,
      [fieldName]: e.target.value
    });
  };
  
  // Handle form submission
  const handleVideoFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!videoFormData.title || !videoFormData.description || !videoFormData.thumbnail || !videoFormData.videoUrl) {
      alert('Please fill all required fields');
      return;
    }
    
    // Call the parent component's handler
    if (typeof onAddVideo === 'function') {
      onAddVideo(videoFormData);
    }
    
    // Reset form and close modal
    setVideoFormData({
      title: '',
      description: '',
      thumbnail: '',
      videoUrl: '',
      previewUrl: '',
      embedUrl: ''
    });
    setShowAddVideoForm(false);
  };

  return (
    <>
      <header className={`${isVisible ? 'visible' : 'hidden'}`}>
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <FontAwesomeIcon icon={faPlayCircle} style={{ marginRight: '10px', fontSize: '24px', color: '#ff0066' }} />
            </div>
            <nav className="main-nav">
              <ul>
                <li><a href="#" className="active">Home</a></li>
                <li><a href="#">Categories</a></li>
                <li><a href="#">Trending</a></li>
                <li><a href="#">New</a></li>
              </ul>
            </nav>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <input 
                type="text" 
                id="search-input" 
                placeholder="Search videos..." 
                value={searchInput}
                onChange={handleSearchChange}
                onKeyUp={handleKeyUp}
              />
              <button id="search-btn" onClick={handleSearchSubmit}>
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-icons">
              <button 
                className={`icon-btn ${showFavoritesOnly ? 'active' : ''}`} 
                title={showFavoritesOnly ? 'Show all videos' : 'Show favorites only'}
                onClick={toggleShowFavoritesOnly}
              >
                <FontAwesomeIcon 
                  icon={faHeart} 
                  className={favorites.length > 0 ? 'has-favorites' : ''}
                />
                {favorites.length > 0 && (
                  <span className="favorites-count">{favorites.length}</span>
                )}
              </button>
              <button className="icon-btn" title="Bookmarks">
                <FontAwesomeIcon icon={faBookmark} />
              </button>
              <button className="icon-btn" title="Notifications">
                <FontAwesomeIcon icon={faBell} />
                <span className="notification-badge">3</span>
              </button>
              <div className="user-dropdown">
                <button className="icon-btn user-btn" onClick={toggleDropdown} title="User Account">
                  <FontAwesomeIcon icon={faUser} />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <ul>
                      <li><Link to="/admin">Admin Dashboard</Link></li>
                      <li><a href="#">Settings</a></li>
                      <li><a href="#">My Videos</a></li>
                      <li><a href="#">Logout</a></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              className="theme-toggle" 
              title="Toggle theme"
              onClick={toggleTheme}
            >
              <FontAwesomeIcon icon={currentTheme === 'light' ? faMoon : faSun} />
            </button>
          </div>
        </div>
        
        {/* Action buttons container moved from App.jsx */}
        <div className="action-buttons-container" data-component-name="App">
          <div id="upload-section" style={{ position: 'relative' }}>
            <label htmlFor="file-input" id="custom-upload-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUpload} />
            </label>
            <input id="file-input" type="file" multiple />
          </div>
          <div id="add-video-section">
            <button id="show-add-video-form-btn" onClick={handleAddVideoClick}>
              <FontAwesomeIcon icon={faCirclePlus} /> Add New Video
            </button>
          </div>
        </div>
        
        {/* Filter container moved from App.jsx */}
        <div className="filter-container" data-component-name="App">
          <button 
            className="filter-btn active" 
            data-component-name="FilterButton"
          >
            All
          </button>
          <button 
            className="filter-btn " 
            data-component-name="FilterButton"
          >
            Recent
          </button>
          <button 
            className="filter-btn " 
            data-component-name="FilterButton"
          >
            Popular
          </button>
        </div>
      </header>
      
      {/* Add Video Form Modal - Moved outside the header for better z-index handling */}
      {showAddVideoForm && (
        <div className="add-video-modal" onClick={() => setShowAddVideoForm(false)}>
          <div className="add-video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="add-video-modal-header">
              <h3>Add New Video</h3>
              <button 
                className="close-add-video-modal"
                onClick={() => setShowAddVideoForm(false)}
              >
                &times;
              </button>
            </div>
            <div className="add-video-modal-body">
              <form onSubmit={handleVideoFormSubmit}>
                <div className="form-group">
                  <label htmlFor="video-title">
                    <FontAwesomeIcon icon={faHeading} className="input-icon" />
                    Video Title
                  </label>
                  <input 
                    type="text" 
                    id="video-title" 
                    required 
                    value={videoFormData.title}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="video-description">
                    <FontAwesomeIcon icon={faAlignLeft} className="input-icon" />
                    Description
                  </label>
                  <input 
                    type="text" 
                    id="video-description" 
                    required 
                    value={videoFormData.description}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="video-thumbnail">
                    <FontAwesomeIcon icon={faImage} className="input-icon" />
                    Thumbnail URL
                  </label>
                  <input 
                    type="url" 
                    id="video-thumbnail" 
                    required 
                    value={videoFormData.thumbnail}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="video-previewUrl">
                    <FontAwesomeIcon icon={faFilm} className="input-icon" />
                    Preview Video URL (optional)
                  </label>
                  <input 
                    type="url" 
                    id="video-previewUrl" 
                    value={videoFormData.previewUrl}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="video-videoUrl">
                    <FontAwesomeIcon icon={faVideo} className="input-icon" />
                    Video URL
                  </label>
                  <input 
                    type="url" 
                    id="video-videoUrl" 
                    required 
                    value={videoFormData.videoUrl}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="video-embedUrl">
                    <FontAwesomeIcon icon={faCode} className="input-icon" />
                    Embed URL (optional)
                  </label>
                  <input 
                    type="url" 
                    id="video-embedUrl" 
                    value={videoFormData.embedUrl}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="form-buttons">
                  <button 
                    type="button" 
                    onClick={() => setShowAddVideoForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">Add Video</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
