<template>
  <div class="tx-feed-container">
    <!-- 腾讯风格头部 -->
    <div class="tx-feed-header">
      <div class="tx-feed-title">
        <i class="tx-icon-feed">🏠</i>
        <h1>好友动态</h1>
      </div>
      <button class="tx-refresh-btn" @click="refreshFeed">
        <i class="tx-icon-refresh">🔄</i>
      </button>
    </div>

    <!-- 腾讯风格动态发布器 -->
    <div class="tx-post-creator">
      <img :src="currentUser.avatar" :alt="currentUser.username" class="tx-post-avatar" />
      <div class="tx-post-input" @click="showPostModal">
        <span class="tx-placeholder">分享你的想法...</span>
      </div>
      <div class="tx-post-actions">
        <button class="tx-action-btn" @click="showImageUpload">
          <i class="tx-icon-image">🖼️</i>
          <span>图片</span>
        </button>
        <button class="tx-action-btn" @click="showVideoUpload">
          <i class="tx-icon-video">🎥</i>
          <span>视频</span>
        </button>
        <button class="tx-action-btn" @click="showEmojiPicker">
          <i class="tx-icon-emoji">😊</i>
          <span>表情</span>
        </button>
      </div>
    </div>

    <!-- 腾讯风格动态列表 -->
    <div class="tx-feed-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="tx-loading-state">
        <div class="tx-loading-spinner">
          <div class="tx-spinner-dot"></div>
          <div class="tx-spinner-dot"></div>
          <div class="tx-spinner-dot"></div>
        </div>
        <p>加载中...</p>
      </div>

      <!-- 动态卡片 -->
      <div 
        v-for="activity in activities" 
        :key="activity._id"
        class="tx-activity-card"
      >
        <!-- 用户信息 -->
        <div class="tx-activity-header">
          <div class="tx-user-info">
            <img 
              :src="activity.user.avatar" 
              :alt="activity.user.username"
              class="tx-user-avatar"
            />
            <div class="tx-user-details">
              <div class="tx-user-name">
                <span class="tx-username">{{ activity.user.username }}</span>
                <span v-if="activity.user.verified" class="tx-verified-badge">✅</span>
              </div>
              <div class="tx-activity-meta">
                <span class="tx-time">{{ formatTime(activity.createdAt) }}</span>
                <span class="tx-divider">·</span>
                <span class="tx-source">来自手机</span>
              </div>
            </div>
          </div>
          <button class="tx-more-btn">
            <i class="tx-icon-more">⋯</i>
          </button>
        </div>

        <!-- 动态内容 -->
        <div class="tx-activity-content">
          <p class="tx-content-text">{{ activity.content }}</p>
          
          <!-- 图片预览 -->
          <div v-if="activity.images && activity.images.length > 0" class="tx-image-grid">
            <div 
              v-for="(img, index) in activity.images" 
              :key="index"
              class="tx-image-item"
              :class="`tx-image-${Math.min(activity.images.length, 4)}`"
              @click="previewImage(activity.images, index)"
            >
              <img :src="img.url" :alt="`图片${index + 1}`" />
              <div v-if="activity.images.length > 4 && index === 3" class="tx-image-more">
                +{{ activity.images.length - 4 }}
              </div>
            </div>
          </div>

          <!-- 关联内容 -->
          <div v-if="activity.item" class="tx-linked-content">
            <div class="tx-linked-card" @click="viewItem(activity.item._id)">
              <div class="tx-linked-cover">
                <img :src="activity.item.cover" :alt="activity.item.title" />
              </div>
              <div class="tx-linked-info">
                <div class="tx-linked-title">
                  {{ activity.item.title }}
                </div>
                <div class="tx-linked-desc">
                  {{ truncateText(activity.item.description, 40) }}
                </div>
                <div class="tx-linked-meta">
                  <span class="tx-meta-item">
                    <i class="tx-icon-type">🎬</i>
                    {{ activity.item.type }}
                  </span>
                  <span class="tx-meta-item">
                    <i class="tx-icon-rating">⭐</i>
                    {{ activity.item.rating || '暂无' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 腾讯风格互动操作 -->
        <div class="tx-activity-actions">
          <div class="tx-action-stats">
            <span class="tx-stat-item">
              <i class="tx-icon-like-small">👍</i>
              {{ activity.likeCount || 0 }}
            </span>
            <span class="tx-stat-item">
              <i class="tx-icon-comment-small">💬</i>
              {{ activity.commentCount || 0 }}
            </span>
            <span class="tx-stat-item">
              <i class="tx-icon-share-small">🔄</i>
              {{ activity.shareCount || 0 }}
            </span>
          </div>
          
          <div class="tx-action-buttons">
            <button 
              class="tx-action-btn-small"
              :class="{ 'tx-liked': activity.isLiked }"
              @click="toggleLike(activity._id)"
            >
              <i class="tx-icon-like">👍</i>
              {{ activity.isLiked ? '已赞' : '点赞' }}
            </button>
            <button 
              class="tx-action-btn-small"
              @click="focusComment(activity._id)"
            >
              <i class="tx-icon-comment">💬</i>
              评论
            </button>
            <button 
              class="tx-action-btn-small"
              @click="shareActivity(activity._id)"
            >
              <i class="tx-icon-share">🔗</i>
              分享
            </button>
          </div>
        </div>

        <!-- 评论区域 -->
        <div v-if="activity.showComments" class="tx-comments-section">
          <!-- 热门评论 -->
          <div v-if="activity.hotComments && activity.hotComments.length > 0" class="tx-hot-comments">
            <div class="tx-section-title">
              <i class="tx-icon-fire">🔥</i>
              <span>热门评论</span>
            </div>
            <div 
              v-for="comment in activity.hotComments" 
              :key="comment._id"
              class="tx-comment-item"
            >
              <img :src="comment.user.avatar" class="tx-comment-avatar" />
              <div class="tx-comment-content">
                <div class="tx-comment-header">
                  <span class="tx-comment-user">{{ comment.user.username }}</span>
                  <span class="tx-comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="tx-comment-text">{{ comment.content }}</p>
                <div class="tx-comment-actions">
                  <button class="tx-comment-like">
                    <i class="tx-icon-like-tiny">👍</i>
                    {{ comment.likeCount || 0 }}
                  </button>
                  <button class="tx-comment-reply">回复</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 最新评论 -->
          <div v-if="activity.recentComments && activity.recentComments.length > 0" class="tx-recent-comments">
            <div 
              v-for="comment in activity.recentComments" 
              :key="comment._id"
              class="tx-comment-item"
            >
              <img :src="comment.user.avatar" class="tx-comment-avatar" />
              <div class="tx-comment-content">
                <div class="tx-comment-header">
                  <span class="tx-comment-user">{{ comment.user.username }}</span>
                  <span class="tx-comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="tx-comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>

          <!-- 评论输入框 -->
          <div class="tx-comment-input">
            <img :src="currentUser.avatar" class="tx-comment-input-avatar" />
            <div class="tx-comment-input-box">
              <input 
                type="text" 
                v-model="activity.commentText"
                placeholder="说点什么..."
                @keyup.enter="postComment(activity._id)"
                class="tx-comment-input-field"
              />
              <div class="tx-comment-input-actions">
                <button class="tx-comment-action-btn" @click="showEmojiPicker">
                  <i class="tx-icon-emoji-small">😊</i>
                </button>
                <button 
                  class="tx-comment-send-btn"
                  @click="postComment(activity._id)"
                  :disabled="!activity.commentText?.trim()"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="tx-load-more">
        <button class="tx-load-more-btn" @click="loadMore" :disabled="loadingMore">
          <span v-if="loadingMore">加载中...</span>
          <span v-else>
            <i class="tx-icon-down">⬇️</i>
            加载更多
          </span>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && activities.length === 0" class="tx-empty-state">
        <div class="tx-empty-illustration">
          <i class="tx-icon-empty">📭</i>
        </div>
        <h3 class="tx-empty-title">暂无动态</h3>
        <p class="tx-empty-desc">关注更多好友或发布第一条动态吧</p>
        <button class="tx-empty-btn" @click="goToExplore">
          <i class="tx-icon-explore">🔍</i>
          去发现
        </button>
      </div>
    </div>

    <!-- 腾讯风格发布模态框 -->
    <div v-if="showPostModal" class="tx-modal-overlay">
      <div class="tx-modal-container">
        <div class="tx-modal-header">
          <h3 class="tx-modal-title">发布动态</h3>
          <button class="tx-modal-close" @click="hidePostModal">
            <i class="tx-icon-close">×</i>
          </button>
        </div>
        <div class="tx-modal-body">
          <!-- 发布器内容 -->
          <div class="tx-modal-post-creator">
            <!-- 这里可以放发布动态的具体表单 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const showPostModal = ref(false)

// 当前用户
const currentUser = ref({
  username: '当前用户',
  avatar: 'https://via.placeholder.com/40/00a1d6/ffffff'
})

// 模拟动态数据
const activities = ref([
  {
    _id: 'act001',
    user: {
      username: '电影爱好者',
      avatar: 'https://via.placeholder.com/44/00a1d6/ffffff',
      verified: true
    },
    content: '刚看完《流浪地球2》，特效真的太震撼了！中国科幻电影的里程碑之作。',
    createdAt: new Date(Date.now() - 1800000), // 30分钟前
    likeCount: 42,
    commentCount: 8,
    shareCount: 5,
    isLiked: false,
    showComments: false,
    commentText: '',
    images: [
      { url: 'https://via.placeholder.com/300/00a1d6/ffffff' },
      { url: 'https://via.placeholder.com/300/ff6b6b/ffffff' }
    ],
    item: {
      _id: 'item001',
      title: '流浪地球2',
      cover: 'https://via.placeholder.com/80x110/00a1d6/ffffff',
      description: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。',
      type: '电影',
      rating: 8.5
    },
    hotComments: [
      {
        _id: 'com001',
        user: {
          username: '评论用户1',
          avatar: 'https://via.placeholder.com/32/00a1d6/ffffff'
        },
        content: '同感！特效确实很棒',
        createdAt: new Date(Date.now() - 1200000),
        likeCount: 12
      }
    ],
    recentComments: []
  }
])

// 方法
const refreshFeed = () => {
  console.log('刷新动态')
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const loadMore = () => {
  console.log('加载更多')
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    hasMore.value = false
  }, 1500)
}

const toggleLike = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity) {
    activity.isLiked = !activity.isLiked
    activity.likeCount = activity.isLiked ? activity.likeCount + 1 : activity.likeCount - 1
  }
}

