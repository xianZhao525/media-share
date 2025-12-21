@'
    /**
     * 搜索功能API（角色五负责）
     * 与后端 /api/search 接口对应
     */

    import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

/**
 * 全局搜索
 * @param {Object} params - 搜索参数
 * @param {string} params.q - 搜索关键词
 * @param {string} params.type - 内容类型
 * @param {string} params.tag - 标签筛选
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 */
export const searchItems = async (params = {}) => {
    try {
        const response = await axios.get(`${API_BASE}/search`, { params })
        return response.data
    } catch (error) {
        console.error('搜索失败:', error)
        throw error
    }
}

/**
 * 获取热门标签
 * @param {number} limit - 返回标签数量
 */
export const getPopularTags = async (limit = 10) => {
    try {
        const response = await axios.get(`${API_BASE}/tags/popular`, {
            params: { limit }
        })
        return response.data
    } catch (error) {
        console.error('获取标签失败:', error)
        throw error
    }
}

/**
 * 标签自动补全
 * @param {string} query - 标签前缀
 */
export const suggestTags = async (query) => {
    try {
        const response = await axios.get(`${API_BASE}/tags/suggest`, {
            params: { q: query }
        })
        return response.data
    } catch (error) {
        console.error('获取标签建议失败:', error)
        throw error
    }
}

/**
 * 搜索建议（你可能还需要这个）
 * @param {string} query - 搜索词
 */
export const searchSuggestions = async (query) => {
    try {
        const response = await axios.get(`${API_BASE}/search/suggest`, {
            params: { q: query }
        })
        return response.data
    } catch (error) {
        console.error('获取搜索建议失败:', error)
        // 可以返回空数组，不阻断主流程
        return { code: 200, data: [] }
    }
}

// 导出所有API
export const searchAPI = {
    searchItems,
    getPopularTags,
    suggestTags,
    searchSuggestions
}

export default searchAPI
'@ | Out-File -FilePath frontend\src\api\search.js -Encoding UTF8