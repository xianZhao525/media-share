<template>
  <div class="activity-feed">
    <!-- 头部区域 -->
    <div class="feed-header">
      <h1>动态流</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ feedStats.following }}</span>
          <span class="stat-label">关注中</span>
        </div>
        <div class="stat-divider">|</div>
        <div class="stat-item">
          <span class="stat-number">{{ feedStats.followers }}</span>
          <span class="stat-label">粉丝</span>
        </div>
      </div>
    </div>

    <!-- 发布动态输入框 -->
    <div class="post-creator">
      <div class="creator-avatar">
        <img :src="currentUser.avatar" alt="Your avatar">
      </div>
      <div class="creator-content">
        <textarea 
          v-model="newPostContent"
          placeholder="分享你的想法..."
          rows="3"
          maxlength="500"
          class="post-textarea"
        ></textarea>
        <div class="creator-footer">
          <div class="char-count">{{ newPostContent.length }}/500</div>
          <div class="creator-actions">
            <button class="action-btn emoji-btn" title="添加表情">
              <i>😊</i>
            </button>
            <button class="action-btn image-btn" title="添加图片">
              <i>🖼️</i>
            </button>
            <button 
              class="post-submit-btn"
              @click="createPost"
              :disabled="!newPostContent.trim()"
            >
              <i>📤</i>
              <span>发布</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 动态筛选器 -->
    <div class="feed-filters">
      <button 
        v-for="filter in filters" 
        :key="filter.key"
        class="filter-btn"
        :class="{ active: activeFilter === filter.key }"
        @click="setFilter(filter.key)"
      >
        <i :class="filter.icon"></i>
        <span>{{ filter.label }}</span>
      </button>
    </div>

    <!-- 动态列表 -->
    <div class="activities-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载动态中...</p>
      </div>

      <div v-else-if="activities.length === 0" class="empty-state">
        <i>🌌</i>
        <p>还没有动态，快去关注一些朋友吧！</p>
        <button class="discover-btn" @click="goToDiscover">
          <i>🔍</i>
          <span>发现更多用户</span>
        </button>
      </div>

      <div v-else>
        <div 
          v-for="activity in activities" 
          :key="activity._id"
          class="activity-card fade-in"
        >
          <div class="activity-header">
            <router-link 
              :to="`/profile/${activity.user._id}`"
              class="activity-user"
            >
              <div class="user-avatar">
                <img :src="activity.user.avatar" :alt="activity.user.name">
                <span 
                  v-if="activity.user.isOnline"
                  class="online-indicator"
                ></span>
              </div>
              <div class="user-info">
                <div class="user-name">{{ activity.user.name }}</div>
                <div class="activity-time">
                  <i>🕒</i>
                  <span>{{ formatTime(activity.createdAt) }}</span>
                </div>
              </div>
            </router-link>
            <div class="activity-actions">
              <button 
                class="action-btn"
                :class="{ active: activity.isLiked }"
                @click="toggleLike(activity)"
                title="点赞"
              >
                <i>{{ activity.isLiked ? '❤️' : '🤍' }}</i>
                <span v-if="activity.likes > 0">{{ activity.likes }}</span>
              </button>
              <button class="action-btn" title="评论">
                <i>💬</i>
                <span v-if="activity.comments > 0">{{ activity.comments }}</span>
              </button>
              <button class="action-btn" title="分享">
                <i>🔄</i>
              </button>
              <button class="action-btn more-btn" title="更多选项">
                <i>⋯</i>
              </button>
            </div>
          </div>

          <div class="activity-content">
            <p class="activity-text">{{ activity.content }}</p>
            
            <div v-if="activity.images && activity.images.length" class="activity-images">
              <div 
                v-for="(image, index) in activity.images.slice(0, 4)"
                :key="index"
                class="image-item"
                :style="{ backgroundImage: `url(${image})` }"
                @click="viewImage(activity.images, index)"
              >
                <div v-if="index === 3 && activity.images.length > 4" class="image-more">
                  +{{ activity.images.length - 4 }}
                </div>
              </div>
            </div>

            <div v-if="activity.sharedPost" class="shared-post">
              <div class="shared-post-header">
                <i>🔗</i>
                <span>分享了 {{ activity.sharedPost.user.name }} 的动态</span>
              </div>
              <div class="shared-post-content">
                {{ activity.sharedPost.content }}
              </div>
            </div>
          </div>

          <div class="activity-footer">
            <div class="activity-tags">
              <span 
                v-for="tag in activity.tags" 
                :key="tag"
                class="tag"
                @click="searchTag(tag)"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <button 
            @click="loadMore"
            :disabled="loadingMore"
            class="load-more-btn"
          >
            <span v-if="loadingMore">加载中...</span>
            <span v-else>加载更多动态</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const activities = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const newPostContent = ref('')
