import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines, faSave, faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { videoAPI } from '../services/api';
import './AdminStyles.css';

const VideoReorder = () => {
  const [videos, setVideos] = useState([]);
  const [orderedVideos, setOrderedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    fetchVideos();
    // Cleanup any pending timeouts on unmount
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

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
      setOrderedVideos(sortedVideos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result) => {
    // Clear any previous error messages when user starts reordering
    setError(null);
    
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the videos array
    const reordered = reorderList(
      orderedVideos,
      result.source.index,
      result.destination.index
    );

    setOrderedVideos(reordered);
  };

  // Helper function to reorder the list after drag and drop
  const reorderList = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    // Update order for all items
    return result.map((item, index) => ({
      ...item,
      order: index + 1
    }));
  };

  // Save the new order with updated IDs
  const saveNewOrder = async () => {
    // Clear any existing success timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Create a new array with updated order based on the new position
      const videosWithNewOrder = orderedVideos.map((video, index) => ({
        ...video,
        order: index + 1 // Add order field based on position
      }));
      
      // Update all videos with their new order
      const updatedVideos = await videoAPI.updateVideosOrder(videosWithNewOrder);
      
      // If we reach here, it means the update was successful
      setVideos(updatedVideos);
      setOrderedVideos(updatedVideos);
      setSuccess(true);
      
      // Set new timeout and store its reference
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
        successTimeoutRef.current = null;
      }, 3000);

      // Refresh the video list
      await fetchVideos();
      
    } catch (err) {
      console.error('Error saving video order:', err);
      setError('Failed to save new order. Please try again.');
      setSuccess(false);
      // Revert to original order on error
      setOrderedVideos([...videos]);
    } finally {
      setSaving(false);
    }
  };

  // Reset to original order
  const resetOrder = () => {
    setOrderedVideos([...videos]);
    setError(null);
    setSuccess(false);
    
    // Clear any existing success timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading videos...</div>;
  }

  return (
    <div className="admin-reorder-container">
      <div className="admin-reorder-header">
        <h2>Reorder Videos</h2>
        <div className="admin-reorder-actions">
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={resetOrder}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faUndo} /> Reset Order
          </button>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={saveNewOrder}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} /> Save New Order
              </>
            )}
          </button>
        </div>
      </div>
      
      {success && !error && (
        <div className="admin-success-message">
          <FontAwesomeIcon icon={faCheck} /> New order saved successfully!
        </div>
      )}
      
      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}
      
      <p className="admin-reorder-instructions">
        Drag and drop videos to reorder them. Use the grip handle on the right to drag videos.
      </p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="video-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="admin-reorder-list"
            >
              {orderedVideos.map((video, index) => (
                <Draggable 
                  key={video.id} 
                  draggableId={video.id.toString()} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`admin-reorder-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: snapshot.isDragging ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
                        color: snapshot.isDragging ? 'var(--admin-btn-text)' : 'var(--admin-text)'
                      }}
                    >
                      <div className="admin-reorder-id">
                        {index + 1}
                      </div>
                      <div className="admin-reorder-thumbnail">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x60?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="admin-reorder-info">
                        <h3>{video.title}</h3>
                        <p>{video.description}</p>
                      </div>
                      <div 
                        {...provided.dragHandleProps}
                        className="admin-reorder-handle"
                        style={{
                          color: snapshot.isDragging ? 'var(--admin-btn-text)' : 'var(--admin-text-secondary)'
                        }}
                      >
                        <FontAwesomeIcon icon={faGripLines} />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default VideoReorder; 