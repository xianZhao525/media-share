[file name]: ItemDetail.vue
[file content begin]
<template>
  <div class="item-detail">
    <!-- 内容详情卡片 -->
    <div class="item-card">
      <div class="item-header">
        <div class="item-meta">
          <span class="item-category">{{ itemDetails.type || '内容' }}</span>
          <span class="item-date">{{ formatDate(itemDetails.createdAt) }}</span>
        </div>
        <h1 class="item-title">{{ itemDetails.title || '内容详情' }}</h1>
        <div class="item-rating">
          <div class="rating-badge">
            <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
            <RatingStars :value="averageRating" size="small" :show-value="false" />
          </div>
          <span class="review-count">{{ totalReviews }} 条评论</span>
        </div>
      </div>

      <div class="item-body">
        <div class="item-description">
          {{ itemDetails.description || '这是一个示例内容，用于展示评论功能。' }}
        </div>
        
        <div class="item-tags">
          <span class="tag">热门</span>
          <span class="tag">推荐</span>
          <span class="tag">精选</span>
        </div>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="reviews-container">
      <div class="section-header">
        <h2 class="section-title">
          评论
          <span class="section-badge">{{ totalReviews }}</span>
        </h2>
        <div class="section-actions">
          <button 
            v-if="isAuthenticated" 
            @click="showReviewForm = !showReviewForm"
            class="btn-action"
            :class="{ 'active': showReviewForm }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            写评论
          </button>
        </div>
      </div>

      <!-- 评论表单 -->
      <transition name="slide-fade">
        <div v-if="showReviewForm && isAuthenticated" class="review-form-wrapper">
          <ReviewForm
            :itemId="itemId"
            :editing="!!editingReview"
            :initialData="editingReview || {}"
            @submit="handleReviewSubmit"
            @cancel="handleReviewCancel"
          />
        </div>
      </transition>

      <!-- 登录提示 -->
      <div v-if="!isAuthenticated" class="login-prompt-card">
        <div class="prompt-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#006EFF">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <div class="prompt-text">
            <h3>登录后参与评论</h3>
            <p>发表你的看法，和其他用户一起讨论</p>
          </div>
          <button @click="toggleLogin" class="btn-primary">
            立即登录
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <ReviewList
        :itemId="itemId"
        :averageRating="averageRating"
        @edit-review="handleEditReview"
        @delete-review="handleReviewDeleted"
        @refresh="loadItemDetails"
        ref="reviewListRef"
      />
    </div>

    <!-- 侧边信息栏 -->
    <div class="sidebar">
      <div class="stats-card">
        <h3 class="stats-title">数据概览</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ totalReviews }}</span>
            <span class="stat-label">评论数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ averageRating.toFixed(1) }}</span>
            <span class="stat-label">平均评分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ mockData.views }}</span>
            <span class="stat-label">浏览</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ mockData.collections }}</span>
            <span class="stat-label">收藏</span>
          </div>
        </div>
      </div>

      <div class="related-card">
        <h3 class="related-title">相关内容</h3>
        <div class="related-list">
          <div v-for="item in relatedItems" :key="item.id" class="related-item">
            <div class="related-item-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <div class="related-item-meta">
                <RatingStars :value="item.rating" size="small" :show-value="false" />
                <span>{{ item.comments }} 评论</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ReviewForm from '../components/ReviewForm.vue'
import ReviewList from '../components/ReviewList.vue'
import RatingStars from '../components/RatingStars.vue'
import { itemApi } from '../utils/api.js'

const route = useRoute()

const editingReview = ref(null)
const showReviewForm = ref(false)
const itemDetails = ref({})
const averageRating = ref(0)
const totalReviews = ref(0)
const reviewListRef = ref(null)

const itemId = computed(() => {
  return route.params.id || '64f8a1b2c9d3f7a5b6c8d9f1'
})

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// 模拟数据
const mockData = ref({
  views: 12543,
  collections: 642,
  rating: 4.5
})

