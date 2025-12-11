<template>
  <div class="tx-profile-container">
    <!-- 腾讯风格个人主页头部 -->
    <div class="tx-profile-header">
      <!-- 背景图 -->
      <div class="tx-profile-bg">
        <img 
          :src="user.cover || '/tx-default-cover.jpg'" 
          alt="cover"
          class="tx-bg-image"
        />
        <div class="tx-bg-overlay"></div>
      </div>

      <!-- 用户信息卡片 -->
      <div class="tx-profile-card">
        <div class="tx-profile-main">
          <!-- 用户头像 -->
          <div class="tx-avatar-section">
            <div class="tx-avatar-container">
              <img 
                :src="user.avatar || '/tx-default-avatar.png'" 
                alt="avatar"
                class="tx-profile-avatar"
              />
              <div v-if="user.isOnline" class="tx-online-status"></div>
              <div v-if="user.vipLevel > 0" class="tx-vip-badge">
                VIP{{ user.vipLevel }}
              </div>
            </div>
            <button class="tx-avatar-edit" v-if="isSelf">
              <i class="tx-icon-camera">📷</i>
            </button>
          </div>

          <!-- 用户基础信息 -->
          <div class="tx-basic-info">
            <div class="tx-name-section">
              <h1 class="tx-username">{{ user.username }}</h1>
              <div v-if="user.gender" class="tx-gender">
                <i :class="user.gender === 'male' ? 'tx-icon-male' : 'tx-icon-female'"></i>
              </div>
              <div v-if="user.age" class="tx-age">{{ user.age }}岁</div>
              <span v-if="user.city" class="tx-city">
                <i class="tx-icon-location">📍</i>
                {{ user.city }}
              </span>
            </div>
            
            <div class="tx-signature">
              {{ user.bio || '这个人很神秘，什么都没有留下~' }}
            </div>

            <!-- 用户标签 -->
            <div v-if="user.tags && user.tags.length > 0" class="tx-tags">
              <span 
                v-for="tag in user.tags" 
                :key="tag"
                class="tx-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="tx-action-buttons">
            <FollowButton 
              v-if="!isSelf"
              :userId="user._id"
              :initialFollowing="user.isFollowing"
              size="large"
              @follow-change="handleFollowChange"
              class="tx-follow-btn"
            />
            
            <button v-if="!isSelf" class="tx-message-btn" @click="sendMessage">
              <i class="tx-icon-message">💬</i>
              <span>发消息</span>
            </button>
            
            <button v-if="!isSelf" class="tx-more-btn" @click="showMoreActions">
              <i class="tx-icon-more">⋯</i>
            </button>

            <button v-if="isSelf" class="tx-edit-btn" @click="editProfile">
              <i class="tx-icon-edit">✏️</i>
              <span>编辑资料</span>
            </button>
            
            <!-- 新增：跳转到动态页面按钮 -->
            <button class="tx-feed-btn" @click="goToActivityFeed">
              <i class="tx-icon-feed">📱</i>
              <span>动态广场</span>
            </button>
          </div>
        </div>

        <!-- 用户数据统计 -->
        <div class="tx-profile-stats">
          <div 
            v-for="stat in stats" 
            :key="stat.id"
            class="tx-stat-item"
            @click="navigateTo(stat.id)"
          >
            <div class="tx-stat-number">{{ stat.value }}</div>
            <div class="tx-stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 腾讯风格标签栏 -->
    <div class="tx-profile-tabs">
      <div class="tx-tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ 'active': activeTab === tab.id }"
          @click="activeTab = tab.id"
          class="tx-tab"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count" class="tx-tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- 动态内容区域 -->
    <div class="tx-profile-content">
      <!-- 动态列表 -->
      <div v-if="activeTab === 'activities'" class="tx-activities-tab">
        <div v-if="activities.length > 0" class="tx-activity-list">
          <div 
            v-for="activity in activities" 
            :key="activity._id"
            class="tx-activity-item"
            @click="viewActivityDetail(activity._id)"
          >
            <div class="tx-activity-header">
              <img :src="user.avatar" class="tx-activity-avatar" />
              <div class="tx-activity-user-info">
                <span class="tx-activity-username">{{ user.username }}</span>
                <span class="tx-activity-time">{{ formatTime(activity.createdAt) }}</span>
              </div>
            </div>
            
            <!-- 动态文本 -->
            <p class="tx-activity-text">
              {{ truncateText(activity.content, 100) }}
            </p>
            
            <!-- 图片预览 -->
            <div v-if="activity.images && activity.images.length > 0" class="tx-activity-images">
              <div class="tx-image-grid">
                <img 
                  v-for="(img, index) in activity.images.slice(0, 3)" 
                  :key="index"
                  :src="img.url" 
                  :alt="`图片${index + 1}`"
                  class="tx-image-thumb"
                />
                <div v-if="activity.images.length > 3" class="tx-image-more">
                  +{{ activity.images.length - 3 }}
                </div>
              </div>
            </div>
            
            <!-- 互动统计 -->
            <div class="tx-activity-stats">
              <span class="tx-stat">
                <i class="tx-icon-like-small">👍</i>
                {{ activity.likeCount || 0 }}
              </span>
              <span class="tx-stat">
                <i class="tx-icon-comment-small">💬</i>
                {{ activity.commentCount || 0 }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="tx-empty-content">
          <div class="tx-empty-illustration">
            <i class="tx-icon-empty-activity">📝</i>
          </div>
          <h3>暂无动态</h3>
          <p v-if="isSelf">去发布你的第一条动态吧</p>
          <p v-else>该用户最近没有发布动态</p>
          <button v-if="isSelf" class="tx-publish-btn" @click="showPostModal">
            <i class="tx-icon-plus">✏️</i>
            <span>发布动态</span>
          </button>
        </div>
      </div>

      <!-- 相册标签 -->
      <div v-else-if="activeTab === 'photos'" class="tx-photos-tab">
        <div v-if="photos.length > 0" class="tx-photo-grid">
          <div 
            v-for="photo in photos"
            :key="photo._id"
            class="tx-photo-item"
            @click="viewPhoto(photo)"
          >
            <img :src="photo.url" :alt="photo.description" />
            <div class="tx-photo-overlay">
              <div class="tx-photo-meta">
                <span class="tx-like-count">
                  <i class="tx-icon-heart-small">❤️</i>
                  {{ photo.likeCount }}
                </span>
                <span class="tx-comment-count">
                  <i class="tx-icon-comment-small">💬</i>
                  {{ photo.commentCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="tx-empty-content">
          <div class="tx-empty-illustration">
            <i class="tx-icon-empty-photo">🖼️</i>
          </div>
          <h3>暂无照片</h3>
        </div>
      </div>

      <!-- 收藏标签 -->
      <div v-else-if="activeTab === 'collections'" class="tx-collections-tab">
        <div v-if="collections.length > 0" class="tx-collection-list">
          <div 
            v-for="item in collections"
            :key="item._id"
            class="tx-collection-item"
            @click="viewCollection(item)"
          >
            <div class="tx-collection-cover">
              <img :src="item.cover" :alt="item.title" />
              <div class="tx-collection-type">{{ item.type }}</div>
            </div>
            <div class="tx-collection-info">
              <h4>{{ item.title }}</h4>
              <p>{{ truncateText(item.description, 60) }}</p>
              <div class="tx-collection-meta">
                <span>{{ formatDate(item.createdAt) }}收藏</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="tx-empty-content">
          <div class="tx-empty-illustration">
            <i class="tx-icon-empty-collection">⭐</i>
          </div>
          <h3>暂无收藏</h3>
        </div>
      </div>

      <!-- 关注/粉丝标签 -->
      <div v-else-if="['following', 'followers'].includes(activeTab)" class="tx-relationship-tab">
        <div v-if="relationships.length > 0" class="tx-relationship-list">
          <div 
            v-for="rel in relationships"
            :key="rel._id"
            class="tx-relationship-item"
            @click="viewUserProfile(rel._id)"
          >
            <img :src="rel.avatar" :alt="rel.username" />
            <div class="tx-relationship-info">
              <div class="tx-rel-name">
                <span>{{ rel.username }}</span>
                <span v-if="rel.vip" class="tx-vip-tag">VIP</span>
              </div>
              <div class="tx-rel-desc">{{ truncateText(rel.bio, 40) }}</div>
            </div>
            <FollowButton 
              v-if="!rel.isSelf"
              :userId="rel._id"
              :initialFollowing="rel.isFollowing"
              size="small"
            />
          </div>
        </div>
        <div v-else class="tx-empty-content">
          <div class="tx-empty-illustration">
            <i class="tx-icon-empty-relation">👥</i>
          </div>
          <h3>暂无{{ activeTab === 'following' ? '关注' : '粉丝' }}</h3>
        </div>
      </div>
    </div>

    <!-- 浮动按钮 -->
    <button v-if="isSelf" class="tx-profile-float-btn" @click="showPostModal">
      <i class="tx-icon-plus">✏️</i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FollowButton from './FollowButton.vue'
import { activityApi } from '@/api/activityApi';

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// 响应式数据
const user = ref({
  _id: userId,
  username: 'VVVIP用户',
  avatar: 'https://via.placeholder.com/150/00a1d6/ffffff',
  cover: 'https://via.placeholder.com/1200x400/1a1a2e/00a1d6',
  bio: '热爱生活，喜欢分享，记录每一个美好瞬间。',
  gender: 'female',
  age: 18,
  city: '深圳',
  isOnline: true,
  vipLevel: 3,
  tags: ['电影爱好者', '旅行达人', '美食家', '摄影师'],
  isFollowing: false,
  createdAt: '2022-01-15'
})

const isSelf = computed(() => {
  return userId === 'current' || userId === 'me' || userId === 'self'
})

// 统计数据
const stats = ref([
  { id: 'activities', label: '动态', value: 156 },
  { id: 'followers', label: '粉丝', value: 1234 },
  { id: 'following', label: '关注', value: 89 },
  { id: 'collections', label: '收藏', value: 567 }
])

// 标签页
const tabs = ref([
  { id: 'activities', label: '动态', icon: 'tx-icon-activities', count: 156 },
  { id: 'photos', label: '相册', icon: 'tx-icon-photos', count: 45 },
  { id: 'collections', label: '收藏', icon: 'tx-icon-collections', count: 567 },
  { id: 'following', label: '关注', icon: 'tx-icon-following', count: 89 },
  { id: 'followers', label: '粉丝', icon: 'tx-icon-followers', count: 1234 }
])

const activeTab = ref('activities')

// 模拟数据
const activities = ref([
  {
    _id: 'act001',
    content: '刚看完《流浪地球2》，特效真的太震撼了！中国科幻电影的里程碑之作。',
    images: [
      { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop' }
    ],
    likeCount: 42,
    commentCount: 8,
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    _id: 'act002',
    content: '分享今天在西湖拍的美景，春色满园关不住，一枝红杏出墙来。',
    images: [
      { url: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&h=300&fit=crop' }
    ],
    likeCount: 89,
    commentCount: 15,
    createdAt: new Date(Date.now() - 3600000)
  }
])

const photos = ref([
  {
    _id: 'photo1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    likeCount: 42,
    commentCount: 8,
    description: '山顶风景'
  },
  {
    _id: 'photo2',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
    likeCount: 56,
    commentCount: 12,
    description: '城市夜景'
  }
])

const collections = ref([
  {
    _id: 'col1',
    title: '科幻电影收藏',
    cover: 'https://via.placeholder.com/350x200/00a1d6/ffffff',
    description: '收集了我最喜欢的科幻电影，包括星际穿越、银翼杀手等经典作品',
    type: '电影',
    createdAt: '2023-10-15'
  },
  {
    _id: 'col2',
    title: '旅行照片集',
    cover: 'https://via.placeholder.com/350x200/ff6b6b/ffffff',
    description: '记录我在世界各地旅行的美好瞬间和风景照片',
    type: '照片',
    createdAt: '2023-09-20'
  }
])

const relationships = ref([
  {
    _id: 'user001',
    username: '电影爱好者',
    avatar: 'https://via.placeholder.com/40/00a1d6/ffffff',
    bio: '热爱电影，尤其是科幻片',
    vip: true,
    isFollowing: true,
    isSelf: false
  },
  {
    _id: 'user002',
    username: '旅行达人',
    avatar: 'https://via.placeholder.com/40/ff6b6b/ffffff',
    bio: '走遍世界各地，分享旅行故事',
    vip: false,
    isFollowing: true,
    isSelf: false
  }
])

// 加载用户动态
const loadUserActivities = async () => {
  try {
    const response = await activityApi.getUserActivities(userId, {
      page: 1,
      limit: 20
    });
    activities.value = response.data;
  } catch (error) {
    console.error('加载用户动态失败:', error);
  }
};

// 方法
const handleFollowChange = (isFollowing) => {
  user.value.isFollowing = isFollowing
  if (isFollowing) {
    stats.value.find(s => s.id === 'followers').value++
  } else {
    stats.value.find(s => s.id === 'followers').value = 
      Math.max(0, stats.value.find(s => s.id === 'followers').value - 1)
  }
}

const sendMessage = () => {
  console.log('发送消息给:', user.value.username)
}

const editProfile = () => {
  router.push('/profile/edit')
}

const navigateTo = (page) => {
  activeTab.value = page
}

const viewActivityDetail = (activityId) => {
  router.push(`/activity/${activityId}`)
}

const viewPhoto = (photo) => {
  router.push(`/photo/${photo._id}`)
}

const viewCollection = (item) => {
  router.push(`/collection/${item._id}`)
}

const viewUserProfile = (userId) => {
  router.push(`/user/${userId}`)
}

// 新增：跳转到动态页面
const goToActivityFeed = () => {
  router.push('/activity-feed')
}

const formatTime = (timestamp) => {
  if (!timestamp) return '刚刚'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString('zh-CN')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const showPostModal = () => {
  router.push('/post')
}

const showMoreActions = () => {
  // 显示更多操作菜单
}

onMounted(() => {
  loadUserActivities()
})
</script>

<style scoped>
/* === 腾讯黑色高级主题 - 个人主页 === */
.tx-profile-container {
  background: linear-gradient(180deg, #0a0c14 0%, #121826 50%, #1a1e2c 100%);
  min-height: 100vh;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 头部背景 - 全屏沉浸式 */
.tx-profile-header {
  position: relative;
  height: 480px;
  overflow: hidden;
}

.tx-profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.tx-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px) brightness(0.6);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-profile-header:hover .tx-bg-image {
  transform: scale(1.05);
}

.tx-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(10, 12, 20, 0.2) 0%, 
    rgba(18, 24, 38, 0.7) 70%, 
    rgba(26, 30, 44, 0.9) 100%);
  backdrop-filter: blur(10px);
}

/* 用户信息卡片 - 悬浮玻璃效果 */
.tx-profile-card {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.95), 
    rgba(26, 30, 44, 0.98));
  border-radius: 32px 32px 0 0;
  padding: 40px;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  backdrop-filter: blur(40px);
  box-shadow: 
    0 -20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tx-profile-main {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: 32px;
}

/* 头像区域 - 3D悬浮效果 */
.tx-avatar-section {
  position: relative;
  margin-top: -80px;
}

.tx-avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  padding: 8px;
  background: linear-gradient(135deg, 
    rgba(0, 161, 214, 0.6), 
    rgba(0, 130, 179, 0.4),
    rgba(0, 161, 214, 0.6));
  box-shadow: 
    0 15px 40px rgba(0, 161, 214, 0.4),
    0 0 0 4px rgba(18, 24, 38, 0.8),
    inset 0 0 20px rgba(0, 161, 214, 0.3);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-avatar-container:hover {
  transform: scale(1.08) rotateY(10deg);
  box-shadow: 
    0 25px 60px rgba(0, 161, 214, 0.6),
    0 0 0 6px rgba(18, 24, 38, 0.8),
    inset 0 0 30px rgba(0, 161, 214, 0.5);
}

.tx-profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s;
}

.tx-online-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #34c759, #30d158);
  border-radius: 50%;
  border: 4px solid rgba(18, 24, 38, 0.9);
  box-shadow: 0 0 15px rgba(52, 199, 89, 0.6);
  animation: pulseOnline 2s infinite;
}

@keyframes pulseOnline {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(52, 199, 89, 0.8); }
}

.tx-vip-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ff9500, #ff6b35);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(255, 149, 0, 0.4);
  animation: floatVip 3s ease-in-out infinite;
}

