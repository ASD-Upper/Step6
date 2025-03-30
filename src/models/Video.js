// Video model
class Video {
  constructor({
    id = null,
    title = '',
    description = '',
    thumbnail = '',
    videoUrl = '',
    embedUrl = null,
    previewUrl = null,
    order = null,
    viewCount = 0,
    addedAt = new Date(),
    externalUrl = null
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.thumbnail = thumbnail;
    this.videoUrl = videoUrl;
    this.embedUrl = embedUrl;
    this.previewUrl = previewUrl;
    this.order = order;
    this.viewCount = viewCount;
    this.addedAt = addedAt instanceof Date ? addedAt : new Date(addedAt);
    this.externalUrl = externalUrl;
  }

  // Get an array of preview URLs
  getPreviewUrls() {
    if (!this.previewUrl) return [];
    if (Array.isArray(this.previewUrl)) return this.previewUrl;
    return this.previewUrl.split(',').map(url => url.trim());
  }

  // Get the first preview URL (for backward compatibility)
  getFirstPreviewUrl() {
    const urls = this.getPreviewUrls();
    return urls.length > 0 ? urls[0] : null;
  }

  // Set preview URLs from array or comma-separated string
  setPreviewUrls(urls) {
    if (!urls) {
      this.previewUrl = null;
      return;
    }
    
    if (Array.isArray(urls)) {
      this.previewUrl = urls.join(',');
    } else {
      this.previewUrl = urls;
    }
  }

  // Convert to JSON for API
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      thumbnail: this.thumbnail,
      videoUrl: this.videoUrl,
      embedUrl: this.embedUrl,
      previewUrl: this.previewUrl,
      order: this.order,
      viewCount: this.viewCount,
      addedAt: this.addedAt.toISOString(),
      externalUrl: this.externalUrl
    };
  }

  // Create from API response
  static fromJSON(json) {
    return new Video(json);
  }
}

export default Video; 