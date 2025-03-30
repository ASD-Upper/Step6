import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import AddVideoSection from './components/AddVideoSection'
import VideoContainer from './components/VideoContainer'
import VideoModal from './components/VideoModal'
import EditModal from './components/EditModal'
import DeveloperDashboard from './components/DeveloperDashboard'
import { videoAPI } from './services/api'
import './App.css'
import './components/DeveloperDashboard.css'

function App() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', tag: 'all' });
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteVideos');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [videoModalData, setVideoModalData] = useState({ 
    show: false, 
    title: '', 
    url: '',
    isPreview: false
  });
  const [currentEditingVideo, setCurrentEditingVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  // Fetch videos from API on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Fetch videos from the API
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videoAPI.getAllVideos();
      // Sort videos by order field
      const sortedVideos = [...data].sort((a, b) => {
        const aOrder = parseInt(a.order) || 0;
        const bOrder = parseInt(b.order) || 0;
        return aOrder - bOrder;
      });
      setVideos(sortedVideos);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save videos
  const saveVideos = async (updatedVideos) => {
    try {
      setVideos(updatedVideos);
    } catch (err) {
      console.error("Error saving videos:", err);
    }
  };

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favoriteVideos', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (videoId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(videoId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId];
      return newFavorites;
    });
  };

  // Toggle show favorites only
  const toggleShowFavoritesOnly = () => {
    setShowFavoritesOnly(prev => !prev);
  };

  // Toggle theme (dark/light)
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Filter videos based on search and tag
  const getFilteredVideos = () => {
    let filteredVideos = videos.filter(video => {
      const matchesSearch = filters.search === '' || 
        video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        video.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesTag = filters.tag === 'all' || 
        (filters.tag === 'recent' && isRecent(video.createdAt)) ||
        (filters.tag === 'popular' && isPopular(video));
      
      return matchesSearch && matchesTag;
    });

    // Sort by order field
    return filteredVideos.sort((a, b) => {
      const aOrder = parseInt(a.order) || 0;
      const bOrder = parseInt(b.order) || 0;
      return aOrder - bOrder;
    });
  };

  // Check if a video is recent (within the last 7 days)
  const isRecent = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Check if a video is popular (top 25% by view count)
  const isPopular = (video) => {
    const sortedVideos = [...videos].sort((a, b) => b.viewCount - a.viewCount);
    const topIndex = Math.ceil(sortedVideos.length * 0.25);
    return sortedVideos.indexOf(video) < topIndex;
  };

  // Add a new video
  const addVideo = async (videoData) => {
    try {
      const newVideo = await videoAPI.createVideo(videoData);
      setVideos([...videos, newVideo]);
    } catch (err) {
      console.error("Error adding video:", err);
    }
  };

  // Edit a video
  const editVideo = async (editedVideo) => {
    try {
      const updatedVideo = await videoAPI.updateVideo(editedVideo.id, editedVideo);
      const updatedVideos = videos.map(video => 
        video.id === updatedVideo.id ? updatedVideo : video
      );
      setVideos(updatedVideos);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating video:", err);
    }
  };

  // Delete a video
  const deleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoAPI.deleteVideo(videoId);
        const updatedVideos = videos.filter(video => video.id !== videoId);
        setVideos(updatedVideos);
      } catch (err) {
        console.error("Error deleting video:", err);
      }
    }
  };

  // Handle watching a video
  const watchVideo = async (title, url, isPreview = false) => {
    setVideoModalData({ show: true, title, url, isPreview });
    
    // If not in preview mode, increment view count
    if (!isPreview) {
      const video = videos.find(v => v.embedUrl === url);
      if (video) {
        try {
          await videoAPI.incrementViewCount(video.id);
          // Update local state with new view count
          const updatedVideos = videos.map(v => 
            v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v
          );
          setVideos(updatedVideos);
        } catch (err) {
          console.error("Error incrementing view count:", err);
        }
      }
    }
  };

  // Handle closing video modal
  const closeVideoModal = () => {
    setVideoModalData({ show: false, title: '', url: '', isPreview: false });
  };

  // Handle opening edit modal
  const openEditModal = (video) => {
    setCurrentEditingVideo(video);
    setShowEditModal(true);
  };

  // Handle scroll
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrolledToBottom = Math.ceil(scrollTop + windowHeight) >= documentHeight - 10;
    
    // Only update if the state needs to change
    if (scrolledToBottom !== isAtBottom) {
      setIsAtBottom(scrolledToBottom);
    }

    // Handle header visibility - only show at top, hide when scrolling down
    const isAtTop = scrollTop <= 15; // User is very near top
    const isScrollingDown = scrollTop > lastScrollTop;

    if (isScrollingDown && !isAtTop && isHeaderVisible) {
      // Scrolling down - hide header
      setIsHeaderVisible(false);
    } else if (isAtTop && !isHeaderVisible) {
      // At top - show header
      setIsHeaderVisible(true);
    }
    
    setLastScrollTop(scrollTop);
  };

  // Add scroll event listener with throttling
  useEffect(() => {
    let scrollTimeout;
    
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 25); // Increased delay for smoother, slower operation
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollTop, isHeaderVisible, isAtBottom]);

  // Toggle scroll position
  const toggleScroll = () => {
    if (isAtBottom) {
      // Currently at bottom, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAtBottom(false);
    } else {
      // Currently at top, scroll to bottom
      window.scrollTo({ 
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      setIsAtBottom(true);
    }
  };

  // Load initial data
  useEffect(() => {
    // This is left for backward compatibility. In production, you'd remove this.
    if (videos.length === 0 && !isLoading && !error) {
      fetchVideos();
    }
  }, [videos.length, isLoading, error]);

  return (
    <>
      <div className="app-container" data-theme={currentTheme} data-component-name="App">
        <Header 
          currentTheme={currentTheme}
          toggleTheme={toggleTheme}
          onSearch={(query) => setFilters({ ...filters, search: query })}
          favorites={favorites}
          showFavoritesOnly={showFavoritesOnly}
          toggleShowFavoritesOnly={toggleShowFavoritesOnly}
          isVisible={isHeaderVisible}
          data-component-name="Header"
        />
        
        <VideoContainer 
          videos={getFilteredVideos()} 
          onWatchVideo={watchVideo}
          onEditVideo={openEditModal}
          onDeleteVideo={deleteVideo}
          favorites={favorites}
          showFavoritesOnly={showFavoritesOnly}
          toggleFavorite={toggleFavorite}
          data-component-name="VideoContainer"
        />
        
        {videoModalData.show && (
          <VideoModal 
            title={videoModalData.title} 
            url={videoModalData.url}
            isPreview={videoModalData.isPreview}
            onClose={closeVideoModal} 
            data-component-name="VideoModal"
          />
        )}
        
        {showEditModal && (
          <EditModal 
            video={currentEditingVideo}
            onSave={editVideo}
            onClose={() => setShowEditModal(false)}
            data-component-name="EditModal"
          />
        )}
        
        <button 
          id="scroll-button" 
          onClick={toggleScroll} 
          className={isAtBottom ? 'at-bottom' : ''}
          title={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
          data-component-name="ScrollButton"
        >
          <FontAwesomeIcon icon={faArrowUp} />
          {isAtBottom ? 'Top' : 'Bottom'}
        </button>

        <DeveloperDashboard 
          videos={videos}
          setVideos={setVideos}
          onSaveVideos={saveVideos}
          currentTheme={currentTheme}
          onThemeChange={toggleTheme}
          data-component-name="DeveloperDashboard"
        />
      </div>
    </>
  )
}

export default App
