import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faSort, 
  faSortUp, 
  faSortDown, 
  faSearch, 
  faEye,
  faStar,
  faFilter,
  faCalendar,
  faPlus,
  faFileExport,
  faFileImport,
  faListUl,
  faGripHorizontal,
  faChevronDown,
  faChevronUp,
  faColumns,
  faShare,
  faInfoCircle,
  faTimes,
  faCheck,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import './VideoList.css';

const VideoList = ({ 
  videos, 
  onDelete, 
  loading,
  favorites = [], 
  showFavoritesOnly,
  toggleFavorite,
  toggleShowFavoritesOnly 
}) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewVideo, setCurrentPreviewVideo] = useState(null);
  const [shareTooltipVisible, setShareTooltipVisible] = useState(null);
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;

  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Extract all categories from videos
  const allCategories = useMemo(() => {
    const categories = new Set();
    videos.forEach(video => {
      if (video.category) {
        categories.add(video.category);
      }
    });
    return Array.from(categories);
  }, [videos]);

  // Close preview modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setPreviewModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Hide share tooltip after 2 seconds
  useEffect(() => {
    if (shareTooltipVisible) {
      const timer = setTimeout(() => {
        setShareTooltipVisible(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shareTooltipVisible]);

  // Sort videos by order field
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const aOrder = parseInt(a.order) || 0;
      const bOrder = parseInt(b.order) || 0;
      return aOrder - bOrder;
    });
  }, [videos]);

  // Filter videos based on favorites if needed
  const displayedVideos = useMemo(() => {
    if (showFavoritesOnly) {
      return sortedVideos.filter(video => favorites.includes(video.id));
    }
    return sortedVideos;
  }, [sortedVideos, showFavoritesOnly, favorites]);

  // Handle sort column click
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Toggle show favorites only function
  const handleToggleFavorites = () => {
    if (typeof toggleShowFavoritesOnly === 'function') {
      toggleShowFavoritesOnly();
    }
  };

  // Toggle category filter
  const toggleCategoryFilter = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Toggle view mode (grid/list)
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    setCurrentPage(1); // Reset to first page when changing view mode
  };

  // Handle bulk selection
  const toggleSelectVideo = (videoId) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  // Select/deselect all videos
  const toggleSelectAll = () => {
    if (selectedVideos.length === paginatedVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(paginatedVideos.map(video => video.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedVideos.length} videos?`)) {
      // Call the delete function for each selected video
      selectedVideos.forEach(id => onDelete(id));
      setSelectedVideos([]);
      setBulkActionOpen(false);
    }
  };

  // Open video preview modal
  const handlePreviewVideo = (video) => {
    setCurrentPreviewVideo(video);
    setPreviewModalOpen(true);
  };

  // Close video preview modal
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewVideo(null);
  };

  // Share video (copy link to clipboard)
  const handleShareVideo = (video) => {
    // Create a shareable link to the video
    const shareableLink = `${window.location.origin}/videos/${video.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        // Show success tooltip with the video id
        setShareTooltipVisible(video.id);
      })
      .catch(err => {
        console.error('Could not copy link: ', err);
        alert('Failed to copy link. Please try again.');
      });
  };

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    return displayedVideos
    .filter(video => {
        // Text search match
        const matchesSearch = 
          video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter match
        const matchesCategory = 
          selectedCategories.length === 0 || 
          (video.category && selectedCategories.includes(video.category));
        
        return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'order') {
        const aOrder = parseInt(a.order) || 0;
        const bOrder = parseInt(b.order) || 0;
        return sortDirection === 'asc' ? aOrder - bOrder : bOrder - aOrder;
      }

      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortField === 'viewCount' || sortField === 'id') {
        return sortDirection === 'asc' 
          ? Number(aValue) - Number(bValue) 
          : Number(bValue) - Number(aValue);
      }
      
      if (sortDirection === 'asc') {
          return String(aValue).localeCompare(String(bValue));
      } else {
          return String(bValue).localeCompare(String(aValue));
      }
    });
  }, [displayedVideos, searchTerm, sortField, sortDirection, selectedCategories]);

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + itemsPerPage);

  // Get sort icon for column
  const getSortIcon = (field) => {
    if (field !== sortField) return <FontAwesomeIcon icon={faSort} />;
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} /> 
      : <FontAwesomeIcon icon={faSortDown} />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format views count
  const formatViews = (count) => {
    if (!count) return '0';
    return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="admin-videos-container" data-theme={currentTheme}>
      {/* Page Header with Actions */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2><FontAwesomeIcon icon={faColumns} /> Videos</h2>
          <span className="video-count">{filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="admin-header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FontAwesomeIcon icon={faGripHorizontal} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
          </div>
          
          <div className="admin-action-buttons">
          <button
            className={`admin-btn admin-btn-secondary ${showFavoritesOnly ? 'active' : ''}`}
            onClick={toggleShowFavoritesOnly}
          >
              <FontAwesomeIcon icon={faStar} /> {showFavoritesOnly ? 'All Videos' : 'Favorites'}
            </button>
            
            {selectedVideos.length > 0 && (
              <div className="bulk-actions">
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setBulkActionOpen(!bulkActionOpen)}
                >
                  Bulk Actions ({selectedVideos.length}) <FontAwesomeIcon icon={faChevronDown} />
                </button>
                
                {bulkActionOpen && (
                  <div className="bulk-actions-dropdown">
                    <button className="bulk-action-btn" onClick={handleBulkDelete}>
                      <FontAwesomeIcon icon={faTrash} /> Delete Selected
                    </button>
                    <button className="bulk-action-btn">
                      <FontAwesomeIcon icon={faFileExport} /> Export Selected
          </button>
                  </div>
                )}
              </div>
            )}
            
            <Link to="/admin/videos/reorder" className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faSort} /> Reorder
            </Link>
            
          <Link to="/admin/videos/add" className="admin-btn admin-btn-primary">
              <FontAwesomeIcon icon={faPlus} /> Add Video
          </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search videos by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
      </div>

        <div className="filter-actions">
          <button 
            className={`filter-toggle ${advancedFiltersOpen ? 'active' : ''}`}
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
          >
            <FontAwesomeIcon icon={faFilter} /> 
            Filters 
            <FontAwesomeIcon icon={advancedFiltersOpen ? faChevronUp : faChevronDown} />
          </button>
          
          <div className="sort-dropdown">
            <label htmlFor="sortBy">Sort:</label>
            <select 
              id="sortBy"
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Date Added</option>
              <option value="title">Title</option>
              <option value="viewCount">Views</option>
              <option value="order">Custom Order</option>
              {allCategories.length > 0 && <option value="category">Category</option>}
            </select>
            <button 
              className="sort-direction" 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            >
              <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Panel */}
      {advancedFiltersOpen && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              {allCategories.length > 0 ? (
                allCategories.map(category => (
                  <button 
                    key={category}
                    className={`category-badge ${selectedCategories.includes(category) ? 'active' : ''}`}
                    onClick={() => toggleCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))
              ) : (
                <p className="no-categories">No categories found</p>
              )}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Date Range</h3>
            <div className="date-filters">
              <div className="date-filter">
                <label>From:</label>
                <input type="date" className="date-input" />
              </div>
              <div className="date-filter">
                <label>To:</label>
                <input type="date" className="date-input" />
              </div>
            </div>
          </div>
          
          <button className="clear-filters" onClick={() => {
            setSelectedCategories([]);
            setSearchTerm('');
          }}>
            Clear All Filters
          </button>
        </div>
      )}
      
      {/* No Results State */}
      {filteredVideos.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <h3>No videos found</h3>
          <p>Try adjusting your search or filter criteria</p>
          {(searchTerm || selectedCategories.length > 0) && (
            <button className="admin-btn admin-btn-secondary" onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
            }}>
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      {/* Videos Grid/List View */}
      {filteredVideos.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            // Grid View
            <div className="videos-grid">
        {paginatedVideos.map(video => (
                <div key={video.id} className={`video-card ${selectedVideos.includes(video.id) ? 'selected' : ''}`}>
                  <div className="video-select">
                    <input 
                      type="checkbox" 
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => toggleSelectVideo(video.id)}
                    />
                  </div>
                  
                  <div className="video-thumbnail">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                }}
              />
                    <div className="video-overlay">
                      <div className="video-actions">
                        <Link to={`/admin/videos/edit/${video.id}`} className="video-action-btn edit-btn">
                          <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button 
                  onClick={() => onDelete(video.id)} 
                          className="video-action-btn delete-btn"
                >
                          <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={() => toggleFavorite(video.id)}
                          className={`video-action-btn favorite-btn ${favorites.includes(video.id) ? 'favorited' : ''}`}
                >
                  <FontAwesomeIcon icon={favorites.includes(video.id) ? faStar : farStar} />
                </button>
              </div>
            </div>
                    
                    {video.viewCount > 0 && (
                      <div className="video-views">
                        <FontAwesomeIcon icon={faEye} /> {formatViews(video.viewCount)}
                      </div>
                    )}
                  </div>
                  
                  <div className="video-info">
                    <h3 className="video-title" title={video.title}>{video.title}</h3>
                    
                    <div className="video-meta">
                      {video.category && (
                        <span className="video-category">{video.category}</span>
                      )}
                      <span className="video-date">
                        <FontAwesomeIcon icon={faCalendar} /> {formatDate(video.createdAt)}
                      </span>
                    </div>
                    
                    <p className="video-description">{video.description}</p>
                    
                    <div className="video-card-actions">
                      <Link to={`/admin/videos/edit/${video.id}`} className="admin-btn admin-btn-sm admin-btn-primary">
                        Edit
                      </Link>
                      <button 
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="Preview Video"
                        onClick={() => handlePreviewVideo(video)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <div className="share-btn-container">
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          title="Share Video"
                          onClick={() => handleShareVideo(video)}
                        >
                          <FontAwesomeIcon icon={faShare} />
                        </button>
                        {shareTooltipVisible === video.id && (
                          <div className="share-tooltip">
                            <FontAwesomeIcon icon={faCheck} /> Link copied!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="videos-table-container">
              <table className="videos-table">
                <thead>
                  <tr>
                    <th className="select-all">
                      <input 
                        type="checkbox" 
                        checked={paginatedVideos.length > 0 && selectedVideos.length === paginatedVideos.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="thumbnail-col">Thumbnail</th>
                    <th 
                      className="title-col sortable"
                      onClick={() => handleSort('title')}
                    >
                      Title {sortField === 'title' && getSortIcon('title')}
                    </th>
                    {allCategories.length > 0 && (
                      <th 
                        className="category-col sortable"
                        onClick={() => handleSort('category')}
                      >
                        Category {sortField === 'category' && getSortIcon('category')}
                      </th>
                    )}
                    <th 
                      className="date-col sortable"
                      onClick={() => handleSort('createdAt')}
                    >
                      Date Added {sortField === 'createdAt' && getSortIcon('createdAt')}
                    </th>
                    <th 
                      className="views-col sortable"
                      onClick={() => handleSort('viewCount')}
                    >
                      Views {sortField === 'viewCount' && getSortIcon('viewCount')}
                    </th>
                    <th 
                      className="order-col sortable"
                      onClick={() => handleSort('order')}
                    >
                      Order {sortField === 'order' && getSortIcon('order')}
                    </th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVideos.map(video => (
                    <tr key={video.id} className={selectedVideos.includes(video.id) ? 'selected' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => toggleSelectVideo(video.id)}
                        />
                      </td>
                      <td className="thumbnail-cell">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/120x68?text=No+Thumbnail';
                          }}
                        />
                        {favorites.includes(video.id) && (
                          <span className="favorite-indicator">
                            <FontAwesomeIcon icon={faStar} />
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="video-title-cell">
                          <span className="video-title-text">{video.title}</span>
                          <span className="video-description-text">{video.description}</span>
                        </div>
                      </td>
                      {video?.category && (
                        <td>
                          <span className="category-badge">{video.category}</span>
                        </td>
                      )}
                      <td>{formatDate(video.createdAt)}</td>
                      <td>
                        <span className="view-count">
                          <FontAwesomeIcon icon={faEye} /> {video.viewCount || 0}
                </span>
                      </td>
                      <td>{video.order || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/videos/edit/${video.id}`} className="action-btn edit-btn" title="Edit">
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>
                          <button 
                            className="action-btn preview-btn" 
                            title="Preview"
                            onClick={() => handlePreviewVideo(video)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <div className="share-btn-container">
                            <button
                              onClick={() => handleShareVideo(video)}
                              className="action-btn share-btn"
                              title="Share Video"
                            >
                              <FontAwesomeIcon icon={faShare} />
                            </button>
                            {shareTooltipVisible === video.id && (
                              <div className="share-tooltip table-share-tooltip">
                                <FontAwesomeIcon icon={faCheck} /> Link copied!
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleFavorite(video.id)}
                            className={`action-btn favorite-btn ${favorites.includes(video.id) ? 'active' : ''}`}
                            title={favorites.includes(video.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <FontAwesomeIcon icon={favorites.includes(video.id) ? faStar : farStar} />
                          </button>
                          <button 
                            onClick={() => onDelete(video.id)} 
                            className="action-btn delete-btn"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-btn first-page"
                title="First Page"
              >
                &laquo;
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn prev-page"
                title="Previous Page"
              >
                &lsaquo;
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show 5 page numbers centered around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn next-page"
                title="Next Page"
              >
                &rsaquo;
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn last-page"
                title="Last Page"
              >
                &raquo;
              </button>
              
              <div className="pagination-info">
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="results-info">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredVideos.length)} of {filteredVideos.length} videos
                </span>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Video Preview Modal */}
      {previewModalOpen && currentPreviewVideo && (
        <div className="video-preview-modal">
          <div className="modal-backdrop" onClick={handleClosePreviewModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentPreviewVideo.title}</h3>
              <button className="modal-close" onClick={handleClosePreviewModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {currentPreviewVideo.videoUrl ? (
                <div className="video-player">
                  <iframe 
                    src={currentPreviewVideo.videoUrl} 
                    title={currentPreviewVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="video-placeholder">
                  <img 
                    src={currentPreviewVideo.thumbnail} 
                    alt={currentPreviewVideo.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/640x360?text=No+Video+Available';
                    }}
                  />
                  <div className="placeholder-overlay">
                    <p>No video URL available for preview</p>
                  </div>
                </div>
              )}
              <div className="video-details">
                <p className="video-description">{currentPreviewVideo.description}</p>
                <div className="video-meta-details">
                  <div className="meta-item">
                    <span className="meta-label">Views:</span>
                    <span className="meta-value">{currentPreviewVideo.viewCount || 0}</span>
                  </div>
                  {currentPreviewVideo.category && (
                    <div className="meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">{currentPreviewVideo.category}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Added:</span>
                    <span className="meta-value">{formatDate(currentPreviewVideo.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => handleShareVideo(currentPreviewVideo)}
              >
                <FontAwesomeIcon icon={faCopy} /> Copy Link
                {shareTooltipVisible === currentPreviewVideo.id && (
                  <span className="modal-tooltip">Link copied!</span>
                )}
              </button>
              <Link 
                to={`/admin/videos/edit/${currentPreviewVideo.id}`} 
                className="admin-btn admin-btn-primary"
              >
                <FontAwesomeIcon icon={faEdit} /> Edit Video
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Help tooltip */}
      <div className="help-tooltip">
        <FontAwesomeIcon icon={faInfoCircle} />
        <div className="tooltip-content">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><strong>Ctrl+F</strong> - Focus search</li>
            <li><strong>G</strong> - Toggle grid/list view</li>
            <li><strong>F</strong> - Toggle favorites</li>
            <li><strong>?</strong> - Show this help</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoList;
