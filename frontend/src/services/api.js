// frontend/src/services/api.js
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001', // 你的后端地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API 方法
export const itemAPI = {
  // 获取内容列表
  getItems(params = {}) {
    return api.get('/api/items', { params });
  },

  // 获取热门内容
  getHotItems() {
    return api.get('/api/items/hot');
  },

  // 获取内容详情
  getItem(id) {
    return api.get(`/api/items/${id}`);
  },

  // 搜索内容
  searchItems(query) {
    return api.get('/api/items/search', { params: { q: query } });
  },

  // 创建内容
  createItem(data) {
    return api.post('/api/items', data);
  }
};

export default api;