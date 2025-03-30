import axios from 'axios';

const API_URL = 'http://localhost:3004';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to ensure order is always a number
const ensureOrderIsNumber = (video) => {
  if (video && video.order !== undefined) {
    return {
      ...video,
      order: parseInt(video.order) || 0
    };
  }
  return video;
};

// Video API methods
export const videoAPI = {
  // Get all videos
  getAllVideos: async () => {
    try {
      const response = await api.get('/videos');
      // Ensure orders are numbers
      return response.data.map(ensureOrderIsNumber);
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get a single video by ID
  getVideoById: async (id) => {
    try {
      const response = await api.get(`/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching video with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new video
  createVideo: async (videoData) => {
    try {
      // Add creation date and initial view count
      const videoWithMeta = {
        ...videoData,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        order: parseInt(videoData.order) || 0
      };
      
      const response = await api.post('/videos', videoWithMeta);
      return ensureOrderIsNumber(response.data);
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  // Update an existing video
  updateVideo: async (id, videoData) => {
    try {
      const processedData = ensureOrderIsNumber(videoData);
      const response = await api.put(`/videos/${id}`, processedData);
      return ensureOrderIsNumber(response.data);
    } catch (error) {
      console.error(`Error updating video with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a video
  deleteVideo: async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting video with id ${id}:`, error);
      throw error;
    }
  },
  
  // Update the order of videos
  updateVideosOrder: async (videosWithNewOrder) => {
    try {
      // Get current videos to preserve their properties
      const currentVideos = await api.get('/videos');
      const currentVideoMap = new Map(
        currentVideos.data.map(video => [video.id, video])
      );

      // Update videos sequentially to maintain order consistency
      const results = [];
      for (const video of videosWithNewOrder) {
        const currentVideo = currentVideoMap.get(video.id);
        if (!currentVideo) continue;

        const updatedVideo = {
          ...currentVideo,
          order: video.order
        };

        const response = await api.put(`/videos/${video.id}`, updatedVideo);
        results.push(response.data);
      }
      return results;
    } catch (error) {
      console.error('Error updating videos order:', error);
      throw error;
    }
  },
  
  // Increment the view count of a video
  incrementViewCount: async (id) => {
    try {
      const videoResponse = await api.get(`/videos/${id}`);
      const video = videoResponse.data;
      
      const updatedVideo = {
        ...video,
        viewCount: (video.viewCount || 0) + 1
      };
      
      const response = await api.put(`/videos/${id}`, updatedVideo);
      return response.data;
    } catch (error) {
      console.error(`Error incrementing view count for video with id ${id}:`, error);
      throw error;
    }
  }
};

export default axios;
