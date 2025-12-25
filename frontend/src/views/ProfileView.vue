<template>
  <div class="profile-view">
    <!-- 用户封面 -->
    <div class="cover-section">
      <div class="cover-container">
        <img 
          :src="user.cover || '/default-cover.jpg'" 
          alt="cover" 
          class="cover-image"
        />
        <div class="cover-overlay"></div>
        <button class="edit-cover-btn" @click="editCover">
          <i class="icon-camera"></i> 编辑封面
        </button>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="profile-info">
      <div class="avatar-container">
        <div class="avatar-wrapper">
          <img 
            :src="user.avatar || '/default-avatar.png'" 
            alt="avatar" 
            class="user-avatar"
          />
          <button class="edit-avatar-btn" @click="editAvatar">
            <i class="icon-edit"></i>
          </button>
        </div>
        <div class="user-details">
          <h1 class="username">{{ user.username }}</h1>
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
                <img 
                  :src="user.avatar || '/default-avatar.png'" 
                  alt="avatar"
                  class="activity-avatar"
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
                  <img :src="activity.item.cover" :alt="activity.item.title" />
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
              <img :src="item.cover" :alt="item.title" />
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
import { ref, onMounted, computed, watch } from 'vue'  // 添加 watch 导入
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import FollowButton from './FollowButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const userId = computed(() => {
  return route.params.id || authStore.userId || 'me'
})

// 响应式数据
const user = ref({
  _id: '',
  username: '加载中...',
  avatar: '',
  cover: '',
  bio: '',
  vipLevel: 'VIP 1',
  level: 1,
  isFollowing: false,
  createdAt: new Date(),
  lastActive: new Date()
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

// 计算属性
const isOwnProfile = computed(() => {
  // 这里需要根据登录状态判断
  return !userId || userId === 'me'
})

// 标签页配置
const tabs = [
  { id: 'activities', label: '动态', icon: 'icon-feed' },
  { id: 'collections', label: '收藏', icon: 'icon-collection' },
  { id: 'about', label: '关于', icon: 'icon-info' }
]

const loadUserData = async () => {
  try {
    const endpoint = userId.value && userId.value !== 'me' 
      ? `/api/users/${userId.value}` 
      : '/api/users/me'
    
    const response = await axios.get(endpoint)
    user.value = response.data.user
  } catch (error) {
    console.error('加载用户数据失败:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const endpoint = userId ? `/api/users/${userId}/stats` : '/api/users/me/stats'
    const response = await axios.get(endpoint)
    stats.value = response.data.stats
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载动态
const loadActivities = async () => {
  try {
    const endpoint = userId ? `/api/users/${userId}/activities` : '/api/activities/feed'
    const response = await axios.get(endpoint)
    activities.value = response.data.activities
  } catch (error) {
    console.error('加载动态失败:', error)
  }
}

// 加载收藏
const loadCollections = async () => {
  try {
    const endpoint = userId ? `/api/users/${userId}/collections` : '/api/users/me/collections'
    const response = await axios.get(endpoint)
    collections.value = response.data.collections
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

// 格式化时间
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

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 获取动态类型
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

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 切换点赞
const toggleLike = async (activityId) => {
  try {
    const activity = activities.value.find(a => a._id === activityId)
    if (activity) {
      activity.isLiked = !activity.isLiked
      activity.likeCount = activity.isLiked 
        ? (activity.likeCount || 0) + 1 
        : Math.max(0, (activity.likeCount || 1) - 1)
      
      await axios.post(`/api/activities/${activityId}/like`)
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 显示评论
const showComments = (activityId) => {
  console.log('显示评论:', activityId)
}

// 查看内容
const viewItem = (itemId) => {
  router.push(`/item/${itemId}`)
}

// 处理关注变化
const handleFollowChange = (isFollowing) => {
  user.value.isFollowing = isFollowing
  stats.value.followers += isFollowing ? 1 : -1
}

// 编辑资料
const editProfile = () => {
  showEditModal.value = true
}

// 保存资料
const saveProfile = async () => {
  try {
    const response = await axios.put('/api/profile', editForm.value)
    user.value = { ...user.value, ...response.data.user }
    showEditModal.value = false
  } catch (error) {
    console.error('保存资料失败:', error)
  }
}

// 编辑封面
const editCover = () => {
  console.log('编辑封面')
  // 实现封面上传
}

// 编辑头像
const editAvatar = () => {
  console.log('编辑头像')
  // 实现头像上传
}

// 分享资料
const shareProfile = () => {
  const shareUrl = `${window.location.origin}/user/${user.value._id}`
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert('个人主页链接已复制到剪贴板')
  })
}

// 导航到不同页面
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
      break
    case 'activities':
      activeTab.value = 'activities'
      break
  }
}

// 监听标签页变化
watch(activeTab, (newTab) => {
  if (newTab === 'activities') {
    loadActivities()
  } else if (newTab === 'collections') {
    loadCollections()
  }
})

onMounted(() => {
  // 如果访问自己的页面且未登录，跳转到登录
  if (!route.params.id && !authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  loadUserData()
  loadStats()
  loadActivities()
})
</script>

<style scoped>
/* 保持原有的所有样式不变 */
.profile-view {
  background: #0f0f23;
  min-height: 100vh;
  color: white;
}

/* ... 原有所有样式保持不变 ... */

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  
  .avatar-container {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tabs {
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .activity-preview {
    flex-direction: column;
  }
  
  .preview-cover {
    width: 100%;
    height: 160px;
  }
}
</style>