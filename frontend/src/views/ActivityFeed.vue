<template>
  <div class="tx-feed-container">
    <!-- 腾讯黑色高级主题头部 -->
    <div class="tx-feed-header">
      <div class="tx-feed-title">
        <i class="tx-icon-feed">🏠</i>
        <h1>好友动态</h1>
      </div>
      <button class="tx-refresh-btn" @click="refreshFeed">
        <i class="tx-icon-refresh">🔄</i>
      </button>
    </div>

    <!-- 腾讯黑色高级主题动态发布器 -->
    <div class="tx-post-creator">
      <img src="https://images.unsplash.com/photo-1494790108755-2616b786d4c9?w=100&h=100&fit=crop&crop=face" :alt="currentUser.username" class="tx-post-avatar" />
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

    <!-- 腾讯黑色高级主题动态列表 -->
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
                <span class="tx-source">{{ activity.source }}</span>
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

        <!-- 腾讯黑色高级主题互动操作 -->
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

    <!-- 腾讯黑色高级主题发布模态框 -->
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
const hasMore = ref(true)
const showPostModal = ref(false)

// 当前用户
const currentUser = ref({
  username: '小明同学',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d4c9?w=100&h=100&fit=crop&crop=face'
})

// 动态数据 - 使用真实头像和图片
const activities = ref([
  {
    _id: 'act001',
    user: {
      username: '电影爱好者小李',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    content: '刚看完《流浪地球2》，特效真的太震撼了！太空电梯那段场景简直让人窒息，中国科幻电影的里程碑之作！',
    createdAt: new Date(Date.now() - 1800000), // 30分钟前
    source: '来自iPhone 14 Pro',
    likeCount: 156,
    commentCount: 32,
    shareCount: 15,
    isLiked: true,
    showComments: false,
    commentText: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1533616688419-b7a585564f70?w=800&h=600&fit=crop' }
    ],
    item: {
      _id: 'item001',
      title: '流浪地球2',
      cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop',
      description: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。',
      type: '科幻电影',
      rating: 8.5
    },
    hotComments: [
      {
        _id: 'com001',
        user: {
          username: '科幻迷小王',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
        },
        content: '同感！特效确实很棒，特别是月球基地的细节处理',
        createdAt: new Date(Date.now() - 1200000),
        likeCount: 45
      },
      {
        _id: 'com002',
        user: {
          username: '电影评论家',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        content: '剧情设计也很出色，体现了人类命运共同体的理念',
        createdAt: new Date(Date.now() - 1500000),
        likeCount: 28
      }
    ],
    recentComments: []
  },
  {
    _id: 'act002',
    user: {
      username: '旅行摄影师安娜',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d4c9?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    content: '在瑞士阿尔卑斯山拍到了绝美的日出！金色的阳光洒在雪山顶上，这一刻感受到了大自然的壮丽与宁静。',
    createdAt: new Date(Date.now() - 3600000), // 1小时前
    source: '来自HUAWEI P60 Pro',
    likeCount: 234,
    commentCount: 47,
    shareCount: 32,
    isLiked: false,
    showComments: false,
    commentText: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' }
    ],
    hotComments: [
      {
        _id: 'com003',
        user: {
          username: '旅行达人',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        content: '太美了！请问这是哪个山峰？',
        createdAt: new Date(Date.now() - 2000000),
        likeCount: 18
      }
    ],
    recentComments: []
  },
  {
    _id: 'act003',
    user: {
      username: '美食探索家',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    content: '今天发现了小巷里一家超棒的日料店！刺身新鲜到仿佛刚从海里捞出来，老板人超好还送了我们甜品。强烈推荐！',
    createdAt: new Date(Date.now() - 7200000), // 2小时前
    source: '来自小米13 Ultra',
    likeCount: 89,
    commentCount: 23,
    shareCount: 8,
    isLiked: true,
    showComments: true,
    commentText: '这家店叫什么名字？',
    images: [
      { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop' }
    ],
    item: {
      _id: 'item002',
      title: '小巷日料屋',
      cover: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      description: '隐藏在巷子深处的正宗日式料理，食材新鲜，味道绝佳',
      type: '美食推荐',
      rating: 9.2
    },
    hotComments: [
      {
        _id: 'com004',
        user: {
          username: '吃货小分队',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
        },
        content: '求地址！周末想去试试',
        createdAt: new Date(Date.now() - 3000000),
        likeCount: 12
      }
    ],
    recentComments: [
      {
        _id: 'com005',
        user: {
          username: '美食家老张',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        content: '这家我也去过，寿司确实不错！',
        createdAt: new Date(Date.now() - 600000),
        likeCount: 5
      }
    ]
  },
  {
    _id: 'act004',
    user: {
      username: '健身教练Mike',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    content: '连续打卡健身房第30天！分享一些健身心得：坚持比天赋更重要，科学训练+合理饮食=健康身材。大家一起加油！',
    createdAt: new Date(Date.now() - 86400000), // 1天前
    source: '来自运动手表',
    likeCount: 312,
    commentCount: 56,
    shareCount: 42,
    isLiked: false,
    showComments: false,
    commentText: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop' }
    ],
    hotComments: [],
    recentComments: []
  },
  {
    _id: 'act005',
    user: {
      username: '音乐制作人Luna',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    content: '新歌《星辰大海》终于上线了！这是一首关于梦想和远方的歌，希望大家喜欢。特别感谢制作团队的所有成员！',
    createdAt: new Date(Date.now() - 172800000), // 2天前
    source: '来自音乐工作室',
    likeCount: 567,
    commentCount: 124,
    shareCount: 89,
    isLiked: true,
    showComments: false,
    commentText: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop' }
    ],
    item: {
      _id: 'item003',
      title: '星辰大海 - 单曲',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w-300&h=300&fit=crop',
      description: '全新单曲，融合电子与民谣元素，讲述追逐梦想的故事',
      type: '音乐作品',
      rating: 9.8
    },
    hotComments: [
      {
        _id: 'com006',
        user: {
          username: '音乐爱好者',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        content: '太好听了！单曲循环中',
        createdAt: new Date(Date.now() - 86400000),
        likeCount: 156
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
    // 模拟加载更多数据
    const newActivities = [
      {
        _id: 'act006',
        user: {
          username: '设计师陈晨',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        content: '最近完成的一个UI设计项目，采用了极简主义和毛玻璃效果，希望能给用户带来沉浸式的体验。',
        createdAt: new Date(Date.now() - 259200000), // 3天前
        source: '来自MacBook Pro',
        likeCount: 189,
        commentCount: 34,
        shareCount: 21,
        isLiked: false,
        showComments: false,
        commentText: '',
        images: [
          { url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop' }
        ],
        hotComments: [],
        recentComments: []
      }
    ]
    activities.value.push(...newActivities)
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
    activity.showComments = !activity.showComments
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
      createdAt: new Date(),
      likeCount: 0
    }
    
    activity.recentComments.push(newComment)
    activity.commentCount += 1
    activity.commentText = ''
  }
}

const previewImage = (images, index) => {
  console.log('预览图片:', index)
  // 这里可以实现图片预览功能
  alert(`预览第${index + 1}张图片`)
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
/* === 腾讯黑色高级主题 - 动态流 === */
.tx-feed-container {
  background: linear-gradient(180deg, #0a0c14 0%, #121826 50%, #1a1e2c 100%);
  min-height: 100vh;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 头部 - 玻璃拟态 */
.tx-feed-header {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.95), 
    rgba(26, 30, 44, 0.98));
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(30px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.tx-feed-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-feed-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 161, 214, 0.3);
  background: linear-gradient(90deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tx-icon-feed {
  font-size: 24px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tx-refresh-btn {
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.tx-refresh-btn:hover {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  transform: rotate(180deg);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.3);
}

/* 动态发布器 - 玻璃卡片 */
.tx-post-creator {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  padding: 24px;
  margin: 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tx-post-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  float: left;
  margin-right: 16px;
  border: 3px solid rgba(0, 161, 214, 0.4);
  box-shadow: 0 6px 20px rgba(0, 161, 214, 0.3);
  transition: all 0.3s;
  object-fit: cover;
}

.tx-post-avatar:hover {
  border-color: #00a1d6;
  transform: scale(1.05);
}

.tx-post-input {
  background: rgba(42, 47, 61, 0.6);
  border-radius: 24px;
  padding: 16px 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.tx-post-input:hover {
  background: rgba(0, 161, 214, 0.1);
  border-color: rgba(0, 161, 214, 0.4);
  box-shadow: 0 8px 30px rgba(0, 161, 214, 0.2);
}

.tx-placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.tx-post-actions {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.tx-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 12px 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.tx-action-btn:hover {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  color: #00a1d6;
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 161, 214, 0.25),
    0 0 0 1px rgba(0, 161, 214, 0.3);
}

/* 动态卡片 - 玻璃拟态 */
.tx-feed-list {
  padding: 0 16px;
}

.tx-activity-card {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  margin: 16px 0;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-activity-card:hover {
  border-color: rgba(0, 161, 214, 0.4);
  transform: translateY(-4px) scale(1.005);
  box-shadow: 
    0 20px 60px rgba(0, 161, 214, 0.25),
    0 0 0 1px rgba(0, 161, 214, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 用户信息 */
.tx-activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tx-user-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.tx-user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 161, 214, 0.4);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.3);
  transition: all 0.3s;
}

.tx-user-avatar:hover {
  border-color: #00a1d6;
  transform: scale(1.05);
}

.tx-user-details {
  flex: 1;
}

.tx-user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tx-username {
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.tx-verified-badge {
  font-size: 14px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tx-activity-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.tx-divider {
  margin: 0 4px;
}

.tx-source {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-more-btn {
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(255, 255, 255, 0.7);
}

.tx-more-btn:hover {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  transform: rotate(90deg);
  color: #00a1d6;
}

/* 动态内容 */
.tx-activity-content {
  margin-bottom: 24px;
}

.tx-content-text {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  white-space: pre-line;
}

/* 图片网格 */
.tx-image-grid {
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
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
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  background: rgba(26, 30, 44, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-image-item:hover {
  border-color: rgba(0, 161, 214, 0.5);
  transform: scale(1.03);
  box-shadow: 0 12px 35px rgba(0, 161, 214, 0.3);
}

.tx-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
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
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.7), 
    rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

/* 关联内容 */
.tx-linked-content {
  margin-top: 16px;
}

.tx-linked-card {
  display: flex;
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.6), 
    rgba(26, 30, 44, 0.7));
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-linked-card:hover {
  border-color: rgba(0, 161, 214, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 161, 214, 0.25);
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.1), 
    rgba(0, 130, 179, 0.08));
}

.tx-linked-cover {
  width: 100px;
  height: 140px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-linked-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tx-linked-info {
  flex: 1;
  padding: 16px;
}

.tx-linked-title {
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.tx-linked-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
  line-height: 1.4;
}

.tx-linked-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.tx-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 互动操作 */
.tx-activity-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.tx-action-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.tx-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;
}

.tx-stat-item:hover {
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
}

.tx-action-buttons {
  display: flex;
  gap: 12px;
}

.tx-action-btn-small {
  flex: 1;
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 12px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.tx-action-btn-small:hover {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  transform: translateY(-2px);
  color: #00a1d6;
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.25);
}

.tx-action-btn-small.tx-liked {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.25), 
    rgba(0, 130, 179, 0.2));
  border-color: rgba(0, 161, 214, 0.6);
  color: #00a1d6;
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.3);
}

/* 评论区域 */
.tx-comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ff9500;
  margin-bottom: 16px;
  font-weight: 600;
  padding: 8px 12px;
  background: rgba(255, 149, 0, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 149, 0, 0.2);
}

.tx-comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(42, 47, 61, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;
}

.tx-comment-item:hover {
  background: rgba(0, 161, 214, 0.08);
  border-color: rgba(0, 161, 214, 0.2);
}

.tx-comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(0, 161, 214, 0.3);
  object-fit: cover;
}

.tx-comment-content {
  flex: 1;
}

.tx-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tx-comment-user {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.tx-comment-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.tx-comment-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-bottom: 12px;
}

.tx-comment-actions {
  display: flex;
  gap: 16px;
}

.tx-comment-like, .tx-comment-reply {
  background: transparent;
  border: none;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-comment-like:hover, .tx-comment-reply:hover {
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
  border-color: rgba(0, 161, 214, 0.3);
}

/* 评论输入框 */
.tx-comment-input {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.6), 
    rgba(26, 30, 44, 0.7));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-comment-input-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(0, 161, 214, 0.4);
  object-fit: cover;
}

.tx-comment-input-box {
  flex: 1;
  background: rgba(26, 30, 44, 0.6);
  border-radius: 16px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-comment-input-field {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  outline: none;
  margin-bottom: 12px;
}

.tx-comment-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.tx-comment-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tx-comment-action-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.3s;
}

.tx-comment-action-btn:hover {
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
}

.tx-comment-send-btn {
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-comment-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 161, 214, 0.4);
}

.tx-comment-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 加载状态 */
.tx-loading-state {
  text-align: center;
  padding: 80px 0;
}

.tx-loading-spinner {
  display: inline-flex;
  gap: 6px;
  margin-bottom: 16px;
}

.tx-spinner-dot {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  border-radius: 50%;
  animation: tx-bounce 1.4s infinite ease-in-out both;
  box-shadow: 0 0 10px rgba(0, 161, 214, 0.4);
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
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 加载更多 */
.tx-load-more {
  text-align: center;
  padding: 40px 0;
}

.tx-load-more-btn {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.tx-load-more-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  color: #00a1d6;
  transform: translateY(-2px);
  box-shadow: 
    0 12px 30px rgba(0, 161, 214, 0.25),
    0 0 0 1px rgba(0, 161, 214, 0.3);
}

.tx-load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.tx-empty-state {
  text-align: center;
  padding: 120px 20px;
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.8), 
    rgba(26, 30, 44, 0.9));
  border-radius: 32px;
  margin: 40px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tx-empty-illustration {
  font-size: 80px;
  margin-bottom: 24px;
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

.tx-empty-title {
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.tx-empty-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 32px;
}

.tx-empty-btn {
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
  gap: 8px;
  transition: all 0.3s;
}

.tx-empty-btn:hover {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 161, 214, 0.4);
}

/* 模态框 */
.tx-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.7), 
    rgba(10, 12, 20, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(20px);
}

.tx-modal-container {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.95), 
    rgba(26, 30, 44, 0.98));
  border-radius: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: tx-modal-slide 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05);
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
  padding: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.1), 
    rgba(0, 130, 179, 0.08));
}

.tx-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.5px;
}

.tx-modal-close {
  background: linear-gradient(145deg, 
    rgba(42, 47, 61, 0.8), 
    rgba(26, 30, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.tx-modal-close:hover {
  background: linear-gradient(145deg, 
    rgba(0, 161, 214, 0.2), 
    rgba(0, 130, 179, 0.15));
  border-color: rgba(0, 161, 214, 0.5);
  color: #00a1d6;
  transform: rotate(90deg);
}

.tx-modal-body {
  padding: 28px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tx-feed-header {
    padding: 12px 16px;
  }
  
  .tx-feed-title h1 {
    font-size: 18px;
  }
  
  .tx-post-creator {
    padding: 20px;
    margin: 12px;
    border-radius: 20px;
  }
  
  .tx-activity-card {
    padding: 20px;
    margin: 12px 0;
    border-radius: 20px;
  }
  
  .tx-user-avatar {
    width: 48px;
    height: 48px;
  }
  
  .tx-username {
    font-size: 16px;
  }
  
  .tx-content-text {
    font-size: 15px;
  }
  
  .tx-image-3, .tx-image-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tx-linked-cover {
    width: 80px;
    height: 120px;
  }
  
  .tx-action-btn-small {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .tx-empty-state {
    padding: 80px 16px;
    margin: 24px 12px;
  }
  
  .tx-empty-illustration {
    font-size: 64px;
  }
  
  .tx-empty-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .tx-feed-list {
    padding: 0 12px;
  }
  
  .tx-post-actions {
    gap: 12px;
  }
  
  .tx-action-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .tx-user-info {
    gap: 12px;
  }
  
  .tx-activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .tx-more-btn {
    align-self: flex-end;
    margin-top: -40px;
  }
  
  .tx-image-grid {
    gap: 6px;
  }
  
  .tx-linked-card {
    flex-direction: column;
  }
  
  .tx-linked-cover {
    width: 100%;
    height: 180px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .tx-action-buttons {
    flex-direction: column;
  }
  
  .tx-empty-state {
    padding: 60px 12px;
    margin: 16px 8px;
  }
  
  .tx-empty-illustration {
    font-size: 48px;
  }
  
  .tx-modal-container {
    width: 95%;
    border-radius: 24px;
  }
  
  .tx-modal-header {
    padding: 20px;
  }
  
  .tx-modal-body {
    padding: 20px;
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