const activeFilter = ref('all')
const page = ref(1)
const hasMore = ref(true)

// 模拟当前用户数据
const currentUser = ref({
  _id: '1',
  name: '当前用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  isOnline: true
})

// 动态统计
const feedStats = ref({
  following: 42,
  followers: 128
})

// 筛选器选项
const filters = [
  { key: 'all', label: '全部动态', icon: '🌐' },
  { key: 'following', label: '关注的人', icon: '👥' },
  { key: 'popular', label: '热门动态', icon: '🔥' },
  { key: 'media', label: '含图片', icon: '🖼️' }
]

// 获取动态流
const fetchActivities = async (reset = false) => {
  if (reset) {
    page.value = 1
    activities.value = []
    loading.value = true
  } else if (page.value > 1) {
    loadingMore.value = true
  }

  try {
    // 模拟API调用
    const response = await axios.get('/api/activities/feed', {
      params: {
        page: page.value,
        limit: 10,
        filter: activeFilter.value
      }
    })

    if (reset) {
      activities.value = response.data.activities
    } else {
      activities.value.push(...response.data.activities)
    }

    hasMore.value = response.data.hasMore
  } catch (error) {
    console.error('获取动态失败:', error)
    alert('加载动态失败，请刷新页面重试')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 发布动态
const createPost = async () => {
  if (!newPostContent.value.trim()) return

  try {
    const response = await axios.post('/api/activities', {
      content: newPostContent.value,
      type: 'post'
    })

    // 将新动态添加到列表顶部
    activities.value.unshift({
      ...response.data.activity,
      user: currentUser.value,
      likes: 0,
      comments: 0,
      isLiked: false
    })

    // 清空输入框
    newPostContent.value = ''
    
    alert('动态发布成功！')
  } catch (error) {
    console.error('发布动态失败:', error)
    alert('发布失败，请重试')
  }
}

// 点赞/取消点赞
const toggleLike = async (activity) => {
  try {
    if (activity.isLiked) {
      await axios.delete(`/api/activities/${activity._id}/like`)
      activity.likes--
    } else {
      await axios.post(`/api/activities/${activity._id}/like`)
      activity.likes++
    }
    activity.isLiked = !activity.isLiked
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 设置筛选器
const setFilter = (filter) => {
  if (activeFilter.value === filter) return
  activeFilter.value = filter
  fetchActivities(true)
}

// 加载更多
const loadMore = () => {
  page.value++
  fetchActivities()
}

// 查看图片
const viewImage = (images, index) => {
  console.log('查看图片:', images, index)
  // 这里可以实现图片查看器
}

// 搜索标签
const searchTag = (tag) => {
  console.log('搜索标签:', tag)
  // 这里可以实现标签搜索功能
}

// 去发现页面
const goToDiscover = () => {
  console.log('去发现页面')
  // 这里可以跳转到发现页面
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 一分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 一天内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 一周内
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 返回完整日期
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchActivities()
})

// 模拟数据
const mockActivities = [
  {
    _id: '1',
    user: {
      _id: '2',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      isOnline: true
    },
    content: '今天天气真好！分享一张美照给大家～',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2'
    ],
    type: 'post',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: true,
    tags: ['摄影', '风景'],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: '2',
    user: {
      _id: '3',
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      isOnline: false
    },
    content: '刚读完一本很棒的书！推荐给大家！',
    type: 'post',
    likes: 42,
    comments: 15,
    shares: 5,
    isLiked: false,
    tags: ['阅读', '推荐'],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
]

// 如果API未准备好，使用模拟数据
setTimeout(() => {
  if (activities.value.length === 0) {
    activities.value = mockActivities
    loading.value = false
  }
}, 1000)
</script>

<style scoped>
.activity-feed {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  background-color: #000000;
  min-height: 100vh;
}

/* 头部样式 */
.feed-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #222;
}

.feed-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #00bfff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #00bfff;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  color: #333;
  font-weight: 300;
}

/* 发布动态区域 */
.post-creator {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: #111;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid #222;
}

.creator-avatar {
  flex-shrink: 0;
}

.creator-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #333;
  transition: border-color 0.3s;
}

