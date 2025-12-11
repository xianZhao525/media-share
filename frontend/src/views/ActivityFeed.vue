<template>
  <div class="tx-feed-container">
    <!-- 腾讯风格头部 -->
    <div class="tx-feed-header">
      <div class="tx-feed-title">
        <i class="tx-icon-feed">🏠</i>
        <h1>好友动态</h1>
      </div>
      <div class="tx-header-actions">
        <button class="tx-header-btn" @click="goToProfile">
          <i class="tx-icon-profile">👤</i>
          <span>我的主页</span>
        </button>
        <button class="tx-refresh-btn" @click="refreshFeed">
          <i class="tx-icon-refresh">🔄</i>
        </button>
      </div>
    </div>

    <!-- 腾讯风格动态发布器 -->
    <div class="tx-post-creator">
      <img :src="currentUser.avatar" :alt="currentUser.username" class="tx-post-avatar" />
      <div class="tx-post-input" @click="showPostModalDialog">
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
          <div class="tx-user-info" @click="viewUserProfile(activity.user._id)">
            <img 
              :src="activity.user.avatar" 
              :alt="activity.user.username"
              class="tx-user-avatar"
            />
            <div class="tx-user-details">
              <div class="tx-user-name">
                <span class="tx-username">{{ activity.user.username }}</span>
                <span v-if="activity.user.verified" class="tx-verified-badge">✅</span>
                <span v-if="activity.user.vipLevel" class="tx-vip-badge">VIP{{ activity.user.vipLevel }}</span>
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
              <img :src="comment.user.avatar" class="tx-comment-avatar" @click="viewUserProfile(comment.user._id)" />
              <div class="tx-comment-content">
                <div class="tx-comment-header">
                  <span class="tx-comment-user" @click="viewUserProfile(comment.user._id)">{{ comment.user.username }}</span>
                  <span class="tx-comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="tx-comment-text">{{ comment.content }}</p>
                <div class="tx-comment-actions">
                  <button class="tx-comment-like" @click="toggleCommentLike(comment._id)">
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
              <img :src="comment.user.avatar" class="tx-comment-avatar" @click="viewUserProfile(comment.user._id)" />
              <div class="tx-comment-content">
                <div class="tx-comment-header">
                  <span class="tx-comment-user" @click="viewUserProfile(comment.user._id)">{{ comment.user.username }}</span>
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
            <div class="modal-user-info">
              <img :src="currentUser.avatar" class="modal-user-avatar" />
              <div class="modal-user-details">
                <span class="modal-username">{{ currentUser.username }}</span>
                <select v-model="newDynamic.visibility" class="visibility-select">
                  <option value="public">公开</option>
                  <option value="friends">仅好友</option>
                  <option value="private">仅自己</option>
                </select>
              </div>
            </div>
            
            <textarea
              v-model="newDynamic.content"
              ref="postInputRef"
              class="modal-textarea"
              placeholder="分享你的想法..."
              :maxlength="500"
              rows="6"
            ></textarea>
            
            <div class="char-count">
              剩余 {{ remainingChars }} 字
            </div>
            
            <!-- 图片预览 -->
            <div v-if="newDynamic.images.length > 0" class="modal-image-preview">
              <div class="image-preview-grid">
                <div
                  v-for="(img, index) in newDynamic.images"
                  :key="img.id"
                  class="preview-image-item"
                >
                  <img :src="img.url" :alt="`图片${index + 1}`" />
                  <button class="remove-preview" @click="removeImage(index)">
                    <i>×</i>
                  </button>
                </div>
                <div 
                  v-if="newDynamic.images.length < 9" 
                  class="add-more-images"
                  @click="showImageUpload"
                >
                  <i>+</i>
                  <span>添加图片</span>
                </div>
              </div>
            </div>
            
            <!-- 发布选项 -->
            <div class="modal-actions">
              <button class="action-option" @click="showImageUpload">
                <i>🖼️</i>
                <span>图片/视频</span>
              </button>
              <button class="action-option" @click="showEmojiPicker">
                <i>😊</i>
                <span>表情</span>
              </button>
              <button class="action-option">
                <i>📍</i>
                <span>位置</span>
              </button>
              <button class="action-option">
                <i>@</i>
                <span>提到谁</span>
              </button>
            </div>
            
            <!-- 发布按钮 -->
            <div class="modal-footer">
              <button 
                class="post-button" 
                @click="postDynamic"
                :disabled="!canPost"
                :class="{ posting: posting }"
              >
                <span v-if="posting">发布中...</span>
                <span v-else>发布</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { activityApi } from '@/api/activityApi'

