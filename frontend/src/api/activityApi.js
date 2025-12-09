// frontend/src/api/activityApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器，添加token
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// API方法
export const activityApi = {
  // 获取个人动态流
  getFeed: (params) => api.get('/activities/feed', { params }),
  
  // 获取用户动态
  getUserActivities: (userId, params) => 
    api.get(`/activities/users/${userId}/activities`, { params }),
  
  // 创建动态
  createActivity: (data) => api.post('/activities', data),
  
  // 删除动态
  deleteActivity: (activityId) => api.delete(`/activities/${activityId}`),
  
  // 点赞/取消点赞
  toggleLike: (activityId) => api.post(`/activities/${activityId}/like`),
  
  // 获取评论
  getComments: (activityId, params) => 
    api.get(`/activities/${activityId}/comments`, { params }),
  
  // 添加评论
  addComment: (activityId, data) => 
    api.post(`/activities/${activityId}/comments`, data),
  
  // 获取统计信息
  getStats: (userId) => api.get(`/activities/stats/${userId}`)
};