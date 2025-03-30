import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const UploadSection = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileInfo, setFileInfo] = useState('');
  const fileInputRef = useRef(null);
  const [fileCards, setFileCards] = useState([]);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    
    if (files.length > 0) {
      setSelectedFiles(Array.from(files));
      setFileInfo(`${files.length} file(s) selected`);
      processFiles(files);
    } else {
      setSelectedFiles([]);
      setFileInfo('');
      setFileCards([]);
    }
  };

  const processFiles = (files) => {
    const newFileCards = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type || 'Unknown',
      size: formatFileSize(file.size),
      file: file
    }));
    
    setFileCards(newFileCards);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="upload-section">
      <label htmlFor="file-input" id="custom-upload-btn" onClick={handleUploadClick}>
        <FontAwesomeIcon icon={faUpload} /> Upload Files
      </label>
      <input 
        type="file" 
        id="file-input" 
        ref={fileInputRef}
        multiple 
        onChange={handleFileSelect} 
      />
      {fileInfo && <p id="file-info">{fileInfo}</p>}
      
      {fileCards.length > 0 && (
        <div className="container" id="file-container" style={{ padding: '8px 0' }}>
          {fileCards.map(fileCard => (
            <FileCard key={fileCard.id} fileData={fileCard} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileCard = ({ fileData }) => {
  const [preview, setPreview] = useState(null);

  // Create file preview based on type
  useState(() => {
    if (fileData.file) {
      if (fileData.file.type.startsWith('image/')) {
        setPreview(
          <img 
            src={URL.createObjectURL(fileData.file)} 
            alt={fileData.name} 
            style={{ width: '100%', borderRadius: '6px', marginTop: '8px' }} 
          />
        );
      } else if (fileData.file.type.startsWith('video/')) {
        setPreview(
          <video 
            controls 
            src={URL.createObjectURL(fileData.file)} 
            style={{ width: '100%', marginTop: '8px' }} 
          />
        );
      } else if (fileData.file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(
            <pre style={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: '8px', 
              borderRadius: '4px', 
              marginTop: '8px',
              color: '#fff',
              overflowX: 'auto',
              fontSize: '0.8rem'
            }}>
              {reader.result.substring(0, 500) + (reader.result.length > 500 ? '...' : '')}
            </pre>
          );
        };
        reader.readAsText(fileData.file);
      } else {
        setPreview(
          <p style={{ color: '#ff0066', marginTop: '8px', fontSize: '0.85rem' }}>
            Preview not available for this file type.
          </p>
        );
      }
    }
  }, [fileData.file]);

  return (
    <div className="file-card" style={{ width: '260px', padding: '12px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{fileData.name}</h3>
      <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>Type: {fileData.type}</p>
      <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>Size: {fileData.size}</p>
      {preview}
    </div>
  );
};

export default UploadSection;
