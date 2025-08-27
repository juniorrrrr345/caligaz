/**
 * Utilitaires pour l'API Cloudflare
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class CloudflareAPI {
  constructor(config) {
    this.accountId = config.cloudflare.accountId;
    this.apiToken = config.cloudflare.apiToken;
    this.headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Upload une vidéo vers Cloudflare Stream
   */
  async uploadVideo(videoPath, metadata = {}) {
    try {
      const form = new FormData();
      
      // Si c'est une URL, on télécharge d'abord
      let videoStream;
      if (videoPath.startsWith('http')) {
        const response = await axios.get(videoPath, { responseType: 'stream' });
        videoStream = response.data;
      } else {
        videoStream = fs.createReadStream(videoPath);
      }
      
      form.append('file', videoStream);
      
      // Ajouter les métadonnées
      const meta = {
        name: metadata.name || path.basename(videoPath),
        ...metadata
      };
      
      form.append('meta', JSON.stringify(meta));
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.apiToken}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.data.success) {
        return {
          success: true,
          videoId: response.data.result.uid,
          playbackUrl: `https://iframe.videodelivery.net/${response.data.result.uid}`,
          thumbnail: response.data.result.thumbnail,
          duration: response.data.result.duration,
          size: response.data.result.size,
          metadata: response.data.result.meta
        };
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error.message);
      throw error;
    }
  }

  /**
   * Upload une vidéo depuis une URL
   */
  async uploadVideoFromUrl(videoUrl, metadata = {}) {
    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/copy`,
        {
          url: videoUrl,
          meta: {
            name: metadata.name || videoUrl.split('/').pop(),
            ...metadata
          },
          requireSignedURLs: false,
          allowedOrigins: ['*']
        },
        { headers: this.headers }
      );

      if (response.data.success) {
        return {
          success: true,
          videoId: response.data.result.uid,
          playbackUrl: `https://iframe.videodelivery.net/${response.data.result.uid}`,
          thumbnail: response.data.result.thumbnail,
          metadata: response.data.result.meta
        };
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'Upload from URL failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload vidéo depuis URL:', error.message);
      throw error;
    }
  }

  /**
   * Upload une image vers Cloudflare Images
   */
  async uploadImage(imagePath, metadata = {}) {
    try {
      const form = new FormData();
      
      // Si c'est une URL, on télécharge d'abord
      let imageStream;
      if (imagePath.startsWith('http')) {
        const response = await axios.get(imagePath, { responseType: 'stream' });
        imageStream = response.data;
      } else {
        imageStream = fs.createReadStream(imagePath);
      }
      
      form.append('file', imageStream);
      
      // Ajouter les métadonnées
      if (metadata.id) {
        form.append('id', metadata.id);
      }
      
      if (metadata) {
        form.append('metadata', JSON.stringify(metadata));
      }
      
      form.append('requireSignedURLs', 'false');
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      if (response.data.success) {
        const result = response.data.result;
        return {
          success: true,
          imageId: result.id,
          filename: result.filename,
          variants: result.variants,
          publicUrl: result.variants.find(v => v.includes('/public')) || result.variants[0],
          metadata: result.meta
        };
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload image:', error.message);
      throw error;
    }
  }

  /**
   * Upload une image depuis une URL
   */
  async uploadImageFromUrl(imageUrl, metadata = {}) {
    try {
      const form = new FormData();
      form.append('url', imageUrl);
      
      if (metadata.id) {
        form.append('id', metadata.id);
      }
      
      if (metadata) {
        form.append('metadata', JSON.stringify(metadata));
      }
      
      form.append('requireSignedURLs', 'false');
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      if (response.data.success) {
        const result = response.data.result;
        return {
          success: true,
          imageId: result.id,
          filename: result.filename,
          variants: result.variants,
          publicUrl: result.variants.find(v => v.includes('/public')) || result.variants[0],
          metadata: result.meta
        };
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'Image upload from URL failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload image depuis URL:', error.message);
      throw error;
    }
  }

  /**
   * Liste les vidéos Stream
   */
  async listVideos(search = '') {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
      const params = search ? { search } : {};
      
      const response = await axios.get(url, {
        headers: this.headers,
        params
      });

      if (response.data.success) {
        return response.data.result;
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'List videos failed');
      }
    } catch (error) {
      console.error('❌ Erreur liste vidéos:', error.message);
      throw error;
    }
  }

  /**
   * Liste les images
   */
  async listImages(page = 1, perPage = 100) {
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
        {
          headers: this.headers,
          params: { page, per_page: perPage }
        }
      );

      if (response.data.success) {
        return response.data.result.images;
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'List images failed');
      }
    } catch (error) {
      console.error('❌ Erreur liste images:', error.message);
      throw error;
    }
  }

  /**
   * Supprime une vidéo
   */
  async deleteVideo(videoId) {
    try {
      const response = await axios.delete(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
        { headers: this.headers }
      );

      return response.data.success;
    } catch (error) {
      console.error('❌ Erreur suppression vidéo:', error.message);
      throw error;
    }
  }

  /**
   * Supprime une image
   */
  async deleteImage(imageId) {
    try {
      const response = await axios.delete(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`,
        { headers: this.headers }
      );

      return response.data.success;
    } catch (error) {
      console.error('❌ Erreur suppression image:', error.message);
      throw error;
    }
  }
}

module.exports = CloudflareAPI;