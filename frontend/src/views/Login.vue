 
<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">登录</h2>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">
            忘记密码？
          </router-link>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'  
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth' 

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  // 表单验证
  if (!formData.value.email || !formData.value.password) {
    errorMessage.value = '请填写邮箱和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await login(formData.value)
    
    console.log('✅ 登录响应:', response);  // 调试用

    // ✅ 正确访问 response.data.code 和 response.data.data
    if (response.data.code === 200) {
      // ✅ 保存用户信息和token到store
      authStore.setUser(response.data.data.user)      // ← 加 .data
      authStore.setToken(response.data.data.token)    // ← 加 .data
      
      // 如果选择记住我，保存到localStorage
      if (rememberMe.value) {
        localStorage.setItem('userEmail', formData.value.email)
      }
      
      // 跳转到首页
      router.push('/')
    } else {
      errorMessage.value = response.data.message || '登录失败'
    }
  } catch (error) {
    // ✅ 显示后端真实错误
    console.error('❌ 登录错误详情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || error.message
    });
    
    errorMessage.value = error.response?.data?.message || error.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 如果本地有保存的邮箱，自动填充
onMounted(() => {
  const savedEmail = localStorage.getItem('userEmail')
  if (savedEmail) {
    formData.value.email = savedEmail
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  margin-right: 6px;
}

.forgot-password {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #0056b3;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #fee;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
}
</style>