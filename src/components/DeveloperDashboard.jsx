import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCode, faLayerGroup, faPaintBrush, faTimes, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const DeveloperDashboard = ({ 
  videos, 
  setVideos, 
  onSaveVideos, 
  currentTheme, 
  onThemeChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editedCode, setEditedCode] = useState('');

  const components = [
    { name: 'App', file: 'App.jsx', description: 'Main application component' },
    { name: 'Header', file: 'components/Header.jsx', description: 'App header with navigation' },
    { name: 'VideoContainer', file: 'components/VideoContainer.jsx', description: 'Grid display of videos' },
    { name: 'VideoCard', file: 'components/VideoContainer.jsx', description: 'Individual video card with preview' },
    { name: 'UploadSection', file: 'components/UploadSection.jsx', description: 'File upload component' },
    { name: 'AddVideoSection', file: 'components/AddVideoSection.jsx', description: 'Add videos form' },
    { name: 'VideoModal', file: 'components/VideoModal.jsx', description: 'Modal for watching videos' }
  ];

  const cssFiles = [
    { name: 'App.css', description: 'Main application styles' },
    { name: 'Header.css', description: 'Header component styles' },
    { name: 'index.css', description: 'Global styles' }
  ];

  const toggleDashboard = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectComponent = (component) => {
    setSelectedComponent(component);
    setEditedCode('// Edit code for ' + component.name);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedComponent(null);
  };

  const mockSaveChanges = () => {
    alert('In a real implementation, this would save changes to the file: ' + 
          (selectedComponent ? selectedComponent.file : 'No file selected'));
  };

  // Function to modify preview URLs in sample data
  const updatePreviewUrls = () => {
    const updatedVideos = videos.map(video => ({
      ...video,
      previewUrl: video.embedUrl ? `${video.embedUrl}#preview` : null
    }));
    
    setVideos(updatedVideos);
    onSaveVideos(updatedVideos);
    alert('Preview URLs updated for all videos');
  };

  return (
    <div className={`dev-dashboard ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="dashboard-toggle" onClick={toggleDashboard}>
        <FontAwesomeIcon icon={faCog} />
        <span>Dev Tools</span>
        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronUp} />
      </div>
      
      {isExpanded && (
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2>Developer Dashboard</h2>
            <button className="close-dashboard" onClick={toggleDashboard}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="dashboard-tabs">
            <button 
              className={activeTab === 'components' ? 'active' : ''} 
              onClick={() => handleTabChange('components')}
            >
              <FontAwesomeIcon icon={faLayerGroup} /> Components
            </button>
            <button 
              className={activeTab === 'styles' ? 'active' : ''} 
              onClick={() => handleTabChange('styles')}
            >
              <FontAwesomeIcon icon={faPaintBrush} /> Styles
            </button>
            <button 
              className={activeTab === 'tools' ? 'active' : ''} 
              onClick={() => handleTabChange('tools')}
            >
              <FontAwesomeIcon icon={faCode} /> Tools
            </button>
          </div>
          
          <div className="dashboard-main">
            {activeTab === 'components' && (
              <div className="components-list">
                <h3>React Components</h3>
                <ul>
                  {components.map((component) => (
                    <li 
                      key={component.name}
                      className={selectedComponent?.name === component.name ? 'selected' : ''}
                      onClick={() => handleSelectComponent(component)}
                    >
                      <span className="component-name">{component.name}</span>
                      <span className="component-path">{component.file}</span>
                      <p className="component-desc">{component.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'styles' && (
              <div className="styles-list">
                <h3>CSS Files</h3>
                <ul>
                  {cssFiles.map((file) => (
                    <li 
                      key={file.name}
                      className={selectedComponent?.name === file.name ? 'selected' : ''}
                      onClick={() => handleSelectComponent(file)}
                    >
                      <span className="file-name">{file.name}</span>
                      <p className="file-desc">{file.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'tools' && (
              <div className="tools-section">
                <h3>Development Tools</h3>
                <div className="tool-box">
                  <div className="tool-card">
                    <h4>Video Preview Settings</h4>
                    <p>Modify how video previews work on hover</p>
                    <button onClick={updatePreviewUrls}>
                      Update Preview URLs
                    </button>
                  </div>
                  
                  <div className="tool-card">
                    <h4>Theme Testing</h4>
                    <p>Current theme: {currentTheme}</p>
                    <button onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}>
                      Toggle Theme
                    </button>
                  </div>
                  
                  <div className="tool-card">
                    <h4>Local Storage</h4>
                    <p>Manage application data</p>
                    <button onClick={() => console.log('Videos data:', videos)}>
                      Log Videos Data
                    </button>
                    <button onClick={() => {
                      if (confirm('Clear all data? This cannot be undone.')) {
                        localStorage.clear();
                        alert('Local storage cleared. Reload the page to reset.');
                      }
                    }}>
                      Clear Storage
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedComponent && (
              <div className="code-editor">
                <h3>Editing {selectedComponent.name}</h3>
                <textarea 
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  rows={10}
                  placeholder="Edit component code here"
                />
                <div className="editor-actions">
                  <button onClick={mockSaveChanges}>Save Changes</button>
                  <button onClick={() => setSelectedComponent(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