.creator-avatar img:hover {
  border-color: #00bfff;
}

.creator-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
}

.post-textarea::placeholder {
  color: #666;
}

.creator-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #666;
}

.creator-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: transparent;
  border: none;
  color: #888;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: #222;
  color: white;
  transform: scale(1.1);
}

.post-submit-btn {
  background: linear-gradient(135deg, #00bfff, #0080ff);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.post-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 128, 255, 0.3);
}

.post-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 筛选器样式 */
.feed-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-btn {
  flex-shrink: 0;
  background-color: #111;
  border: 1px solid #333;
  color: #888;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.filter-btn:hover {
  background-color: #1a1a1a;
  border-color: #444;
}

.filter-btn.active {
  background: linear-gradient(135deg, #222, #444);
  border-color: #00bfff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 128, 255, 0.2);
}

/* 动态卡片样式 */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-card {
  background-color: #111;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #222;
  transition: transform 0.3s, border-color 0.3s;
}

.activity-card:hover {
  border-color: #333;
  transform: translateY(-2px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.activity-user {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.user-avatar {
  position: relative;
}

.user-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #333;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #00ff00;
  border-radius: 50%;
  border: 2px solid #111;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.activity-actions {
  display: flex;
  gap: 8px;
}

.activity-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  font-size: 14px;
}

.activity-actions .action-btn.active {
  color: #ff3860;
}

.activity-actions .action-btn:hover {
  background-color: #222;
}

/* 动态内容样式 */
.activity-content {
  margin-bottom: 16px;
}

.activity-text {
  font-size: 16px;
  line-height: 1.6;
  color: white;
  margin-bottom: 16px;
}

.activity-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: #222;
  background-size: cover;
  background-position: center;
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-more {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.shared-post {
  margin-top: 16px;
  padding: 16px;
  background-color: #1a1a1a;
  border-radius: 12px;
  border-left: 4px solid #00bfff;
}

.shared-post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #888;
  font-size: 14px;
}

.shared-post-content {
  color: #ccc;
  font-size: 15px;
  line-height: 1.5;
}

/* 动态底部样式 */
.activity-footer {
  border-top: 1px solid #222;
  padding-top: 12px;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  color: #00bfff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  background-color: rgba(0, 191, 255, 0.1);
  border-radius: 6px;
  transition: all 0.3s;
}

.tag:hover {
  background-color: rgba(0, 191, 255, 0.2);
  transform: translateY(-1px);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #00bfff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  margin-top: 16px;
  color: #888;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  color: #888;
  margin-bottom: 24px;
}

.discover-btn {
  background: linear-gradient(135deg, #00bfff, #0080ff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.discover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 128, 255, 0.3);
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin-top: 32px;
}

.load-more-btn {
  background-color: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  padding: 12px 32px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background-color: #222;
  border-color: #444;
  color: white;
  transform: translateY(-1px);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .activity-feed {
    padding: 16px 12px 60px;
  }

  .feed-header h1 {
    font-size: 24px;
  }

  .post-creator {
    padding: 16px;
  }

  .activity-images {
    grid-template-columns: 1fr;
  }

  .activity-card {
    padding: 16px;
  }

  .feed-filters {
    gap: 8px;
  }

  .filter-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>