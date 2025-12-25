import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const searchAPI = {
    // 搜索
    async search(params) {
        const response = await axios.get(`${API_BASE_URL}/search`, { params });
        return response.data;
    },

    // 热门标签
    async getPopularTags(limit = 10) {
        const response = await axios.get(`${API_BASE_URL}/tags/popular`, {
            params: { limit }
        });
        return response.data;
    },

    // 搜索建议
    async getSuggestions(query) {
        const response = await axios.get(`${API_BASE_URL}/search/suggestions`, {
            params: { q: query, limit: 5 }
        });
        return response.data;
    }
};

export default searchAPI;