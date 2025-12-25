 
<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">注册新账号</h2>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            placeholder="请输入用户名（2-20位字符）"
            required
          />
          <div class="input-hint">用户名将公开显示</div>
        </div>
        
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
            placeholder="请输入密码（至少6位）"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            required
          />
        </div>
        
        <div class="agreement">
          <label class="checkbox-label">
            <input type="checkbox" v-model="agreeTerms" required />
            <span>我已阅读并同意</span>
          </label>
          <router-link to="/terms" class="terms-link">《用户协议》</router-link>
          <span>和</span>
          <router-link to="/privacy" class="terms-link">《隐私政策》</router-link>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
        
        <div class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </form>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'

const router = useRouter()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const agreeTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 监听密码变化，检查一致性
watch(() => [formData.value.password, formData.value.confirmPassword], () => {
  if (formData.value.password && formData.value.confirmPassword && 
      formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
  } else {
    errorMessage.value = ''
  }
})

const validateForm = () => {
  // 用户名验证
  if (formData.value.username.length < 2 || formData.value.username.length > 20) {
    errorMessage.value = '用户名长度应为2-20位字符'
    return false
  }
  
  // 密码验证
  if (formData.value.password.length < 6) {
    errorMessage.value = '密码长度至少为6位'
    return false
  }
  
  // 密码一致性验证
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }
  
  // 协议同意验证
  if (!agreeTerms.value) {
    errorMessage.value = '请阅读并同意用户协议和隐私政策'
    return false
  }
  
  return true
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  // ✅ 调试：打印即将发送的数据
  console.log('📤 发送的数据:', {
    username: formData.value.username,
    email: formData.value.email,
    password: formData.value.password
  });

  try {
    const response = await register({
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password
    })
    
    console.log('✅ 注册响应:', response);

    // ✅ 正确访问 response.data.code 和 response.data.message
    if (response.data.code === 200 || response.data.code === 201) {
      successMessage.value = '注册成功！3秒后跳转到登录页面...'
      errorMessage.value = ''  // 清空错误信息
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      errorMessage.value = response.data.message || '注册失败'
    }
  } catch (error) {
    // ✅ catch 块中也使用 response.data.message
    console.error('❌ 错误详情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || error.message
    });
    
    errorMessage.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.register-title {
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

.input-hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 25px 0;
  font-size: 14px;
  color: #555;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 5px;
}

.checkbox-label input {
  margin-right: 6px;
}

.terms-link {
  color: #007bff;
  text-decoration: none;
  margin: 0 5px;
}

.terms-link:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
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

.success-message {
  margin-top: 20px;
  padding: 12px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-size: 14px;
}
</style>