// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
// 统一的请求函数
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 API请求:', url); // 添加这行，方便调试
    
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
    
    // 确保body是JSON字符串
    if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API错误:', response.status, errorText);
            
            if (response.status === 401) {
                // 未授权，清除token并跳转到登录页
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API请求失败:', error);
        
        // 如果是网络错误，显示详细信息
        if (error.message.includes('Failed to fetch')) {
            console.error('🌐 网络连接失败，请检查:');
            console.error('  1. 后端服务器是否运行 (端口3000)');
            console.error(`  2. 访问: ${url}`);
            console.error('  3. CORS配置是否正确');
        }
        
        throw error;
    }
}

// 评论相关API - 注意：API_BASE_URL已经包含/api，所以这里不要加/api
export const reviewApi = {
    // 获取评论列表
    getReviews: (itemId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/items/${itemId}/reviews${queryString ? `?${queryString}` : ''}`);
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
        return request(`/items${queryString ? `?${queryString}` : ''}`);
    }
};

export default {
    reviewApi,
    authApi,
    itemApi,
    request
};