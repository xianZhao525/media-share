import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    
    // 添加认证token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    
    // 添加用户ID（开发用）
    if (authStore.user && authStore.user._id) {
      config.headers['X-User-Id'] = authStore.user._id;
    }
    
    console.log(`🔗 ${config.method.toUpperCase()} ${config.url}`, config.params || '');
    
    return config;
  },
  (error) => {
    console.error('❌ 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} 成功`);
    
    // 统一处理响应格式
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      // 业务逻辑错误
      const errorMsg = response.data?.message || '请求失败';
      ElMessage.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
  },
  (error) => {
    console.error('❌ 请求失败:', error);
    
    let errorMessage = '网络错误，请稍后重试';
    
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          { errorMessage = '登录已过期，请重新登录';
          // 清除用户信息
          const authStore = useAuthStore();
          authStore.logout();
          // 跳转到登录页
          window.location.href = '/login';
          break; }
        case 403:
          errorMessage = '没有权限执行此操作';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有响应
      errorMessage = '网络连接失败，请检查网络设置';
    } else {
      // 请求配置错误
      errorMessage = error.message;
    }
    
    ElMessage.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// 导出常用的HTTP方法
export const http = {
  get: (url, params, config) => api.get(url, { params, ...config }),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config)
};

// 导出实例
export default api;