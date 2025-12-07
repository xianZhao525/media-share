import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// eslint-disable-next-line no-unused-vars
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })
  
  // 方法
  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 这里应该是真实的API调用
      // 为了演示，我们模拟登录
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟返回的用户数据
      const response = {
        code: 200,
        data: {
          user: {
            _id: '507f1f77bcf86cd799439011',
            username: credentials.email.split('@')[0] || '用户',
            email: credentials.email,
            avatar: '/default-avatar.jpg',
            bio: '这个人很懒，什么都没写'
          },
          token: 'mock_jwt_token_' + Date.now()
        }
      }
      
      if (response.code === 200) {
        user.value = response.data.user
        token.value = response.data.token
        
        // 保存token到localStorage
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('user_info', JSON.stringify(user.value))
        
        // 跳转到首页或重定向页面
        const redirect = router.currentRoute.value.query.redirect || '/'
        router.push(redirect)
        
        return response.data
      }
    } catch (err) {
      error.value = err.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (userData) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 模拟注册
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟返回数据
      const response = {
        code: 200,
        data: {
          user: {
            _id: '507f1f77bcf86cd7994390' + Date.now().toString().slice(-6),
            username: userData.username,
            email: userData.email,
            avatar: '/default-avatar.jpg',
            bio: '这个人很懒，什么都没写'
          },
          token: 'mock_jwt_token_' + Date.now()
        }
      }
      
      if (response.code === 200) {
        user.value = response.data.user
        token.value = response.data.token
        
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('user_info', JSON.stringify(user.value))
        
        router.push('/')
        
        return response.data
      }
    } catch (err) {
      error.value = err.message || '注册失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    try {
      // 模拟退出
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 清除状态
      user.value = null
      token.value = null
      
      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // 跳转到登录页
      router.push('/login')
      
    } catch (err) {
      console.error('退出失败:', err)
    }
  }
  
  const checkAuth = () => {
    // 检查本地存储中的token
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_info')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (err) {
        console.error('解析用户信息失败:', err)
        clearAuth()
      }
    }
  }
  
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }
  
  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 模拟更新
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新用户信息
      user.value = { ...user.value, ...profileData }
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      return user.value
    } catch (err) {
      error.value = err.message || '更新失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
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
    
    // 方法
    login,
    register,
    logout,
    checkAuth,
    clearAuth,
    updateProfile,
    clearError
  }
})