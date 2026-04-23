import { Video, VideoDetail } from '../types/video';
import { Category } from '../types/category';

const API_BASE = '/api';

export const videoService = {
  async getAll(page = 1, pageSize = 20): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/videos?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async getTop(): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/videos/top`);
    if (!res.ok) throw new Error('Failed to fetch top videos');
    return res.json();
  },

  async getLatest(): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/videos/latest`);
    if (!res.ok) throw new Error('Failed to fetch latest videos');
    return res.json();
  },

  async getRandom(count = 20): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/videos/random?count=${count}`);
    if (!res.ok) throw new Error('Failed to fetch random videos');
    return res.json();
  },

  async search(text?: string, categoryIds?: number[]): Promise<Video[]> {
    const params = new URLSearchParams();
    if (text) params.append('text', text);
    if (categoryIds && categoryIds.length > 0) {
      params.append('categories', categoryIds.join(','));
    }

    const res = await fetch(`${API_BASE}/videos/search?${params}`);
    if (!res.ok) throw new Error('Failed to search videos');
    return res.json();
  },

  async getById(id: number): Promise<VideoDetail> {
    const res = await fetch(`${API_BASE}/videos/${id}`);
    if (!res.ok) throw new Error('Failed to fetch video');
    return res.json();
  },

  async recordPlay(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/videos/${id}/play`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to record play');
  },

  async updateCategories(id: number, categoryIds: number[]): Promise<void> {
    const res = await fetch(`${API_BASE}/videos/${id}/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryIds })
    });
    if (!res.ok) throw new Error('Failed to update categories');
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
  },

  async upload(file: File, categoryIds?: number[]): Promise<Video> {
    const formData = new FormData();
    formData.append('file', file);
    if (categoryIds) {
      categoryIds.forEach(id => formData.append('categoryIds', id.toString()));
    }

    const res = await fetch(`${API_BASE}/videos/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload video');
    return res.json();
  },

  async importFolder(path: string): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/videos/import-folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (!res.ok) throw new Error('Failed to import folder');
    return res.json();
  }
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async create(name: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
  }
};
