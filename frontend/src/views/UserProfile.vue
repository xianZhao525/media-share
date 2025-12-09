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
          <ActivityItem 
            v-for="activity in activities"
            :key="activity._id"
            :activity="activity"
            :showUserInfo="false"
            class="tx-profile-activity"
          />
        </div>
        <div v-else class="tx-empty-content">
          <div class="tx-empty-illustration">
            <i class="tx-icon-empty-activity">📝</i>
          </div>
          <h3>暂无动态</h3>
          <p v-if="isSelf">去发布你的第一条动态吧</p>
          <p v-else>该用户最近没有发布动态</p>
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
// 假设有ActivityItem组件
// import ActivityItem from './ActivityItem.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// 响应式数据
const user = ref({
  _id: userId,
  username: '腾讯用户',
  avatar: 'https://via.placeholder.com/150/00a1d6/ffffff',
  cover: 'https://via.placeholder.com/1200x400/1a1a2e/00a1d6',
  bio: '热爱生活，喜欢分享，记录每一个美好瞬间。',
  gender: 'male',
  age: 28,
  city: '深圳',
  isOnline: true,
  vipLevel: 3,
  tags: ['电影爱好者', '旅行达人', '美食家', '摄影师'],
  isFollowing: false,
  createdAt: '2022-01-15'
})

const isSelf = computed(() => {
  return userId === 'current' || userId === 'me'
})

// 统计数据
const stats = ref([
  { id: 'activities', label: '动态', value: 156 },
  { id: 'followers', label: '粉丝', value: 1234 },
  { id: 'following', label: '关注', value: 89 },
  { id: 'photos', label: '相册', value: 342 },
  { id: 'collections', label: '收藏', value: 567 }
])

// 标签页
const tabs = ref([
  { id: 'activities', label: '动态', icon: 'tx-icon-activities', count: 156 },
  { id: 'photos', label: '相册', icon: 'tx-icon-photos', count: 342 },
  { id: 'collections', label: '收藏', icon: 'tx-icon-collections', count: 567 },
  { id: 'following', label: '关注', icon: 'tx-icon-following', count: 89 },
  { id: 'followers', label: '粉丝', icon: 'tx-icon-followers', count: 1234 }
])

const activeTab = ref('activities')

// 模拟数据
const activities = ref([
  // ... 模拟动态数据
])

const photos = ref([
  // ... 模拟照片数据
])

const collections = ref([
  // ... 模拟收藏数据
])

const relationships = ref([
  // ... 模拟关系数据
])

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
  // 发送消息逻辑
  console.log('发送消息给:', user.value.username)
}

const editProfile = () => {
  router.push('/profile/edit')
}

const navigateTo = (page) => {
  activeTab.value = page
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
  // 显示发布模态框
}

const showMoreActions = () => {
  // 显示更多操作菜单
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped>
.tx-profile-container {
  background: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* === 个人主页头部 === */
.tx-profile-header {
  position: relative;
}

.tx-profile-bg {
  height: 240px;
  position: relative;
  overflow: hidden;
}

.tx-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tx-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
}

.tx-profile-card {
  position: relative;
  margin: -80px 20px 0;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.tx-profile-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

/* 头像区域 */
.tx-avatar-section {
  position: relative;
}

.tx-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.tx-profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

.tx-online-status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 14px;
  height: 14px;
  background: #52c41a;
  border: 2px solid white;
  border-radius: 50%;
}

.tx-vip-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(255, 149, 0, 0.3);
}

.tx-avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #1677ff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.4);
}

/* 基础信息 */
.tx-basic-info {
  flex: 1;
}

.tx-name-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.tx-username {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tx-gender {
  background: #e6f7ff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-icon-male:before {
  content: '♂';
  color: #1890ff;
  font-size: 12px;
}

.tx-icon-female:before {
  content: '♀';
  color: #f759ab;
  font-size: 12px;
}

.tx-age, .tx-city {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
}

.tx-city {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tx-signature {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.tx-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tx-tag {
  background: #f0f5ff;
  color: #1677ff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid #d6e4ff;
}

/* 操作按钮 */
.tx-action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tx-message-btn, .tx-edit-btn {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.tx-message-btn:hover, .tx-edit-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
  background: #f0f5ff;
}

.tx-more-btn {
  background: #f5f5f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.tx-more-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.tx-follow-btn {
  font-family: inherit;
}

/* 数据统计 */
.tx-profile-stats {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.tx-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 8px;
}

.tx-stat-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.tx-stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.tx-stat-label {
  font-size: 12px;
  color: #999;
}

/* === 标签栏 === */
.tx-profile-tabs {
  background: white;
  margin: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 56px;
  z-index: 10;
}

.tx-tabs-container {
  display: flex;
  overflow-x: auto;
  padding: 0 8px;
}

.tx-tab {
  flex: 1;
  min-width: 100px;
  background: transparent;
  border: none;
  padding: 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  white-space: nowrap;
  transition: all 0.3s;
}

.tx-tab:hover {
  color: #1677ff;
}

.tx-tab.active {
  color: #1677ff;
  font-weight: 500;
}

.tx-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #1677ff;
  border-radius: 3px 3px 0 0;
}

.tx-tab-count {
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
}

/* === 内容区域 === */
.tx-profile-content {
  margin: 0 20px;
}

/* 空状态 */
.tx-empty-content {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.tx-empty-illustration {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.tx-empty-content h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.tx-empty-content p {
  font-size: 14px;
  color: #999;
}

/* 相册网格 */
.tx-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.tx-photo-item {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  overflow: hidden;
}

.tx-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.tx-photo-item:hover img {
  transform: scale(1.05);
}

.tx-photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: flex-end;
  padding: 8px;
}

.tx-photo-item:hover .tx-photo-overlay {
  opacity: 1;
}

.tx-photo-meta {
  display: flex;
  gap: 12px;
  color: white;
  font-size: 12px;
}

/* 收藏列表 */
.tx-collection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tx-collection-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.tx-collection-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tx-collection-cover {
  width: 80px;
  height: 100px;
  position: relative;
  flex-shrink: 0;
}

.tx-collection-cover img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.tx-collection-type {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(22, 119, 255, 0.9);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.tx-collection-info {
  flex: 1;
}

.tx-collection-info h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px;
}

.tx-collection-info p {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.tx-collection-meta {
  font-size: 12px;
  color: #999;
}

/* 关系列表 */
.tx-relationship-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tx-relationship-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.tx-relationship-item img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.tx-relationship-info {
  flex: 1;
}

.tx-rel-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tx-rel-name span:first-child {
  font-weight: 500;
  color: #333;
}

.tx-vip-tag {
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
}

.tx-rel-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 浮动按钮 */
.tx-profile-float-btn {
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

.tx-profile-float-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 30px rgba(22, 119, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tx-profile-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .tx-name-section {
    justify-content: center;
  }S
  
  .tx-action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .tx-profile-stats {
    overflow-x: auto;
    justify-content: flex-start;
    padding-left: 0;
    padding-right: 0;
  }
  
  .tx-stat-item {
    min-width: 80px;
  }
  
  .tx-tabs-container {
    justify-content: flex-start;
  }
  
  .tx-tab {
    min-width: auto;
    padding: 16px 12px;
  }
}
</style>