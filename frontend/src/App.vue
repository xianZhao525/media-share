<template>
  <div id="app">
    <!-- 腾讯风格导航栏 -->
    <div class="tx-navbar">
      <div class="tx-navbar-content">
        <!-- 左侧logo -->
        <div class="tx-navbar-left">
          <div class="tx-logo">
            <span class="tx-logo-icon">🎬</span>
            <span class="tx-logo-text">影视社交</span>
          </div>
        </div>
        
        <!-- 中间搜索 -->
        <div class="tx-navbar-center">
          <div class="tx-search-box">
            <i class="tx-icon-search"></i>
            <input 
              type="text" 
              placeholder="搜索影视、音乐或用户" 
              class="tx-search-input"
            />
          </div>
        </div>
        
        <!-- 右侧用户 -->
        <div class="tx-navbar-right">
          <div class="tx-user-menu">
            <img 
              :src="currentUser.avatar" 
              :alt="currentUser.username"
              class="tx-user-avatar"
            />
            <div class="tx-user-dropdown">
              <router-link to="/activities/feed" class="tx-dropdown-item">
                <i class="tx-icon-feed"></i> 我的动态
              </router-link>
              <router-link to="/user/current" class="tx-dropdown-item">
                <i class="tx-icon-profile"></i> 个人主页
              </router-link>
              <div class="tx-divider"></div>
              <a href="#" class="tx-dropdown-item">
                <i class="tx-icon-settings"></i> 设置
              </a>
              <a href="#" class="tx-dropdown-item tx-logout">
                <i class="tx-icon-logout"></i> 退出登录
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 腾讯风格标签栏 -->
      <div class="tx-tabbar">
        <router-link 
          to="/activities/feed" 
          class="tx-tab-item"
          :class="{ active: $route.path.includes('feed') }"
        >
          <i class="tx-tab-icon">🏠</i>
          <span class="tx-tab-text">动态</span>
        </router-link>
        
        <router-link 
          to="/explore" 
          class="tx-tab-item"
        >
          <i class="tx-tab-icon">🔍</i>
          <span class="tx-tab-text">发现</span>
        </router-link>
        
        <router-link 
          to="/messages" 
          class="tx-tab-item"
        >
          <i class="tx-tab-icon">💬</i>
          <span class="tx-tab-text">消息</span>
          <span class="tx-badge">3</span>
        </router-link>
        
        <router-link 
          to="/user/current" 
          class="tx-tab-item"
          :class="{ active: $route.path.includes('user') }"
        >
          <i class="tx-tab-icon">👤</i>
          <span class="tx-tab-text">我</span>
        </router-link>
      </div>
    </div>
    
    <!-- 主要内容区 -->
    <main class="tx-main-container">
      <router-view />
    </main>
    
    <!-- 腾讯风格浮动按钮 -->
    <button class="tx-float-btn" @click="showPostModal">
      <i class="tx-icon-plus">✏️</i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 当前用户
const currentUser = ref({
  avatar: 'https://via.placeholder.com/40/00a1d6/ffffff',
  username: '腾讯用户'
})

// 显示发布模态框
const showPostModal = () => {
  router.push('/post/new')
}
</script>

<style scoped>
#app {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(180deg, #f5f6fa 0%, #ffffff 100%);
  min-height: 100vh;
}

/* === 腾讯风格导航栏 === */
.tx-navbar {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.tx-navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo区域 */
.tx-navbar-left {
  flex-shrink: 0;
}

.tx-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.tx-logo-icon {
  font-size: 24px;
}

/* 搜索区域 */
.tx-navbar-center {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.tx-search-box {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-search-box:focus-within {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.02);
}

.tx-icon-search:before {
  content: '🔍';
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 8px;
}

.tx-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  padding: 10px 0;
  outline: none;
  width: 100%;
}

.tx-search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* 用户区域 */
.tx-navbar-right {
  flex-shrink: 0;
}

.tx-user-menu {
  position: relative;
  cursor: pointer;
}

.tx-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.tx-user-menu:hover .tx-user-avatar {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.tx-user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  margin-top: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
}

.tx-user-menu:hover .tx-user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.tx-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.tx-dropdown-item:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.tx-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

.tx-logout {
  color: #ff4d4f;
}

/* === 腾讯风格标签栏 === */
.tx-tabbar {
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.tx-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #999;
  position: relative;
  padding: 8px 12px;
  flex: 1;
  transition: all 0.3s;
}

.tx-tab-icon {
  font-size: 22px;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.tx-tab-text {
  font-size: 11px;
  font-weight: 500;
}

.tx-tab-item.active {
  color: #1677ff;
}

.tx-tab-item.active .tx-tab-icon {
  transform: translateY(-2px);
}

.tx-badge {
  position: absolute;
  top: 2px;
  right: 20px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* === 主内容区 === */
.tx-main-container {
  max-width: 768px;
  margin: 0 auto;
  padding: 16px 16px 72px;
  min-height: 100vh;
}

/* === 浮动按钮 === */
.tx-float-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(22, 119, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 998;
}

.tx-float-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 30px rgba(22, 119, 255, 0.6);
}

.tx-float-btn:active {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tx-navbar-content {
    padding: 0 12px;
  }
  
  .tx-navbar-center {
    margin: 0 12px;
  }
  
  .tx-search-input {
    font-size: 13px;
  }
  
  .tx-logo-text {
    display: none;
  }
  
  .tx-main-container {
    padding: 12px 12px 72px;
  }
}
</style>