const router = useRouter()

// 响应式数据 - 新增发布相关数据
const loading = ref(false)
const loadingMore = ref(false)
const posting = ref(false)
const hasMore = ref(true)
const showPostModal = ref(false)
const postInputRef = ref(null)

// 新增：发布动态的数据
const newDynamic = ref({
  content: '',
  images: [],
  visibility: 'public',
  location: '',
  tagUsers: []
})

// 当前用户
const currentUser = ref({
  _id: 'current',
  username: '当前用户',
  avatar: 'https://via.placeholder.com/40/00a1d6/ffffff',
  verified: true,
  vipLevel: 3
})

// 动态数据
const activities = ref([
  {
    _id: 'act001',
    user: {
      _id: 'user001',
      username: '电影爱好者',
      avatar: 'https://via.placeholder.com/44/00a1d6/ffffff',
      verified: true,
      vipLevel: 2
    },
    content: '刚看完《流浪地球2》，特效真的太震撼了！中国科幻电影的里程碑之作。',
    createdAt: new Date(Date.now() - 1800000),
    likeCount: 42,
    commentCount: 8,
    shareCount: 5,
    isLiked: false,
    isShared: false,
    showComments: false,
    commentText: '',
    images: [
      { 
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop',
        id: 'img1'
      },
      { 
        url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop',
        id: 'img2'
      }
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
          _id: 'user003',
          username: '科幻迷',
          avatar: 'https://via.placeholder.com/32/00a1d6/ffffff'
        },
        content: '同感！特效确实很棒，剧情也很感人',
        createdAt: new Date(Date.now() - 1200000),
        likeCount: 12,
        isLiked: false
      }
    ],
    recentComments: []
  },
  {
    _id: 'act002',
    user: {
      _id: 'user002',
      username: '旅行达人',
      avatar: 'https://via.placeholder.com/44/ff6b6b/ffffff',
      verified: false,
      vipLevel: 1
    },
    content: '分享今天在西湖拍的美景，春色满园关不住，一枝红杏出墙来。',
    createdAt: new Date(Date.now() - 3600000),
    likeCount: 89,
    commentCount: 15,
    shareCount: 3,
    isLiked: true,
    isShared: false,
    showComments: false,
    commentText: '',
    images: [
      { 
        url: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&h=300&fit=crop',
        id: 'img3'
      }
    ],
    location: '杭州西湖',
    hotComments: [],
    recentComments: []
  }
])

// 加载动态
const loadFeed = async () => {
  loading.value = true
  try {
    const response = await activityApi.getFeed({
      page: 1,
      limit: 20
    })
    activities.value = response.data
    hasMore.value = response.pagination.page < Math.ceil(response.pagination.total / response.pagination.limit)
  } catch (error) {
    console.error('加载动态失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增：发表动态功能
const postDynamic = async () => {
  if (!newDynamic.content.trim()) return
  
  posting.value = true
  try {
    const response = await activityApi.createActivity({
      content: newDynamic.content.trim(),
      images: newDynamic.images,
      visibility: newDynamic.visibility
    })
    
    // 将新动态添加到列表顶部
    activities.value.unshift(response.data)
    
    // 重置表单
    newDynamic.value.content = ''
    newDynamic.value.images = []
    
    // 隐藏模态框
    showPostModal.value = false
    
    // 显示成功消息
    showSuccessMessage('动态发布成功！')
  } catch (error) {
    console.error('发布动态失败:', error)
    showErrorMessage('发布失败，请重试')
  } finally {
    posting.value = false
  }
}

// 新增：上传图片功能
const handleImageUpload = (event) => {
  const files = event.target.files
  if (!files.length) return
  
  // 这里可以添加图片上传逻辑
  for (let i = 0; i < Math.min(files.length, 9); i++) {
    const file = files[i]
    
    // 创建本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      newDynamic.value.images.push({
        url: e.target.result,
        file: file,
        id: Date.now() + i
      })
    }
    reader.readAsDataURL(file)
  }
}