const focusComment = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity) {
    activity.showComments = true
  }
}

const shareActivity = (activityId) => {
  console.log('分享动态:', activityId)
  alert('分享功能开发中...')
}

const postComment = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity && activity.commentText?.trim()) {
    const newComment = {
      _id: 'com' + Date.now(),
      user: { ...currentUser.value },
      content: activity.commentText.trim(),
      createdAt: new Date()
    }
    
    activity.recentComments.push(newComment)
    activity.commentCount += 1
    activity.commentText = ''
  }
}

const previewImage = (images, index) => {
  console.log('预览图片:', index)
}

const viewItem = (itemId) => {
  router.push(`/item/${itemId}`)
}


const hidePostModal = () => {
  showPostModal.value = false
}

const showImageUpload = () => {
  alert('图片上传功能开发中...')
}

const showVideoUpload = () => {
  alert('视频上传功能开发中...')
}

const showEmojiPicker = () => {
  alert('表情选择器开发中...')
}

const goToExplore = () => {
  router.push('/explore')
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
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString('zh-CN')
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 初始化
onMounted(() => {
  console.log('ActivityFeed 组件已加载')
})
</script>

<style scoped>
/* === 腾讯风格动态流 === */
.tx-feed-container {
  background: #f5f6fa;
  min-height: 100vh;
}

/* 头部 */
.tx-feed-header {
  background: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 56px;
  z-index: 10;
}

.tx-feed-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tx-feed-title h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tx-icon-feed {
  font-size: 20px;
}

.tx-refresh-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-refresh-btn:hover {
  background: #f5f5f5;
}

/* 动态发布器 */
.tx-post-creator {
  background: white;
  padding: 16px;
  margin: 8px 0;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tx-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  float: left;
  margin-right: 12px;
}

.tx-post-input {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-post-input:hover {
  background: #e8e8e8;
}

.tx-placeholder {
  color: #999;
  font-size: 15px;
}

.tx-post-actions {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.tx-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.tx-action-btn:hover {
  background: #f5f5f5;
  color: #1677ff;
}

/* 动态卡片 */
.tx-activity-card {
  background: white;
  margin: 8px 0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.tx-activity-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 用户信息 */
.tx-activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.tx-user-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.tx-user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.tx-user-details {
  flex: 1;
}

.tx-user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tx-username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.tx-verified-badge {
  font-size: 12px;
}

.tx-activity-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.tx-divider {
  margin: 0 2px;
}

.tx-more-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #999;
}

.tx-more-btn:hover {
  background: #f5f5f5;
  color: #333;
}

/* 动态内容 */
.tx-activity-content {
  margin-bottom: 16px;
}

.tx-content-text {
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 16px;
  white-space: pre-line;
}

/* 图片网格 */
.tx-image-grid {
  display: grid;
  gap: 4px;
  margin-bottom: 16px;
}

.tx-image-1 {
  grid-template-columns: 1fr;
}

.tx-image-2 {
  grid-template-columns: repeat(2, 1fr);
}

.tx-image-3, .tx-image-4 {
  grid-template-columns: repeat(3, 1fr);
}

.tx-image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
}

.tx-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.tx-image-item:hover img {
  transform: scale(1.05);
}

.tx-image-more {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

/* 关联内容 */
.tx-linked-content {
  margin-top: 12px;
}

.tx-linked-card {
  display: flex;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-linked-card:hover {
  border-color: #1677ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.15);
}

.tx-linked-cover {
  width: 80px;
  height: 100px;
  flex-shrink: 0;
}

.tx-linked-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tx-linked-info {
  flex: 1;
  padding: 12px;
}

.tx-linked-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.tx-linked-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.tx-linked-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #999;
}

.tx-meta-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 互动操作 */
.tx-activity-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.tx-action-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.tx-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.tx-action-buttons {
  display: flex;
  gap: 8px;
}

.tx-action-btn-small {
  flex: 1;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
}

.tx-action-btn-small:hover {
  background: #e8e8e8;
  color: #333;
}

.tx-action-btn-small.tx-liked {
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

/* 评论区域 */
.tx-comments-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tx-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ff6b00;
  margin-bottom: 12px;
  font-weight: 500;
}

.tx-comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.tx-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tx-comment-content {
  flex: 1;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 12px;
}

.tx-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tx-comment-user {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.tx-comment-time {
  font-size: 11px;
  color: #999;
}

.tx-comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
}

.tx-comment-actions {
  display: flex;
  gap: 12px;
}

.tx-comment-like, .tx-comment-reply {
  background: transparent;
  border: none;
  font-size: 11px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
}

.tx-comment-like:hover, .tx-comment-reply:hover {
  color: #1677ff;
}

/* 评论输入框 */
.tx-comment-input {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 16px;
}

.tx-comment-input-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tx-comment-input-box {
  flex: 1;
  background: #f9f9f9;
  border-radius: 20px;
  padding: 8px 12px;
}

.tx-comment-input-field {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #333;
  outline: none;
  margin-bottom: 8px;
}

.tx-comment-input-field::placeholder {
  color: #999;
}

.tx-comment-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tx-comment-action-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.tx-comment-send-btn {
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-comment-send-btn:hover:not(:disabled) {
  background: #0958d9;
  transform: scale(1.05);
}

.tx-comment-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载状态 */
.tx-loading-state {
  text-align: center;
  padding: 60px 0;
}

.tx-loading-spinner {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 12px;
}

.tx-spinner-dot {
  width: 8px;
  height: 8px;
  background: #1677ff;
  border-radius: 50%;
  animation: tx-bounce 1.4s infinite ease-in-out both;
}

.tx-spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.tx-spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes tx-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 加载更多 */
.tx-load-more {
  text-align: center;
  padding: 24px 0;
}

.tx-load-more-btn {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
}

.tx-load-more-btn:hover:not(:disabled) {
  border-color: #1677ff;
  color: #1677ff;
}

.tx-load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.tx-empty-state {
  text-align: center;
  padding: 80px 20px;
}

.tx-empty-illustration {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.tx-empty-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.tx-empty-desc {
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
}

.tx-empty-btn {
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 32px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.tx-empty-btn:hover {
  background: #0958d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

/* 模态框 */
.tx-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.tx-modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: tx-modal-slide 0.3s ease;
}

@keyframes tx-modal-slide {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tx-modal-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tx-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tx-modal-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.tx-modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.tx-modal-body {
  padding: 20px;
}
</style>