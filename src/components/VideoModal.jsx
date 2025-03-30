import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faExpand, faCog, faShareAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

const VideoModal = ({ title, url, isPreview = false, onClose }) => {
  const [theaterMode, setTheaterMode] = useState(false);
  const modalRef = useRef(null);
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    // Handle clicks outside modal content to close
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalContentRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Toggle theater mode
  const toggleTheaterMode = () => {
    setTheaterMode(!theaterMode);
  };

  // Handle fullscreen
  const requestFullscreen = () => {
    const element = isPreview ? videoRef.current : iframeRef.current;
    if (!element) return;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
  };

  // Handle share
  const shareVideo = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      })
      .catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.log('Error copying to clipboard:', err));
    }
  };

  return (
    <div 
      className={`modal ${theaterMode ? 'theater-mode' : ''}`} 
      style={{ display: 'block' }}
      ref={modalRef}
    >
      <div className="modal-content" ref={modalContentRef}>
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <span className="close-modal" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </span>
        </div>
        
        <div className="modal-controls">
          <button id="theater-mode-btn" onClick={toggleTheaterMode}>
            <FontAwesomeIcon icon={faTv} /> Theater Mode
          </button>
          <button id="fullscreen-btn" onClick={requestFullscreen}>
            <FontAwesomeIcon icon={faExpand} /> Fullscreen
          </button>
          <button id="quality-btn">
            <FontAwesomeIcon icon={faCog} /> Quality
          </button>
          <button id="share-btn" onClick={shareVideo}>
            <FontAwesomeIcon icon={faShareAlt} /> Share
          </button>
          <span className="quality-badge">HD</span>
        </div>
        
        <div className="iframe-container">
          {isPreview ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              className="video-preview"
              src={url}
              title={title}
            />
          ) : (
            <iframe
              ref={iframeRef}
              id="video-iframe"
              src={url}
              allowFullScreen={true}
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