// 新增：删除图片
const removeImage = (index) => {
  newDynamic.value.images.splice(index, 1)
}

// 新增：消息提示
const showSuccessMessage = (message) => {
  // 可以集成一个通知组件
  alert(message)
}

const showErrorMessage = (message) => {
  alert(message)
}

// 方法
const refreshFeed = () => {
  loading.value = true
  setTimeout(() => {
    loadFeed()
  }, 1000)
}

const loadMore = () => {
  loadingMore.value = true
  setTimeout(() => {
    // 模拟加载更多数据
    activities.value.push(...generateMoreActivities())
    loadingMore.value = false
    hasMore.value = activities.value.length < 50 // 模拟还有更多数据
  }, 1500)
}

const toggleLike = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity) {
    activity.isLiked = !activity.isLiked
    activity.likeCount = activity.isLiked ? activity.likeCount + 1 : activity.likeCount - 1
  }
}

const toggleCommentLike = (commentId) => {
  activities.value.forEach(activity => {
    [...(activity.hotComments || []), ...(activity.recentComments || [])].forEach(comment => {
      if (comment._id === commentId) {
        comment.isLiked = !comment.isLiked
        comment.likeCount = comment.isLiked ? comment.likeCount + 1 : comment.likeCount - 1
      }
    })
  })
}

const focusComment = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity) {
    activity.showComments = true
    // 滚动到评论区域
    nextTick(() => {
      const commentInput = document.querySelector(`[data-activity="${activityId}"] input`)
      if (commentInput) {
        commentInput.focus()
      }
    })
  }
}

const shareActivity = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity) {
    activity.isShared = true
    activity.shareCount += 1
    
    // 模拟分享到其他平台
    const shareUrl = `${window.location.origin}/dynamic/${activityId}`
    const shareText = `${activity.user.username}的动态：${activity.content.substring(0, 50)}...`
    
    if (navigator.share) {
      navigator.share({
        title: '分享动态',
        text: shareText,
        url: shareUrl
      })
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(shareText + '\n' + shareUrl)
      alert('链接已复制到剪贴板')
    }
  }
}

const postComment = (activityId) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (activity && activity.commentText?.trim()) {
    const newComment = {
      _id: 'com' + Date.now(),
      user: { ...currentUser.value },
      content: activity.commentText.trim(),
      createdAt: new Date(),
      likeCount: 0,
      isLiked: false
    }
    
    activity.recentComments.push(newComment)
    activity.commentCount += 1
    activity.commentText = ''
  }
}

const previewImage = (images, index) => {
  console.log('预览图片:', index)
  router.push(`/dynamic/${images[index].id}/preview`)
}

const viewItem = (itemId) => {
  router.push(`/item/${itemId}`)
}

const viewUserProfile = (userId) => {
  router.push(`/user/${userId}`)
}

const goToProfile = () => {
  router.push('/user/self')
}

const goToExplore = () => {
  router.push('/explore')
}

const showImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = handleImageUpload
  input.click()
}

const showVideoUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.onchange = (e) => {
    console.log('选择视频:', e.target.files)
  }
  input.click()
}

const showEmojiPicker = () => {
  console.log('显示表情选择器')
}

// 新增：显示发布模态框
const showPostModalDialog = () => {
  showPostModal.value = true
  nextTick(() => {
    if (postInputRef.value) {
      postInputRef.value.focus()
    }
  })
}

