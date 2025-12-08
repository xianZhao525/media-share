const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 统一的请求函数
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // 如果有token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            if (response.status === 401) {
                // 未授权，清除token并跳转到登录页
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// 评论相关API
export const reviewApi = {
    // 获取评论列表
    getReviews: (itemId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/items/${itemId}/reviews?${queryString}`);
    },
    
    // 获取评分统计
    getRatingStats: (itemId) => {
        return request(`/items/${itemId}/reviews/stats`);
    },
    
    // 发表评论
    createReview: (itemId, data) => {
        return request(`/items/${itemId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // 更新评论
    updateReview: (reviewId, data) => {
        return request(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // 删除评论
    deleteReview: (reviewId) => {
        return request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    },
    
    // 点赞/取消点赞
    toggleLike: (reviewId) => {
        return request(`/reviews/${reviewId}/like`, {
            method: 'POST'
        });
    }
};

// 认证相关API
export const authApi = {
    login: (data) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    register: (data) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    getProfile: () => request('/auth/profile')
};

// 内容相关API
export const itemApi = {
    getItem: (itemId) => request(`/items/${itemId}`),
    
    getItems: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/items?${queryString}`);
    }
};

export default {
    reviewApi,
    authApi,
    itemApi,
    request
};