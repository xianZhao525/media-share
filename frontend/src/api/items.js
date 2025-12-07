// frontend/src/api/items.js
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    
    // 处理常见错误
    if (error.response?.status === 401) {
      // 认证错误
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('请求的资源不存在:', errorMessage);
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误:', errorMessage);
    }
    
    return Promise.reject({
      code: error.response?.status || 500,
      message: errorMessage,
      data: error.response?.data?.data || null
    });
  }
);

// API方法
const itemApi = {
  // 获取内容列表
  getItems(params = {}) {
    return apiClient.get('/items', { params });
  },

  // 获取热门内容
  getHotItems(params = {}) {
    return apiClient.get('/items/hot', { params });
  },

  // 获取最新内容
  getLatestItems(params = {}) {
    return apiClient.get('/items/latest', { params });
  },

  // 搜索内容
  searchItems(query, params = {}) {
    return apiClient.get('/items/search', {
      params: { q: query, ...params }
    });
  },

  // 获取内容详情
  getItemById(id) {
    return apiClient.get(`/items/${id}`);
  },

  // 获取相关内容
  getRelatedItems(id, params = {}) {
    return apiClient.get(`/items/${id}/related`, { params });
  },

  // 获取用户的内容
  getUserItems(userId, params = {}) {
    return apiClient.get(`/items/user/${userId}`, { params });
  },

  // 获取统计数据
  getStats() {
    return apiClient.get('/items/stats');
  },

  // 创建内容
  createItem(itemData) {
    return apiClient.post('/items', itemData);
  },

  // 更新内容
  updateItem(id, itemData) {
    return apiClient.put(`/items/${id}`, itemData);
  },

  // 删除内容
  deleteItem(id) {
    return apiClient.delete(`/items/${id}`);
  },

  // 插入示例数据（仅开发用）
  seedSampleData() {
    return apiClient.post('/items/dev/seed');
  }
};

export default itemApi;