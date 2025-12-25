 
<template>
  <div class="profile-edit-container">
    <div class="profile-header">
      <h1>编辑个人资料</h1>
      <p>完善你的个人信息，让更多人认识你</p>
    </div>
    
    <div class="profile-card">
      <form @submit.prevent="handleSave" class="profile-form">
        <!-- 头像上传 -->
        <div class="avatar-section">
          <div class="avatar-preview">
            <img 
              :src="formData.avatar || defaultAvatar" 
              alt="头像"
              class="avatar-image"
            />
          </div>
          <div class="avatar-actions">
            <label class="upload-btn">
              <input 
                type="file" 
                accept="image/*"
                @change="handleAvatarUpload"
                hidden
              />
              上传新头像
            </label>
            <button 
              type="button" 
              class="remove-btn"
              @click="removeAvatar"
              v-if="formData.avatar"
            >
              移除头像
            </button>
            <div class="avatar-hint">建议尺寸：200×200像素，支持JPG、PNG格式</div>
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                placeholder="请输入用户名"
                required
              />
              <div class="input-hint">用户名将显示在你的个人主页</div>
            </div>
            
            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="请输入邮箱"
                required
                disabled
              />
              <div class="input-hint">邮箱不可修改</div>
            </div>
          </div>
        </div>
        
        <!-- 个人简介 -->
        <div class="form-section">
          <h3>个人简介</h3>
          <div class="form-group">
            <textarea
              id="bio"
              v-model="formData.bio"
              placeholder="介绍一下你自己吧！可以写写你的兴趣爱好、影视偏好等"
              rows="4"
              maxlength="200"
              class="bio-textarea"
            ></textarea>
            <div class="bio-counter">
              {{ formData.bio?.length || 0 }}/200
            </div>
          </div>
        </div>
        
        <!-- 社交链接（可选扩展） -->
        <div class="form-section">
          <h3>社交链接（可选）</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="github">GitHub</label>
              <div class="input-with-icon">
                <span class="input-icon">github.com/</span>
                <input
                  type="text"
                  id="github"
                  v-model="formData.social.github"
                  placeholder="你的GitHub用户名"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="weibo">微博</label>
              <div class="input-with-icon">
                <span class="input-icon">weibo.com/</span>
                <input
                  type="text"
                  id="weibo"
                  v-model="formData.social.weibo"
                  placeholder="你的微博ID"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <router-link to="/profile" class="cancel-btn">
            取消
          </router-link>
          <button type="submit" class="save-btn" :disabled="loading">
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
      
      <!-- 消息提示 -->
      <div v-if="message" :class="['message', message.type]">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<!-- <script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { updateProfile, getProfile } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/default-avatar.png'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  email: '',
  bio: '',
  avatar: '',
  social: {
    github: '',
    weibo: ''
  }
})

const loading = ref(false)
const message = ref(null)

// 加载用户数据
const loadUserData = async () => {
  try {
    const response = await getProfile()
    if (response.code === 200) {
      const userData = response.data.user
      formData.value = {
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        social: userData.social || {
          github: '',
          weibo: ''
        }
      }
    }
  } catch (error) {
    showMessage('加载用户信息失败', 'error')
  }
}

// 头像上传处理
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 文件大小限制（2MB）
  if (file.size > 2 * 1024 * 1024) {
    showMessage('图片大小不能超过2MB', 'error')
    return
  }
  
  // 文件类型验证
  if (!file.type.startsWith('image/')) {
    showMessage('请上传图片文件', 'error')
    return
  }
  
  // 创建本地预览（实际项目中需要上传到服务器）
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
  }
  reader.readAsDataURL(file)
}

// 移除头像
const removeAvatar = () => {
  formData.value.avatar = ''
}

