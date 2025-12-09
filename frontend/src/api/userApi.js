// frontend/src/api/userApi.js
import api from './baseApi'

export const userApi = {
  // 获取用户资料
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  
  // 获取关注/粉丝统计
  getRelationStats: (userId) => api.get(`/users/${userId}/stats/relations`),
  
  // 更新用户资料
  updateProfile: (data) => api.put('/profile', data),
  
  // 关注/取消关注
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`)
}