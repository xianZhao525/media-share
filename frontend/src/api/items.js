// frontend/src/api/items.js
import api from '@/services/api';

export default {
  // 获取内容列表
  async getItems(params = {}) {
    console.log('📡 API: getItems', params);
    
    // 转换参数以匹配后端
    const backendParams = {};
    
    // 分页参数
    if (params.page) backendParams.page = params.page;
    if (params.limit) backendParams.limit = params.limit;
    
    // 筛选参数
    if (params.type) backendParams.type = params.type;
    if (params.tags) backendParams.tags = params.tags;
    
    // 搜索参数
    if (params.q) backendParams.q = params.q;
    
    // 排序参数
    if (params.sort) backendParams.sort = params.sort;
    
    // 字段选择
    if (params.fields) backendParams.fields = params.fields;
    
    const response = await api.get('/api/items', { params: backendParams });
    console.log('📡 API Response:', response);
    return response;
  },

  // 获取热门内容
  async getHotItems(params = {}) {
    console.log('📡 API: getHotItems');
    const response = await api.get('/api/items/hot', { 
      params: { limit: params.limit || 6, type: params.type }
    });
    return response;
  },

  // 获取最新内容
  async getLatestItems(params = {}) {
    console.log('📡 API: getLatestItems');
    const response = await api.get('/api/items/latest', { 
      params: { limit: params.limit || 8, type: params.type }
    });
    return response;
  },

  // 获取内容详情
  async getItem(id) {
    console.log('📡 API: getItem', id);
    const response = await api.get(`/api/items/${id}`);
    return response;
  },

  // 搜索内容
  async searchItems(query) {
    console.log('📡 API: searchItems', query);
    const response = await api.get('/api/items/search', { 
      params: { q: query } 
    });
    return response;
  },

  // 获取统计数据 - 现在后端有这个接口了
  async getStats() {
    console.log('📡 API: getStats');
    try {
      const response = await api.get('/api/items/stats');
      return response;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {
        code: 200,
        data: {
          total: 0,
          byType: { movie: 0, tv: 0, anime: 0, variety: 0, other: 0 },
          totalViews: 0,
          averageRating: 0
        },
        message: '获取统计数据成功'
      };
    }
  },

  // 获取相关内容
  async getRelatedItems(id) {
    console.log('📡 API: getRelatedItems', id);
    try {
      const response = await api.get(`/api/items/${id}/related`);
      return response;
    } catch (error) {
      console.error('获取相关内容失败:', error);
      return {
        code: 200,
        data: [],
        message: '获取相关内容成功'
      };
    }
  },

  // 创建内容
  async createItem(data) {
    console.log('📡 API: createItem', data);
    const response = await api.post('/api/items', data);
    return response;
  },

  // 更新内容
  async updateItem(id, data) {
    console.log('📡 API: updateItem', id, data);
    const response = await api.put(`/api/items/${id}`, data);
    return response;
  },

  // 删除内容
  async deleteItem(id) {
    console.log('📡 API: deleteItem', id);
    const response = await api.delete(`/api/items/${id}`);
    return response;
  }
};