const relatedItems = ref([
  { id: 1, title: '相关内容一', description: '相关描述内容一', rating: 4.2, comments: 45 },
  { id: 2, title: '相关内容二', description: '相关描述内容二', rating: 4.7, comments: 89 },
  { id: 3, title: '相关内容三', description: '相关描述内容三', rating: 4.0, comments: 32 }
])
onMounted(() => {
  // 自动设置token（跳过登录）
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'mock-token-123');
  }
  loadItemDetails();
});
const loadItemDetails = async () => {
  try {
    const response = await itemApi.getItem(itemId.value)
    
    if (response.code === 200) {
      itemDetails.value = response.data
      averageRating.value = response.data.averageRating || 0
      totalReviews.value = response.data.reviewCount || 0
    } else {
      // 模拟数据
      itemDetails.value = {
        id: itemId.value,
        title: itemId.value.includes('demo') ? '示例内容标题' : `内容 ${itemId.value}`,
        type: '电影',
        description: '这是一个详细的内容描述，用于展示腾讯风格的页面设计。这里可以放置更长的描述内容，包括背景介绍、特点说明等。',
        averageRating: 4.5,
        reviewCount: 128,
        createdAt: new Date().toISOString()
      }
      averageRating.value = itemDetails.value.averageRating
      totalReviews.value = itemDetails.value.reviewCount
    }
  } catch (error) {
    console.error('加载内容详情失败:', error)
    // 使用模拟数据
    itemDetails.value = {
      id: itemId.value,
      title: '示例内容标题',
      type: '电影',
      description: '这是一个详细的内容描述，用于展示腾讯风格的页面设计。这里可以放置更长的描述内容，包括背景介绍、特点说明等。',
      averageRating: 4.5,
      reviewCount: 128,
      createdAt: new Date().toISOString()
    }
    averageRating.value = itemDetails.value.averageRating
    totalReviews.value = itemDetails.value.reviewCount
  }
}

const handleReviewSubmit = async (reviewData) => {
  try {
    console.log('提交评论:', reviewData)
    editingReview.value = null
    showReviewForm.value = false

    // 刷新评论列表
    reviewListRef.value.loadReviews(1)   // 现在不会报不存在了
    loadItemDetails()
  } catch (err) {
    console.error('提交失败', err)
    // 可选：提示用户
  }
}
  

const handleReviewCancel = () => {
  editingReview.value = null
  showReviewForm.value = false
}

const handleEditReview = (review) => {
  editingReview.value = {
    _id: review._id,
    rating: review.rating,
    content: review.content
  }
  showReviewForm.value = true
}

const handleReviewDeleted = () => {
  loadItemDetails()
}

const formatDate = (dateString) => {
  if (!dateString) return '刚刚'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

const toggleLogin = () => {
  if (isAuthenticated.value) {
    localStorage.removeItem('token')
    showReviewForm.value = false
  } else {
    localStorage.setItem('token', 'mock-token-123')
  }
  window.location.reload()
}
</script>

<style scoped>
.item-detail {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  min-height: 100vh;
}

.item-card {
  grid-column: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 110, 255, 0.08);
  overflow: hidden;
  border: 1px solid #e0e7ff;
  transition: transform 0.3s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 110, 255, 0.12);
}

.item-header {
  padding: 32px 32px 24px;
  background: linear-gradient(135deg, #006eff 0%, #0052cc 100%);
  color: white;
  position: relative;
}

.item-header::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 32px;
  right: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.item-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.item-category {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.item-title {
  margin: 0 0 24px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.3;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 20px;
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.rating-number {
  font-size: 24px;
  font-weight: 700;
}

.review-count {
  font-size: 14px;
  opacity: 0.9;
}

.item-body {
  padding: 32px;
}

.item-description {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
  margin-bottom: 24px;
}

.item-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f7ff;
  color: #006eff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #d6e7ff;
  transition: all 0.3s ease;
}

.tag:hover {
  background: #e0f0ff;
  transform: translateY(-1px);
}

.reviews-container {
  grid-column: 1;
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.section-badge {
  background: #006eff;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f0f7ff;
  border: 2px solid #d6e7ff;
  color: #006eff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: #e0f0ff;
  border-color: #006eff;
  transform: translateY(-1px);
}

.btn-action.active {
  background: #006eff;
  color: white;
  border-color: #006eff;
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

.review-form-wrapper {
  margin-bottom: 24px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-prompt-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8f4ff;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.prompt-text h3 {
  margin: 0 0 8px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
}

.prompt-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #006eff 0%, #0052cc 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 110, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 110, 255, 0.3);
}

/* 侧边栏样式 */
.sidebar {
  grid-column: 2;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.stats-card,
.related-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8f4ff;
}

.stats-title,
.related-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8fbff;
  border-radius: 8px;
  border: 1px solid #e0f0ff;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #006eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  padding: 16px;
  background: #f8fbff;
  border-radius: 8px;
  border: 1px solid #e0f0ff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-item:hover {
  background: #e0f0ff;
  transform: translateX(4px);
}

.related-item h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.related-item p {
  margin: 0 0 12px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .item-detail {
    grid-template-columns: 1fr;
    padding: 12px;
  }
  
  .sidebar {
    grid-column: 1;
    position: static;
  }
  
  .item-header {
    padding: 24px 24px 20px;
  }
  
  .item-title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .item-header {
    padding: 20px 20px 16px;
  }
  
  .item-title {
    font-size: 20px;
  }
  
  .item-body {
    padding: 24px 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
[file content end]