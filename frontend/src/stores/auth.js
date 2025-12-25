import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userId = computed(() => user.value?.id || user.value?._id || '')

  // 核心方法：设置用户
  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // 核心方法：设置token
  const setToken = (tokenValue) => {
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 登录方法（兼容原有调用）
  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null

      // 这里应该是真实的API调用
      // 假设传入的是 { email, password }
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }).then(r => r.json())

      if (response.code === 200) {
        // 使用 setUser 和 setToken
        setUser(response.data.user)
        setToken(response.data.token)
      }

      return response.data
    } catch (err) {
      error.value = err.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 注册方法（兼容原有调用）
  const register = async (userData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(r => r.json())

      if (response.code === 201 || response.code === 200) {
        setUser(response.data.user)
        setToken(response.data.token)
      }

      return response.data
    } catch (err) {
      error.value = err.message || '注册失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('user_info')  // 兼容旧数据
  }

  // 检查认证状态
  const checkAuth = () => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user') || localStorage.getItem('user_info')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return true
      } catch (err) {
        console.error('解析用户信息失败:', err)
        logout()
        return false
      }
    }
    return false
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 初始化时检查认证状态
  checkAuth()

  return {
    // 状态
    user,
    token,
    isLoading,
    error,

    // 计算属性
    isAuthenticated,
    userId,

    // 方法
    setUser,      // ← Login.vue 需要
    setToken,     // ← Login.vue 需要
    login,
    register,
    logout,
    checkAuth,
    clearError
  }
})