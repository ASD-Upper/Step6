import { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { videoAPI } from '../services/api';

const VideoContainer = ({ videos, onWatchVideo, onEditVideo, onDeleteVideo, favorites = [], showFavoritesOnly = false, toggleFavorite }) => {
  const [localVideos, setLocalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Only fetch videos if props are empty
  useEffect(() => {
    if (videos && videos.length > 0) {
      setLocalVideos(videos);
      setLoading(false);
    } else if (!videos || videos.length === 0) {
      // Only fetch if videos prop is empty or undefined
      const fetchVideos = async () => {
        try {
          const data = await videoAPI.getAllVideos();
          setLocalVideos(data);
        } catch (err) {
          console.error("Error fetching videos directly:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVideos();
    }
  }, [videos]);

  // Use local videos if available, otherwise use empty array to avoid sample data 
  let displayVideos = localVideos.length > 0 ? localVideos : [];
  
  // Filter by favorites if showFavoritesOnly is true
  if (showFavoritesOnly) {
    displayVideos = displayVideos.filter(video => favorites.includes(video.id));
  }

  if (loading) {
    return <div className="loading">Loading videos...</div>;
  }

  return (
    <div className="container" id="video-container">
      {displayVideos.length === 0 ? (
        <div className="no-videos">
          <h3>{showFavoritesOnly ? "No favorite videos found. Add some favorites to see them here!" : "No videos found. Add some videos to get started!"}</h3>
        </div>
      ) : (
        displayVideos.map(video => (
          <VideoCard 
            key={video.id}
            video={video}
            onWatchVideo={onWatchVideo}
            onEditVideo={onEditVideo}
            onDeleteVideo={onDeleteVideo}
            isFavorite={favorites.includes(video.id)}
            toggleFavorite={toggleFavorite}
          />
        ))
      )}
    </div>
  );
};

const VideoCard = ({ video, onWatchVideo, onEditVideo, onDeleteVideo, isFavorite, toggleFavorite }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [videoSource, setVideoSource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  
  // Normalize previewUrl to always be an array
  const previewUrls = useMemo(() => {
    if (!video.previewUrl) return [];
    if (Array.isArray(video.previewUrl)) return video.previewUrl;
    // Handle comma-separated list of URLs
    if (typeof video.previewUrl === 'string' && video.previewUrl.includes(',')) {
      return video.previewUrl.split(',').map(url => url.trim());
    }
    return [video.previewUrl];
  }, [video.previewUrl]);
  
  // Check if URL is a direct video file
  const isDirectVideoUrl = (url) => {
    if (!url) return false;
    // Common video extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const lowercaseUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercaseUrl.endsWith(ext)) || lowercaseUrl.includes('blob:');
  };

  // Check if URL is a Google Drive preview
  const isGoogleDriveUrl = (url) => {
    return url && url.includes('drive.google.com');
  };
  
  // Convert Google Drive link to direct download if possible
  const getDirectGoogleDriveUrl = (url) => {
    if (!isGoogleDriveUrl(url)) return url;
    
    try {
      const fileId = url.match(/\/d\/([^\/]+)/)?.[1] || 
                    url.match(/id=([^&]+)/)?.[1];
      
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    } catch (e) {
      console.error("Error parsing Google Drive URL:", e);
    }
    
    return url;
  };

  // Cleanup function
  useEffect(() => {
    let videoElement = videoRef.current;
    return () => {
      if (videoElement) {
        // Cancel any pending play operations
        if (videoElement.play && typeof videoElement.play === 'function') {
          videoElement.pause();
        }
      }
    };
  }, []);

  // Reset video source when showPreview changes to false
  useEffect(() => {
    if (!showPreview && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoSource(null);
    }
  }, [showPreview]);

  // When videoSource changes, attempt to play
  useEffect(() => {
    if (videoSource && videoRef.current) {
      let mounted = true;
      
      // Set up event listeners for video loading states
      const handleCanPlay = () => {
        if (mounted) {
          setIsLoading(false);
        }
      };
      
      const handlePlaying = () => {
        if (mounted) {
          setIsLoading(false);
          setIsPlaying(true);
        }
      };
      
      const handlePause = () => {
        if (mounted) {
          setIsPlaying(false);
        }
      };
      
      // Add a fallback timer to clear loading state
      const loadingTimer = setTimeout(() => {
        if (mounted && isLoading) {
          setIsLoading(false);
        }
      }, 5000); // 5 second fallback
      
      // Add event listeners
      const videoElement = videoRef.current;
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('pause', handlePause);
      
      const playVideo = async () => {
        try {
          await videoRef.current.play();
          // We'll let the event listeners handle the loading state
        } catch (error) {
          console.error("Error playing preview:", error);
          if (mounted) {
            tryNextPreview();
          }
        }
      };
      
      playVideo();
      
      return () => {
        mounted = false;
        clearTimeout(loadingTimer);
        
        // Clean up event listeners
        if (videoElement) {
          videoElement.removeEventListener('canplay', handleCanPlay);
          videoElement.removeEventListener('playing', handlePlaying);
          videoElement.removeEventListener('pause', handlePause);
          videoElement.pause();
        }
      };
    }
  }, [videoSource, isLoading]);

  const handleWatch = (e) => {
    e.preventDefault();
    if (video.embedUrl) {
      onWatchVideo(video.title, video.embedUrl);
    }
  };

  // Update videoSource when previewIndex changes
  useEffect(() => {
    if (showPreview && previewUrls.length > 0) {
      const currentUrl = previewUrls[currentPreviewIndex];
      let cleanUrl = currentUrl.replace(/\/$/, '');
      
      // Handle Google Drive URLs
      if (isGoogleDriveUrl(cleanUrl)) {
        cleanUrl = getDirectGoogleDriveUrl(cleanUrl);
      }
      
      // Only set video source for URLs that are likely to be playable
      if (isDirectVideoUrl(cleanUrl)) {
        setVideoSource(cleanUrl);
      } else {
        console.warn("URL doesn't appear to be a direct video file:", cleanUrl);
        // Try next preview or show error
        setTimeout(() => {
          tryNextPreview();
        }, 50);
      }
    }
  }, [currentPreviewIndex, previewUrls, showPreview]);

  // Better detection of mobile devices
  const isMobileDevice = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Start playing video on hover with loading state
  const handleMouseEnter = () => {
    setShowPreview(true);
    if (previewUrls.length > 0) {
      setIsLoading(true);
      setError(null);
      
      // On mobile, we'll show a "Tap to play" message instead of auto-playing
      if (isMobileDevice) {
        setIsLoading(false);
        setError("Tap to play preview");
      }
    } else {
      setError("No preview available");
      setIsLoading(false);
    }
  };

  // Handle tap to play on mobile
  const handleTapToPlay = (e) => {
    if (isMobileDevice && error === "Tap to play preview") {
      e.stopPropagation();
      setError(null);
      setIsLoading(true);
      
      // The videoSource is already set by the useEffect
      // Just need to manually trigger play
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            setIsLoading(false);
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing on mobile:", err);
            if (err.name === "NotAllowedError") {
              setError("Autoplay blocked. Please adjust browser settings.");
            } else {
              tryNextPreview();
            }
          });
      }
    }
  };

  // Handle video error event with more detailed error reporting
  const handleVideoError = (e) => {
    // Get detailed error information when possible
    let errorDetails = "Unknown error";
    
    if (videoRef.current && videoRef.current.error) {
      const videoError = videoRef.current.error;
      switch (videoError.code) {
        case 1: // MEDIA_ERR_ABORTED
          errorDetails = "Playback aborted";
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorDetails = "Network error";
          break;
        case 3: // MEDIA_ERR_DECODE
          errorDetails = "Decoding error";
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorDetails = "Format not supported";
          // Provide more specific info for common issues
          if (videoSource && videoSource.includes('drive.google.com')) {
            errorDetails += " (Google Drive links require special handling)";
          } else if (videoSource && (videoSource.includes('youtube.com') || videoSource.includes('youtu.be'))) {
            errorDetails += " (YouTube videos must be played in an iframe)";
          } else {
            errorDetails += " (This video format can't be played directly)";
          }
          break;
        default:
          errorDetails = `Error code: ${videoError.code}`;
      }
    }
    
    console.error(`Video error for URL ${videoSource}: ${errorDetails}`);
    
    // Try next preview with a slight delay to avoid race conditions
    setTimeout(() => {
      tryNextPreview();
    }, 50);
  };

  // Try to load the next preview URL
  const tryNextPreview = () => {
    if (currentPreviewIndex < previewUrls.length - 1) {
      // Use functional form of setState to avoid race conditions
      setCurrentPreviewIndex(prevIndex => prevIndex + 1);
      setError(null);
    } else {
      // All sources have failed
      let errorMessage = "All preview sources failed to load";
      
      // Add more context for mobile users
      if (isMobileDevice) {
        errorMessage += ". Videos may be blocked by your browser settings.";
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Pause video when mouse leaves
  const handleMouseLeave = () => {
    setShowPreview(false);
    setIsPlaying(false);
  };

  // Reset and try from the first preview URL
  const handleRetry = (e) => {
    e.stopPropagation();
    setCurrentPreviewIndex(0);
    setIsLoading(true);
    setError(null);
  };

  return (
    <div className="video-card">
      <div className="video-actions">
        <button 
          className="edit-video-btn" 
          title="Edit Video"
          onClick={() => onEditVideo(video)}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button 
          className="delete-video-btn" 
          title="Delete Video"
          onClick={() => onDeleteVideo(video.id)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button 
          className={`favorite-video-btn ${isFavorite ? 'favorite' : ''}`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          onClick={() => toggleFavorite(video.id)}
        >
          <FontAwesomeIcon icon={isFavorite ? fasStar : farStar} />
        </button>
      </div>
      
      <div 
        className="thumbnail-container" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTapToPlay}
        role="button"
        tabIndex={0}
        aria-label={`Preview ${video.title}`}
      >
        {showPreview && previewUrls.length > 0 ? (
          <>
            {isLoading && !isPlaying && (
              <div className="video-loading">
                <div className="loading-spinner"></div>
                <span>Loading preview... ({currentPreviewIndex + 1}/{previewUrls.length})</span>
              </div>
            )}
            {error && (
              <div className={`video-error ${error === "Tap to play preview" ? "tap-to-play" : ""}`}>
                <span>{error}</span>
                {error !== "Tap to play preview" && (
                  <button 
                    className="retry-button"
                    onClick={handleRetry}
                  >
                    Retry All Sources
                  </button>
                )}
              </div>
            )}
            {videoSource && (
              <video 
                ref={videoRef}
                className="video-preview"
                src={videoSource}
                muted
                loop
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                onError={handleVideoError}
              />
            )}
          </>
        ) : showPreview && video.embedUrl ? (
          // Always show iframe option if direct video preview fails
          <div className="video-preview">
            <iframe 
              src={video.embedUrl.includes('?') ? `${video.embedUrl}&autoplay=1` : `${video.embedUrl}?autoplay=1`} 
              title={`${video.title} Preview`}
              frameBorder="0" 
              allowFullScreen
              aria-label={`${video.title} preview`}
              allow="autoplay"
            ></iframe>
          </div>
        ) : (
          <img
            src={video.thumbnail}
            alt={`${video.title} thumbnail`}
            className="thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x180?text=Video+Thumbnail+Not+Available';
            }}
          />
        )}
      </div>
      
      <div className="video-content">
        <h2 className="video-title">{video.title}</h2>
        <p className="video-description">{video.description}</p>
        
        <div className="video-links">
          <a
            href={video.videoUrl}
            className="video-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch Now
          </a>
          
          {video.externalUrl && (
            <a
              href={video.externalUrl}
              className="video-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Now
            </a>
          )}
          
          {video.embedUrl && (
            <a
              href="#"
              className="video-link watch-embed"
              onClick={handleWatch}
            >
              Watch Here
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoContainer;