const hidePostModal = () => {
  showPostModal.value = false
  // 重置表单
  newDynamic.value = {
    content: '',
    images: [],
    visibility: 'public',
    location: '',
    tagUsers: []
  }
}

// 辅助函数：生成更多模拟数据
const generateMoreActivities = () => {
  const newActivities = []
  const users = [
    { _id: 'user003', username: '美食家小张', avatar: 'https://via.placeholder.com/44/ff9500/ffffff', vipLevel: 1 },
    { _id: 'user004', username: '运动达人', avatar: 'https://via.placeholder.com/44/34c759/ffffff' },
    { _id: 'user005', username: '读书爱好者', avatar: 'https://via.placeholder.com/44/5856d6/ffffff', vipLevel: 2 }
  ]
  
  const contents = [
    '今天尝试了一道新菜，味道超级棒！',
    '完成了一次10公里跑步，感觉整个人都精神了。',
    '刚刚读完《三体》，太震撼了，推荐给大家！',
    '周末和朋友一起去了郊游，景色美不胜收。'
  ]
  
  for (let i = 0; i < 5; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    newActivities.push({
      _id: 'act' + (activities.value.length + i + 1),
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        verified: Math.random() > 0.5,
        vipLevel: user.vipLevel
      },
      content: contents[Math.floor(Math.random() * contents.length)],
      createdAt: new Date(Date.now() - Math.random() * 86400000),
      likeCount: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 20),
      shareCount: Math.floor(Math.random() * 10),
      isLiked: false,
      isShared: false,
      showComments: false,
      commentText: '',
      images: Math.random() > 0.5 ? [{
        url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=300&fit=crop`,
        id: 'img' + (i + 10)
      }] : [],
      hotComments: [],
      recentComments: []
    })
  }
  
  return newActivities
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

// 计算属性：获取剩余可输入字数
const remainingChars = computed(() => {
  return 500 - newDynamic.value.content.length
})

// 计算属性：检查是否可以发布
const canPost = computed(() => {
  return newDynamic.value.content.trim().length > 0 && !posting.value
})

// 初始化
onMounted(() => {
  console.log('ActivityFeed 组件已加载')
  loadFeed()
})
</script>

<style scoped>
/* === 腾讯黑色高级主题 - 动态流 === */
.tx-feed-container {
  background: linear-gradient(180deg, #0a0c14 0%, #121826 100%);
  min-height: 100vh;
  color: #e0e0e0;
}

/* 头部 */
.tx-feed-header {
  background: linear-gradient(135deg, 
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
  backdrop-filter: blur(20px);
}

.tx-feed-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-feed-title h1 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(90deg, #ffffff, #00a1d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tx-icon-feed {
  font-size: 24px;
  color: #00a1d6;
}

.tx-header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tx-header-btn {
  background: rgba(0, 161, 214, 0.15);
  border: 1px solid rgba(0, 161, 214, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  color: #00a1d6;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-header-btn:hover {
  background: rgba(0, 161, 214, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 161, 214, 0.2);
}

.tx-refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #ffffff;
}

.tx-refresh-btn:hover {
  background: rgba(0, 161, 214, 0.3);
  border-color: #00a1d6;
  transform: rotate(180deg);
}

/* 动态发布器 */
.tx-post-creator {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.9), 
    rgba(26, 30, 44, 0.95));
  padding: 24px;
  margin: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.tx-post-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  float: left;
  margin-right: 16px;
  border: 2px solid rgba(0, 161, 214, 0.3);
  object-fit: cover;
}

.tx-post-input {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 60px;
}

.tx-post-input:hover {
  background: rgba(0, 161, 214, 0.1);
  border-color: rgba(0, 161, 214, 0.3);
}

.tx-placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 100%;
}

.tx-post-actions {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 12px;
  transition: all 0.3s;
  flex: 1;
  justify-content: center;
}

.tx-action-btn:hover {
  background: rgba(0, 161, 214, 0.15);
  border-color: rgba(0, 161, 214, 0.4);
  color: #00a1d6;
  transform: translateY(-2px);
}

/* 动态卡片 */
.tx-feed-list {
  padding: 16px;
}

.tx-activity-card {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.9), 
    rgba(26, 30, 44, 0.95));
  margin: 16px 0;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tx-activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 15px 40px rgba(0, 161, 214, 0.2),
    0 0 0 1px rgba(0, 161, 214, 0.3);
  border-color: rgba(0, 161, 214, 0.4);
}

/* 用户信息 */
.tx-activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.tx-user-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  cursor: pointer;
  flex: 1;
}

.tx-user-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 161, 214, 0.4);
  transition: all 0.3s;
}

.tx-user-info:hover .tx-user-avatar {
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
  flex-wrap: wrap;
}

.tx-username {
  font-weight: 600;
  font-size: 18px;
  color: #ffffff;
}

.tx-verified-badge {
  font-size: 14px;
  color: #00a1d6;
}

.tx-vip-badge {
  background: linear-gradient(135deg, #ff9500, #ff6b35);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.tx-activity-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.tx-divider {
  margin: 0 4px;
}

.tx-more-btn {
  background: rgba(255, 255, 255, 0.05);
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
  background: rgba(0, 161, 214, 0.2);
  border-color: rgba(0, 161, 214, 0.4);
  color: #00a1d6;
  transform: rotate(90deg);
}

/* 动态内容 */
.tx-activity-content {
  margin-bottom: 20px;
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
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tx-image-item:hover {
  border-color: rgba(0, 161, 214, 0.6);
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.2);
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
  margin-top: 16px;
}

.tx-linked-card {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.tx-linked-card:hover {
  border-color: rgba(0, 161, 214, 0.6);
  background: rgba(0, 161, 214, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.15);
}

.tx-linked-cover {
  width: 100px;
  height: 140px;
  flex-shrink: 0;
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
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 8px;
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
}

/* 互动操作 */
.tx-activity-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
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
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.tx-action-buttons {
  display: flex;
  gap: 8px;
}

.tx-action-btn-small {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.tx-action-btn-small:hover {
  background: rgba(0, 161, 214, 0.15);
  border-color: rgba(0, 161, 214, 0.4);
  color: #00a1d6;
  transform: translateY(-2px);
}

.tx-action-btn-small.tx-liked {
  background: rgba(0, 161, 214, 0.2);
  border-color: rgba(0, 161, 214, 0.6);
  color: #00a1d6;
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
  color: #ff6b35;
  margin-bottom: 16px;
  font-weight: 500;
}

.tx-comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.tx-comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid rgba(0, 161, 214, 0.3);
  transition: all 0.3s;
}

.tx-comment-avatar:hover {
  border-color: #00a1d6;
  transform: scale(1.05);
}

.tx-comment-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
}

.tx-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tx-comment-user {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: color 0.3s;
}

.tx-comment-user:hover {
  color: #00a1d6;
}

.tx-comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.tx-comment-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-bottom: 8px;
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
  transition: all 0.3s;
}

.tx-comment-like:hover, .tx-comment-reply:hover {
  color: #00a1d6;
}

/* 评论输入框 */
.tx-comment-input {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 20px;
}

.tx-comment-input-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.tx-comment-input-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-comment-input-field {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #ffffff;
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
  padding: 4px;
  font-size: 18px;
}

.tx-comment-send-btn {
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.tx-comment-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 161, 214, 0.3);
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
  gap: 8px;
  margin-bottom: 16px;
}

.tx-spinner-dot {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #00a1d6, #0082b3);
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

.tx-loading-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 加载更多 */
.tx-load-more {
  text-align: center;
  padding: 32px 0;
}

.tx-load-more-btn {
  background: linear-gradient(135deg, 
    rgba(18, 24, 38, 0.9), 
    rgba(26, 30, 44, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.tx-load-more-btn:hover:not(:disabled) {
  border-color: rgba(0, 161, 214, 0.6);
  color: #00a1d6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.2);
}

.tx-load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.tx-empty-state {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.9), 
    rgba(26, 30, 44, 0.95));
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
  backdrop-filter: blur(20px);
}

.tx-empty-illustration {
  font-size: 72px;
  margin-bottom: 20px;
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
  font-size: 22px;
  color: #ffffff;
  margin-bottom: 12px;
  font-weight: 600;
}

.tx-empty-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  margin-bottom: 28px;
  max-width: 300px;
  margin: 0 auto 28px;
}

.tx-empty-btn {
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.tx-empty-btn:hover {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.3);
}

/* 模态框 */
.tx-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tx-modal-container {
  background: linear-gradient(145deg, 
    rgba(18, 24, 38, 0.95), 
    rgba(26, 30, 44, 0.98));
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tx-modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(18, 24, 38, 0.8);
}

.tx-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(90deg, #ffffff, #00a1d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tx-modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.tx-modal-close:hover {
  background: rgba(0, 161, 214, 0.3);
  border-color: #00a1d6;
  color: #ffffff;
  transform: rotate(90deg);
}

.tx-modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

/* 模态框发布器 */
.modal-user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.modal-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 161, 214, 0.4);
}

.modal-user-details {
  flex: 1;
}

.modal-username {
  font-weight: 600;
  color: #ffffff;
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.visibility-select {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
}

.visibility-select:hover {
  border-color: rgba(0, 161, 214, 0.6);
  background: rgba(0, 161, 214, 0.1);
}

.modal-textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
  resize: none;
  font-family: inherit;
  margin-bottom: 16px;
  transition: all 0.3s;
  min-height: 120px;
}

.modal-textarea:focus {
  border-color: rgba(0, 161, 214, 0.6);
  background: rgba(0, 161, 214, 0.05);
  box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.2);
}

.modal-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}

/* 图片预览 */
.modal-image-preview {
  margin-bottom: 24px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preview-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.preview-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.preview-image-item:hover img {
  transform: scale(1.05);
}

.remove-preview {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-preview:hover {
  background: rgba(255, 0, 0, 0.7);
  transform: scale(1.1);
}

.add-more-images {
  aspect-ratio: 1;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
}

.add-more-images:hover {
  border-color: rgba(0, 161, 214, 0.6);
  color: #00a1d6;
  background: rgba(0, 161, 214, 0.1);
  transform: scale(1.02);
}

.add-more-images i {
  font-size: 28px;
  margin-bottom: 8px;
}

.add-more-images span {
  font-size: 13px;
}

/* 发布选项 */
.modal-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.action-option {
  flex: 1;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.action-option:hover {
  border-color: rgba(0, 161, 214, 0.6);
  background: rgba(0, 161, 214, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 161, 214, 0.2);
}

.action-option i {
  font-size: 24px;
}

.action-option span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 发布按钮 */
.modal-footer {
  text-align: right;
}

.post-button {
  background: linear-gradient(135deg, #00a1d6, #0082b3);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.post-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0082b3, #006699);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.4);
}

.post-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-button.posting {
  background: #666;
}

.post-button.posting::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tx-feed-header {
    padding: 12px 16px;
  }
  
  .tx-post-creator {
    margin: 12px;
    padding: 20px;
  }
  
  .tx-feed-list {
    padding: 12px;
  }
  
  .tx-activity-card {
    padding: 20px;
    margin: 12px 0;
  }
  
  .tx-modal-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .image-preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-actions {
    flex-wrap: wrap;
  }
  
  .action-option {
    min-width: calc(50% - 6px);
  }
}

@media (max-width: 480px) {
  .tx-feed-title h1 {
    font-size: 18px;
  }
  
  .tx-header-btn span {
    display: none;
  }
  
  .tx-header-btn {
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
  
  .tx-modal-body {
    padding: 20px;
  }
  
  .modal-user-info {
    margin-bottom: 20px;
  }
  
  .image-preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .post-button {
    width: 100%;
  }
}
</style>