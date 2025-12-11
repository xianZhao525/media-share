// src/api/activityApi.js

import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

const activityApi = {
  // 获取动态流
  getFeed: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/activities/feed`, { params })
    return response.data
  },

  // 获取用户动态
  getUserActivities: async (userId, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/activities`, { params })
    return response.data
  },

  // 获取动态详情
  getActivityDetail: async (activityId) => {
    const response = await axios.get(`${API_BASE_URL}/activities/${activityId}`)
    return response.data
  },

  // 发布动态
  createActivity: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/activities`, data)
    return response.data
  },

  // 点赞动态
  likeActivity: async (activityId) => {
    const response = await axios.post(`${API_BASE_URL}/activities/${activityId}/like`)
    return response.data
  },

  // 取消点赞
  unlikeActivity: async (activityId) => {
    const response = await axios.delete(`${API_BASE_URL}/activities/${activityId}/like`)
    return response.data
  },

  // 分享动态
  shareActivity: async (activityId) => {
    const response = await axios.post(`${API_BASE_URL}/activities/${activityId}/share`)
    return response.data
  },

  // 获取动态评论
  getActivityComments: async (activityId, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/activities/${activityId}/comments`, { params })
    return response.data
  },

  // 发布评论
  postComment: async (activityId, data) => {
    const response = await axios.post(`${API_BASE_URL}/activities/${activityId}/comments`, data)
    return response.data
  },

  // 点赞评论
  likeComment: async (commentId) => {
    const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/like`)
    return response.data
  },

  // 取消点赞评论
  unlikeComment: async (commentId) => {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}/like`)
    return response.data
  },

  // 删除动态
  deleteActivity: async (activityId) => {
    const response = await axios.delete(`${API_BASE_URL}/activities/${activityId}`)
    return response.data
  },

  // 删除评论
  deleteComment: async (commentId) => {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`)
    return response.data
  },

  // 上传图片
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export { activityApi }