// 保存资料
const handleSave = async () => {
  // 验证用户名
  if (!formData.value.username.trim()) {
    showMessage('请输入用户名', 'error')
    return
  }
  
  if (formData.value.username.length < 2 || formData.value.username.length > 20) {
    showMessage('用户名长度应为2-20位字符', 'error')
    return
  }
  
  loading.value = true
  message.value = null
  
  try {
    const response = await updateProfile({
      username: formData.value.username,
      bio: formData.value.bio,
      avatar: formData.value.avatar,
      social: formData.value.social
    })
    
    if (response.code === 200) {
      // 更新store中的用户信息
      authStore.updateUser(response.data.user)
      
      showMessage('个人资料更新成功', 'success')
      
      // 2秒后跳转回个人主页
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } else {
      showMessage(response.message || '更新失败', 'error')
    }
  } catch (error) {
    showMessage(error.message || '网络错误，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 显示消息
const showMessage = (text, type = 'info') => {
  message.value = { text, type }
  // 3秒后自动清除消息
  setTimeout(() => {
    message.value = null
  }, 3000)
}

onMounted(() => {
  loadUserData()
})
</script> -->

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { updateProfile, getProfile } from '@/api/user' // 正确引用
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/default-avatar.png'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  email: '',
  bio: '',
  avatar: '',
  social: {
    github: '',
    weibo: ''
  }
})

const loading = ref(false)
const message = ref(null)

// 加载用户数据
const loadUserData = async () => {
  try {
    const response = await getProfile() // 使用新的API
    if (response.code === 200) {
      const userData = response.data.user || response.data
      formData.value = {
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        social: userData.social || {
          github: '',
          weibo: ''
        }
      }
    }
  } catch (error) {
    showMessage('加载用户信息失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 头像上传处理
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 文件大小限制（2MB）
  if (file.size > 2 * 1024 * 1024) {
    showMessage('图片大小不能超过2MB', 'error')
    return
  }
  
  // 文件类型验证
  if (!file.type.startsWith('image/')) {
    showMessage('请上传图片文件', 'error')
    return
  }
  
  // 实际项目中：上传到服务器并获取URL
  // 这里先使用本地预览，保存时再上传
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
    
    // 提示用户需要保存
    showMessage('头像已选择，点击保存按钮上传到服务器', 'info')
  }
  reader.readAsDataURL(file)
}

// 移除头像
const removeAvatar = () => {
  formData.value.avatar = ''
  showMessage('头像已移除，点击保存按钮应用更改', 'info')
}

// 保存资料
const handleSave = async () => {
  // 验证用户名
  if (!formData.value.username.trim()) {
    showMessage('请输入用户名', 'error')
    return
  }
  
  if (formData.value.username.length < 2 || formData.value.username.length > 20) {
    showMessage('用户名长度应为2-20位字符', 'error')
    return
  }
  
  loading.value = true
  message.value = null
  
  try {
    // 准备上传数据
    const uploadData = {
      username: formData.value.username.trim(),
      bio: formData.value.bio || '',
      avatar: formData.value.avatar || '',
      social: formData.value.social
    }
    
    const response = await updateProfile(uploadData)
    
    if (response.code === 200) {
      // 更新store中的用户信息
      const userData = response.data.user || response.data
      authStore.updateUser(userData)
      
      showMessage('个人资料更新成功', 'success')
      
      // 2秒后跳转回个人主页
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } else {
      showMessage(response.message || '更新失败', 'error')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showMessage(error.message || '网络错误，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 显示消息
const showMessage = (text, type = 'info') => {
  message.value = { text, type }
  // 3秒后自动清除消息
  setTimeout(() => {
    message.value = null
  }, 3000)
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-header {
  margin-bottom: 30px;
  text-align: center;
}

.profile-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.profile-header p {
  color: #666;
  font-size: 16px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: background 0.3s;
  display: inline-block;
  width: fit-content;
}

.upload-btn:hover {
  background: #0056b3;
}

.remove-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
  width: fit-content;
}

.remove-btn:hover {
  background: #c82333;
}

.avatar-hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

/* 表单区域 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
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

.form-group input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
}

.input-hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

/* 个人简介 */
.bio-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.bio-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.bio-counter {
  text-align: right;
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

/* 带图标的输入框 */
.input-with-icon {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.input-icon {
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  font-size: 14px;
  border-right: 1px solid #ddd;
  white-space: nowrap;
}

.input-with-icon input {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 16px;
}

.input-with-icon input:focus {
  outline: none;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.save-btn {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.save-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 消息提示 */
.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>