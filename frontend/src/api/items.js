// frontend/src/api/items.js
import api from '@/services/api';

export default {
  // 获取内容列表
  async getItems(params = {}) {
    const response = await api.get('/api/items', { params });
    return response;
  },

  // 获取热门内容
  async getHotItems() {
    const response = await api.get('/api/items/hot');
    return response;
  },

  // 获取内容详情
  async getItem(id) {
    const response = await api.get(`/api/items/${id}`);
    return response;
  },

  // 搜索内容
  async searchItems(query) {
    const response = await api.get('/api/items/search', { 
      params: { q: query } 
    });
    return response;
  },

  // 创建内容
  async createItem(data) {
    const response = await api.post('/api/items', data);
    return response;
  },

  // 更新内容
  async updateItem(id, data) {
    const response = await api.put(`/api/items/${id}`, data);
    return response;
  },

  // 删除内容
  async deleteItem(id) {
    const response = await api.delete(`/api/items/${id}`);
    return response;
  }
};
