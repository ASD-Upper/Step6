import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faVideo, 
  faPlus, 
  faHome, 
  faSignOutAlt, 
  faEye, 
  faChartLine,
  faFilter,
  faSync,
  faExclamationTriangle,
  faSun,
  faMoon,
  faSort
} from '@fortawesome/free-solid-svg-icons';
import { videoAPI } from '../services/api';
import VideoList from './VideoList';
import VideoForm from './VideoForm';
import VideoReorder from './VideoReorder';
import './AdminStyles.css';

const AdminDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    recentlyAdded: 0,
    categories: {}
  });
  const [filter, setFilter] = useState({
    search: '',
    sortBy: 'newest'
  });
  const [serverInfo, setServerInfo] = useState({
    url: '',
    version: '',
    itemCount: 0
  });
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteVideos');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
    fetchServerInfo();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      calculateStats();
      applyFilters();
    }
  }, [videos, filter]);

  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme') || 'dark';
      setCurrentTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial setup

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteVideos', JSON.stringify(favorites));
  }, [favorites]);

  const fetchServerInfo = async () => {
    try {
      // Use the same API URL as defined in our api.js
      const apiUrl = 'http://localhost:3004';
      
      // Get server info from our videos endpoint
      const response = await videoAPI.getAllVideos();
      
      setServerInfo({
        url: apiUrl,
        version: 'JSON Server 1.0+',
        itemCount: response.length
      });
    } catch (err) {
      console.error('Error fetching server info:', err);
      // Don't show error UI for server info - it's not critical
      setServerInfo({
        url: 'http://localhost:3004',
        version: 'Unknown',
        itemCount: videos.length
      });
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoAPI.getAllVideos();
      // Sort videos by order field
      const sortedVideos = [...data].sort((a, b) => {
        const aOrder = parseInt(a.order) || 0;
        const bOrder = parseInt(b.order) || 0;
        return aOrder - bOrder;
      });
      
      setVideos(sortedVideos);
      setFilteredVideos(sortedVideos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
    const recentlyAdded = videos.filter(v => new Date(v.createdAt) > oneWeekAgo).length;
    
    // Count videos by description (category)
    const categories = {};
    videos.forEach(video => {
      const category = video.description || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    setStats({
      totalVideos: videos.length,
      totalViews,
      recentlyAdded,
      categories
    });
  };

  const applyFilters = () => {
    let result = [...videos];
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        video => 
          video.title?.toLowerCase().includes(searchLower) || 
          video.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    switch(filter.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'views':
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'order':
        result.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
        break;
      default:
        // Default to order-based sorting
        result.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
        break;
    }
    
    setFilteredVideos(result);
  };

  const handleSearchChange = (e) => {
    setFilter({...filter, search: e.target.value});
  };
  
  const handleSortChange = (e) => {
    setFilter({...filter, sortBy: e.target.value});
  };

  const handleAddVideo = async (videoData) => {
    try {
      setLoading(true);
      // Add current timestamp and set initial view count
      const newVideoData = {
        ...videoData,
        createdAt: new Date().toISOString(),
        viewCount: 0
      };
      const newVideo = await videoAPI.createVideo(newVideoData);
      setVideos([...videos, newVideo]);
      navigate('/admin/videos');
    } catch (err) {
      setError('Failed to add video. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = async (id, videoData) => {
    try {
      setLoading(true);
      const updatedVideo = await videoAPI.updateVideo(id, videoData);
      setVideos(videos.map(video => 
        video.id === id ? updatedVideo : video
      ));
      navigate('/admin/videos');
    } catch (err) {
      setError('Failed to update video. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        setLoading(true);
        await videoAPI.deleteVideo(id);
        setVideos(videos.filter(video => video.id !== id));
      } catch (err) {
        setError('Failed to delete video. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleFavorite = (videoId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(videoId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId];
      return newFavorites;
    });
  };

  const toggleShowFavoritesOnly = () => {
    setShowFavoritesOnly(prev => !prev);
  };

  if (error && loading) {
    return (
      <div className="admin-error">
        <h2><FontAwesomeIcon icon={faExclamationTriangle} /> Error</h2>
        <p>{error}</p>
        <button onClick={fetchVideos} className="admin-btn">
          <FontAwesomeIcon icon={faSync} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" data-theme={currentTheme}>
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>
            <FontAwesomeIcon icon={faTachometerAlt} />
            Admin Panel
          </h2>
          <button 
            className="admin-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
          >
            <FontAwesomeIcon icon={currentTheme === 'light' ? faMoon : faSun} />
          </button>
        </div>
        <nav className="admin-nav">
          <ul>
            <li>
              <Link to="/admin" className="admin-nav-link">
                <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/videos" className="admin-nav-link">
                <FontAwesomeIcon icon={faVideo} /> Videos
              </Link>
            </li>
            <li>
              <Link to="/admin/videos/add" className="admin-nav-link">
                <FontAwesomeIcon icon={faPlus} /> Add Video
              </Link>
            </li>
            <li>
              <Link to="/admin/videos/reorder" className="admin-nav-link">
                <FontAwesomeIcon icon={faSort} /> Reorder Videos
              </Link>
            </li>
            <li className="admin-nav-divider"></li>
            <li>
              <Link to="/" className="admin-nav-link">
                <FontAwesomeIcon icon={faHome} /> View Site
              </Link>
            </li>
            <li>
              <Link to="/" className="admin-nav-link admin-logout">
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="server-info">
          <h3>JSON Server Status</h3>
          <div className="server-info-item">
            <span>Status:</span> 
            <span className="status-badge online">Online</span>
          </div>
          <div className="server-info-item">
            <span>Endpoint:</span> 
            <span>{serverInfo.url || 'http://localhost:3002'}</span>
          </div>
          <div className="server-info-item">
            <span>Videos:</span> 
            <span>{videos.length} items</span>
          </div>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Video Collection Dashboard</h1>
        </div>
        
        {loading && <div className="admin-loading">Loading...</div>}
        
        <Routes>
          <Route path="/" element={
            <div className="admin-welcome">
              <h2>Welcome to Admin Dashboard</h2>
              <p>Manage your video collection easily with this dashboard.</p>
              
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faVideo} />
                  </div>
                  <div className="stat-content">
                    <h3>Total Videos</h3>
                    <p className="admin-stat-number">{stats.totalVideos}</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <div className="stat-content">
                    <h3>Total Views</h3>
                    <p className="admin-stat-number">{stats.totalViews}</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faPlus} />
                  </div>
                  <div className="stat-content">
                    <h3>Recently Added</h3>
                    <p className="admin-stat-number">{stats.recentlyAdded}</p>
                    <small>Last 7 days</small>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <div className="stat-content">
                    <h3>Categories</h3>
                    <p className="admin-stat-number">{Object.keys(stats.categories).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="admin-actions">
                <Link to="/admin/videos" className="admin-btn admin-btn-primary">
                  <FontAwesomeIcon icon={faVideo} /> Manage Videos
                </Link>
                <Link to="/admin/videos/add" className="admin-btn admin-btn-secondary">
                  <FontAwesomeIcon icon={faPlus} /> Add New Video
                </Link>
              </div>
              
              <div className="admin-recent-videos">
                <h3>Recent Videos</h3>
                <div className="admin-recent-videos-list">
                  {videos.slice(0, 5).map(video => (
                    <div key={video.id} className="admin-recent-video-item">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="admin-recent-video-thumbnail" 
                      />
                      <div className="admin-recent-video-info">
                        <h4>{video.title}</h4>
                        <p>{video.description}</p>
                        <small>Added: {new Date(video.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />
          
          <Route path="/videos" element={
            <VideoList 
              videos={filteredVideos} 
              onDelete={handleDeleteVideo} 
              loading={loading}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              showFavoritesOnly={showFavoritesOnly}
              toggleShowFavoritesOnly={toggleShowFavoritesOnly}
            />
          } />
          
          <Route path="/videos/add" element={
            <VideoForm onSubmit={handleAddVideo} />
          } />
          
          <Route path="/videos/edit/:id" element={
            <VideoForm 
              videos={videos} 
              onSubmit={handleEditVideo} 
              isEditMode 
            />
          } />

          <Route path="/videos/reorder" element={
            <VideoReorder />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
