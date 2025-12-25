<template>
  <div class="profile-view" v-if="!loading">
    <!-- 用户封面 -->
    <div class="cover-section">
      <div class="cover-container">
        <img 
          :src="user.cover || 'https://picsum.photos/seed/' + (user._id || 'default-cover') + '/1200/300?blur=2'" 
          alt="cover" 
          class="cover-image"
        />
        <div class="cover-overlay"></div>
        <button v-if="isOwnProfile" class="edit-cover-btn" @click="editCover">
          <i class="icon-camera"></i> 编辑封面
        </button>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="profile-info">
      <div class="avatar-container">
        <div class="avatar-wrapper">
          <!-- 风景头像 -->
          <img 
            :src="user.avatar || `https://picsum.photos/seed/landscape-${user._id || 'default'}/200/200?random=1`" 
            alt="avatar" 
            class="user-avatar"
          />
          <button v-if="isOwnProfile" class="edit-avatar-btn" @click="editAvatar">
            <i class="icon-edit"></i>
          </button>
        </div>
        <div class="user-details">
          <h1 class="username">{{ user.username || '用户' }}</h1>
          <div class="user-tags">
            <span class="user-tag vip">
              <i class="icon-vip"></i> {{ user.vipLevel || 'VIP 1' }}
            </span>
            <span class="user-tag level">
              <i class="icon-level"></i> Lv.{{ user.level || 1 }}
            </span>
          </div>
          <p class="user-bio">{{ user.bio || '这个人很懒，什么都没有写~' }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <FollowButton 
          v-if="!isOwnProfile && user._id"
          :userId="user._id"
          :initialFollowing="user.isFollowing"
          size="large"
          @follow-change="handleFollowChange"
        />
        <button v-if="isOwnProfile" class="edit-profile-btn" @click="editProfile">
          <i class="icon-edit"></i> 编辑资料
        </button>
        <button class="share-btn" @click="shareProfile">
          <i class="icon-share"></i> 分享
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card" @click="navigateTo('following')">
        <div class="stat-icon follow">
          <i class="icon-follow"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.following || 0 }}</span>
          <span class="stat-label">关注</span>
        </div>
      </div>
      <div class="stat-card" @click="navigateTo('followers')">
        <div class="stat-icon follower">
          <i class="icon-follower"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.followers || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
      </div>
      <div class="stat-card" @click="navigateTo('collections')">
        <div class="stat-icon collection">
          <i class="icon-collection"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.collections || 0 }}</span>
          <span class="stat-label">收藏</span>
        </div>
      </div>
      <div class="stat-card" @click="navigateTo('activities')">
        <div class="stat-icon activity">
          <i class="icon-activity"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.activities || 0 }}</span>
          <span class="stat-label">动态</span>
        </div>
      </div>
    </div>

    <!-- 动态标签页 -->
    <div class="tabs-section">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          class="tab-btn"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 动态内容 -->
    <div class="profile-content">
      <!-- 动态流 -->
      <div v-if="activeTab === 'activities'" class="activities-feed">
        <div v-if="activities.length > 0" class="activities-list">
          <div 
            v-for="activity in activities" 
            :key="activity._id"
            class="activity-item"
          >
            <div class="activity-header">
              <div class="activity-user">
                <!-- 风景动态头像 -->
                <img 
                  src="https://picsum.photos/200/200?random=1" 
                  alt="avatar" 
                  class="user-avatar"
                />
              </div>
              <div class="activity-info">
                <span class="activity-name">{{ user.username }}</span>
                <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                <span class="activity-type">{{ getActivityType(activity.type) }}</span>
              </div>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.content }}</p>
              <div v-if="activity.item" class="activity-preview">
                <div class="preview-cover">
                  <img :src="'https://picsum.photos/seed/item-' + (activity.item._id || 'item') + '/300/200'" :alt="activity.item.title" />
                </div>
                <div class="preview-info">
                  <h4>{{ activity.item.title }}</h4>
                  <p class="preview-desc">{{ activity.item.description }}</p>
                </div>
              </div>
            </div>
            <div class="activity-actions">
              <button 
                class="action-btn like-btn"
                :class="{ liked: activity.isLiked }"
                @click="toggleLike(activity._id)"
              >
                <i :class="activity.isLiked ? 'icon-heart-filled' : 'icon-heart'"></i>
                <span>{{ activity.likeCount || 0 }}</span>
              </button>
              <button class="action-btn comment-btn" @click="showComments(activity._id)">
                <i class="icon-comment"></i>
                <span>{{ activity.commentCount || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="icon-empty"></i>
          </div>
          <h3>还没有动态</h3>
          <p>快去发布内容或关注其他用户吧</p>
        </div>
      </div>

      <!-- 收藏 -->
      <div v-else-if="activeTab === 'collections'" class="collections-grid">
        <div v-if="collections.length > 0" class="collection-items">
          <div 
            v-for="item in collections" 
            :key="item._id"
            class="collection-item"
            @click="viewItem(item._id)"
          >
            <div class="item-cover">
              <img :src="'https://picsum.photos/seed/collection-' + (item._id || 'collection') + '/300/400'" :alt="item.title" />
              <div class="item-overlay">
                <span class="item-type">{{ item.type }}</span>
                <span class="item-rating" v-if="item.averageRating">
                  <i class="icon-star"></i> {{ item.averageRating.toFixed(1) }}
                </span>
              </div>
            </div>
            <div class="item-info">
              <h4 class="item-title">{{ item.title }}</h4>
              <p class="item-desc">{{ truncateText(item.description, 50) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="icon-collection-empty"></i>
          </div>
          <h3>还没有收藏</h3>
          <p>收藏你喜欢的内容</p>
        </div>
      </div>

      <!-- 关于 -->
      <div v-else-if="activeTab === 'about'" class="about-section">
        <div class="about-card">
          <h3 class="about-title">个人资料</h3>
          <div class="about-info">
            <div class="info-item">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后活跃</span>
              <span class="info-value">{{ formatTime(user.lastActive) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所在地</span>
              <span class="info-value">{{ user.location || '未设置' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑个人资料</h3>
          <button class="modal-close" @click="showEditModal = false">
            <i class="icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProfile">
            <div class="form-group">
              <label>用户名</label>
              <input 
                type="text" 
                v-model="editForm.username"
                placeholder="请输入用户名"
              />
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea 
                v-model="editForm.bio"
                placeholder="介绍一下自己吧"
                rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showEditModal = false">
                取消
              </button>
              <button type="submit" class="btn-save">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'  
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import FollowButton from './FollowButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// ✅ 关键：使用计算属性获取用户ID
const userId = computed(() => {
  return route.params.id || authStore.userId || 'me'
})

// ✅ 添加加载状态防止 undefined 错误
const loading = ref(true)

// 响应式数据
const user = ref({
  _id: '',
  username: '用户',
  avatar: '',
  cover: '',
  bio: '',
  vipLevel: 'VIP 1',
  level: 1,
  isFollowing: false,
  createdAt: new Date(),
  lastActive: new Date(),
  following: [],
  followers: [],
  favorites: [],
  stats: { itemsCount: 0 }
})

const stats = ref({
  following: 0,
  followers: 0,
  collections: 0,
  activities: 0
})

const activities = ref([])
const collections = ref([])
const showEditModal = ref(false)
const activeTab = ref('activities')

// 编辑表单
const editForm = ref({
  username: '',
  bio: ''
})

// ✅ 修复：正确的 isOwnProfile 计算属性
const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === 'me' || route.params.id === authStore.userId
})

// 标签页配置
const tabs = [
  { id: 'activities', label: '动态', icon: 'icon-feed' },
  { id: 'collections', label: '收藏', icon: 'icon-collection' },
  { id: 'about', label: '关于', icon: 'icon-info' }
]

// 数据加载函数
const loadUserData = async () => {
  try {
    loading.value = true
    
    // ✅ 使用 userId.value
    const endpoint = userId.value && userId.value !== 'me' 
      ? `/api/users/${userId.value}` 
      : '/api/users/me'
    
    const response = await axios.get(endpoint)
    
    // ✅ 添加数据验证
    if (response.data?.code === 200 && response.data.data?.user) {
      user.value = response.data.data.user
      // 预填充编辑表单
      editForm.value.username = user.value.username || ''
      editForm.value.bio = user.value.bio || ''
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    if (error.response?.data?.code === 401) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const endpoint = userId.value && userId.value !== 'me' 
      ? `/api/users/${userId.value}/stats` 
      : '/api/users/me/stats'  // ✅ 使用独立的 /me/stats 路由
    const response = await axios.get(endpoint)
    stats.value = response.data.data.stats
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载动态
const loadActivities = async () => {
  try {
    const endpoint = userId.value && userId.value !== 'me' 
      ? `/api/users/${userId.value}/activities` 
      : '/api/users/me/activities'  // ✅ 使用独立的 /me/activities 路由
    const response = await axios.get(endpoint)
    activities.value = response.data.data.activities
  } catch (error) {
    console.error('加载动态失败:', error)
  }
}

// ✅ 新增：加载收藏
const loadCollections = async () => {
  try {
    const endpoint = userId.value && userId.value !== 'me'
      ? `/api/users/${userId.value}/collections`
      : '/api/users/me/collections'  // ✅ 使用独立的 /me/collections 路由
    
    const response = await axios.get(endpoint)
    collections.value = response.data.data.collections
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

// 工具函数
const formatTime = (timestamp) => {
  if (!timestamp) return '刚刚'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

const formatDate = (timestamp) => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const getActivityType = (type) => {
  const typeMap = {
    'review': '发表了评论',
    'follow': '关注了',
    'like': '点赞了',
    'create': '发布了',
    'share': '分享了'
  }
  return typeMap[type] || '更新了动态'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 交互函数
const toggleLike = async (activityId) => { /* 保持不变 */ }
const showComments = (activityId) => { console.log('显示评论:', activityId) }
const viewItem = (itemId) => { router.push(`/item/${itemId}`) }
const handleFollowChange = (isFollowing) => {
  user.value.isFollowing = isFollowing
  stats.value.followers += isFollowing ? 1 : -1
}
const editProfile = () => { showEditModal.value = true }
const shareProfile = () => {
  const shareUrl = `${window.location.origin}/user/${user.value._id}`
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert('个人主页链接已复制到剪贴板')
  })
}
const navigateTo = (page) => {
  switch (page) {
    case 'following':
      router.push(`/user/${user.value._id}/following`)
      break
    case 'followers':
      router.push(`/user/${user.value._id}/followers`)
      break
    case 'collections':
      activeTab.value = 'collections'
      loadCollections()
      break
    case 'activities':
      activeTab.value = 'activities'
      loadActivities()
      break
  }
}

// 生命周期和监听
onMounted(() => {
  if (!route.params.id && !authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  loadUserData()
  loadStats()
  loadActivities()
})

watch(userId, (newId) => {
  if (newId) {
    loadUserData()
    loadStats()
    loadActivities()
  }
})

watch(activeTab, (newTab) => {
  if (newTab === 'activities') {
    loadActivities()
  } else if (newTab === 'collections') {
    loadCollections()
  }
})
</script>

<style scoped>
/* 保持原有样式 */
.user-welcome {
  background: #f8f9fa;
  padding: 15px 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.logout-btn {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 原有 profile-view 样式 */
.profile-view {
  background: #0f0f23;
  min-height: 100vh;
  color: white;
}

.cover-section {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.cover-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7));
}

.edit-cover-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.profile-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 40px;
  margin-top: -60px;
  position: relative;
  z-index: 1;
}

.avatar-container {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #0f0f23;
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #007bff;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.user-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.user-tag {
  padding: 4px 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  font-size: 12px;
}

.user-bio {
  font-size: 14px;
  color: #ccc;
}

/* 所有其他原有样式... */
</style>