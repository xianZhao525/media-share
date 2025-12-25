import axios from 'axios'

const API_BASE_URL = '/api/auth'

export const login = (credentials) => {
    return axios.post(`${API_BASE_URL}/login`, credentials)
}

export const register = (userData) => {
    return axios.post(`${API_BASE_URL}/register`, userData)
}

export const logout = () => {
    localStorage.removeItem('token')
}

export const getCurrentUser = () => {
    return axios.get(`${API_BASE_URL}/me`)
}