@keyframes floatVip {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.tx-avatar-edit {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 161, 214, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 161, 214, 0.4);
}

.tx-avatar-edit:hover {
  background: #00a1d6;
  transform: scale(1.1) rotate(90deg);
}

/* 基础信息 - 玻璃拟态 */
.tx-basic-info {
  flex: 1;
  padding-bottom: 16px;
}

.tx-name-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tx-username {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 4px 20px rgba(0, 161, 214, 0.4);
  background: linear-gradient(90deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tx-gender {
  font-size: 24px;
  padding: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.tx-gender:hover {
  background: rgba(0, 161, 214, 0.2);
  transform: scale(1.1);
}

.tx-icon-male::before { content: '♂'; color: #00a1d6; }
.tx-icon-female::before { content: '♀'; color: #ff6b6b; }

.tx-age {
  background: linear-gradient(135deg, rgba(0, 161, 214, 0.3), rgba(0, 130, 179, 0.2));
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 161, 214, 0.4);
}

.tx-city {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tx-city:hover {
  background: rgba(0, 161, 214, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.tx-signature {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.6;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border-left: 4px solid rgba(0, 161, 214, 0.6);
  font-style: italic;
}

.tx-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tx-tag {
  background: linear-gradient(135deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  color: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(0, 161, 214, 0.3);
  transition: all 0.3s;
  cursor: default;
}

.tx-tag:hover {
  background: linear-gradient(135deg, 
    rgba(0, 161, 214, 0.3), 
    rgba(0, 130, 179, 0.25));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 161, 214, 0.2);
}

/* 操作按钮 - 霓虹效果 */
.tx-action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.tx-follow-btn,
.tx-message-btn,
.tx-more-btn,
.tx-edit-btn,
.tx-feed-btn {
  background: linear-gradient(135deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.tx-follow-btn::before,
.tx-message-btn::before,
.tx-more-btn::before,
.tx-edit-btn::before,
.tx-feed-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 161, 214, 0.1), 
    rgba(0, 161, 214, 0.05));
  opacity: 0;
  transition: opacity 0.3s;
}

.tx-follow-btn:hover,
.tx-message-btn:hover,
.tx-more-btn:hover,
.tx-edit-btn:hover,
.tx-feed-btn:hover {
  background: linear-gradient(135deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.6);
  color: #00a1d6;
  transform: translateY(-4px);
  box-shadow: 
    0 12px 35px rgba(0, 161, 214, 0.3),
    0 0 0 1px rgba(0, 161, 214, 0.3);
}

.tx-follow-btn:hover::before,
.tx-message-btn:hover::before,
.tx-more-btn:hover::before,
.tx-edit-btn:hover::before,
.tx-feed-btn:hover::before {
  opacity: 1;
}

.tx-more-btn {
  padding: 14px;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-more-btn:hover {
  transform: translateY(-4px) rotate(90deg);
}

/* 统计数据 - 玻璃卡片 */
.tx-profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(42, 47, 61, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.tx-stat-item:hover {
  background: rgba(0, 161, 214, 0.15);
  border-color: rgba(0, 161, 214, 0.5);
  transform: translateY(-6px) scale(1.05);
  box-shadow: 
    0 15px 40px rgba(0, 161, 214, 0.25),
    0 0 0 1px rgba(0, 161, 214, 0.3);
}

.tx-stat-number {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #00a1d6, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tx-stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* 标签栏 - 玻璃拟态 */
.tx-profile-tabs {
  background: linear-gradient(180deg, 
    rgba(18, 24, 38, 0.95), 
    rgba(26, 30, 44, 0.98));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(30px);
}

.tx-tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  padding: 0 24px;
}

.tx-tab {
  flex: 1;
  background: transparent;
  border: none;
  padding: 24px 16px;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #00a1d6, #0082b3);
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-tab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 161, 214, 0.1);
}

.tx-tab.active {
  color: #00a1d6;
  font-weight: 700;
}

.tx-tab.active::after {
  width: 80%;
}

.tx-tab-count {
  background: rgba(0, 161, 214, 0.2);
  color: #00a1d6;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(0, 161, 214, 0.3);
}

/* 内容区域 - 玻璃背景 */
.tx-profile-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
}

/* 动态项样式 */
.tx-activity-item {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 24px;
  cursor: pointer;
}

.tx-activity-item:hover {
  border-color: rgba(0, 161, 214, 0.4);
  transform: translateY(-6px) scale(1.01);
  box-shadow: 
    0 20px 60px rgba(0, 161, 214, 0.25),
    0 0 0 1px rgba(0, 161, 214, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tx-activity-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.tx-activity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 161, 214, 0.3);
}

.tx-activity-user-info {
  flex: 1;
}

.tx-activity-username {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  display: block;
  margin-bottom: 4px;
}

.tx-activity-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.tx-activity-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 20px;
}

.tx-activity-images {
  margin-bottom: 20px;
}

.tx-image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tx-image-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s;
}

.tx-image-thumb:hover {
  transform: scale(1.05);
}

.tx-image-more {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
}

.tx-activity-stats {
  display: flex;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 照片网格 - 瀑布流效果 */
.tx-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tx-photo-item {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  background: rgba(26, 30, 44, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-photo-item:hover {
  transform: scale(1.05) rotateY(5deg);
  box-shadow: 
    0 20px 50px rgba(0, 161, 214, 0.3),
    0 0 0 2px rgba(0, 161, 214, 0.4);
  z-index: 10;
}

.tx-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}

.tx-photo-item:hover img {
  transform: scale(1.1);
}

.tx-photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.4s;
}

.tx-photo-item:hover .tx-photo-overlay {
  opacity: 1;
}

.tx-photo-meta {
  display: flex;
  gap: 20px;
  color: white;
  font-size: 14px;
}

.tx-like-count, .tx-comment-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 收藏列表 - 玻璃卡片 */
.tx-collection-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.tx-collection-item {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
}

.tx-collection-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 25px 60px rgba(0, 161, 214, 0.3),
    0 0 0 2px rgba(0, 161, 214, 0.4);
  border-color: rgba(0, 161, 214, 0.4);
}

.tx-collection-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.tx-collection-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}

.tx-collection-item:hover .tx-collection-cover img {
  transform: scale(1.1);
}

.tx-collection-type {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tx-collection-info {
  padding: 24px;
}

.tx-collection-info h4 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.tx-collection-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.tx-collection-meta {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 关系列表 - 悬浮效果 */
.tx-relationship-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tx-relationship-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  cursor: pointer;
}

.tx-relationship-item:hover {
  background: rgba(0, 161, 214, 0.1);
  border-color: rgba(0, 161, 214, 0.4);
  transform: translateX(8px) scale(1.02);
  box-shadow: 
    0 15px 40px rgba(0, 161, 214, 0.2),
    0 0 0 1px rgba(0, 161, 214, 0.3);
}

.tx-relationship-item img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 161, 214, 0.4);
  box-shadow: 0 6px 25px rgba(0, 161, 214, 0.3);
  transition: all 0.3s;
}

.tx-relationship-item:hover img {
  border-color: #00a1d6;
  transform: scale(1.1);
}

.tx-relationship-info {
  flex: 1;
}

.tx-rel-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tx-rel-name span {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.tx-vip-tag {
  background: linear-gradient(135deg, #ff9500, #ff6b35);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(255, 149, 0, 0.4);
}

.tx-rel-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
}

/* 空状态 - 玻璃拟态 */
.tx-empty-content {
  text-align: center;
  padding: 120px 40px;
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border-radius: 32px;
  margin: 40px 0;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tx-empty-illustration {
  font-size: 96px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1), 
    rgba(255, 255, 255, 0.05));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  animation: floatEmpty 3s ease-in-out infinite;
}

@keyframes floatEmpty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.tx-empty-content h3 {
  font-size: 28px;
  color: #ffffff;
  margin-bottom: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.tx-empty-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
  margin-bottom: 24px;
}

.tx-publish-btn {
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.tx-publish-btn:hover {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 161, 214, 0.4);
}

/* 浮动按钮 - 脉冲效果 */
.tx-profile-float-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 15px 50px rgba(0, 161, 214, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  animation: pulseFloat 2s infinite;
}

@keyframes pulseFloat {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 15px 50px rgba(0, 161, 214, 0.5);
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 25px 60px rgba(0, 161, 214, 0.7);
  }
}

.tx-profile-float-btn:hover {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: scale(1.15) rotate(90deg);
  box-shadow: 
    0 30px 70px rgba(0, 161, 214, 0.8),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  animation: none;
}

.tx-profile-float-btn i {
  font-size: 28px;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tx-profile-card {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .tx-profile-header {
    height: 380px;
  }
  
  .tx-profile-card {
    padding: 24px;
    border-radius: 24px 24px 0 0;
  }
  
  .tx-profile-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }
  
  .tx-avatar-section {
    margin-top: -60px;
  }
  
  .tx-avatar-container {
    width: 120px;
    height: 120px;
  }
  
  .tx-username {
    font-size: 28px;
  }
  
  .tx-profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .tx-tabs-container {
    padding: 0 16px;
    overflow-x: auto;
  }
  
  .tx-tab {
    padding: 16px 12px;
    font-size: 14px;
    min-width: 80px;
  }
  
  .tx-profile-content {
    padding: 0 16px;
    margin: 24px auto;
  }
  
  .tx-photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .tx-collection-list {
    grid-template-columns: 1fr;
  }
  
  .tx-relationship-item {
    padding: 16px;
  }
  
  .tx-profile-float-btn {
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .tx-profile-header {
    height: 320px;
  }
  
  .tx-profile-card {
    padding: 20px;
  }
  
  .tx-avatar-container {
    width: 100px;
    height: 100px;
  }
  
  .tx-username {
    font-size: 24px;
  }
  
  .tx-action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .tx-follow-btn,
  .tx-message-btn,
  .tx-edit-btn,
  .tx-feed-btn {
    width: 100%;
    justify-content: center;
  }
  
  .tx-more-btn {
    align-self: center;
  }
  
  .tx-stat-number {
    font-size: 24px;
  }
  
  .tx-empty-content {
    padding: 80px 20px;
    margin: 20px 0;
  }
  
  .tx-empty-illustration {
    font-size: 64px;
  }
  
  .tx-image-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 暗色主题滚动条 */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(18, 24, 38, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 161, 214, 0.6), 
    rgba(0, 130, 179, 0.6));
  border-radius: 10px;
  border: 2px solid rgba(18, 24, 38, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 161, 214, 0.8), 
    rgba(0, 130, 179, 0.8));
}
</style>