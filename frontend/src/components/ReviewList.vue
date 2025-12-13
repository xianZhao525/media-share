<template>
  <div class="review-list-tencent">
    <!-- 评分概览 -->
    <div class="rating-overview">
      <div class="overview-main">
        <div class="average-rating">
          <span class="average-number">{{ averageRating.toFixed(1) }}</span>
          <div class="average-details">
            <RatingStars :value="averageRating" size="medium" :show-value="false" />
            <span class="total-reviews">{{ totalReviews }} 条评论</span>
          </div>
        </div>
      </div>

      <!-- 评分分布 -->
      <div class="rating-distribution-tencent">
        <div v-for="dist in ratingDistribution" :key="dist.rating" class="dist-row">
          <span class="dist-label">{{ dist.rating }}星</span>
          <div class="dist-bar-container">
            <div 
              class="dist-bar" 
              :style="{ width: `${dist.percentage}%` }"
              :class="`rating-bar-${dist.rating}`"
            ></div>
          </div>
          <span class="dist-percentage">{{ dist.percentage }}%</span>
          <span class="dist-count">({{ dist.count }})</span>
        </div>
      </div>
    </div>

    <!-- 排序栏 -->
    <div class="sort-bar">
      <div class="sort-options-tencent">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-option"
          :class="{ 'active': sortBy === option.value, 'disabled': loading }"
          @click="handleSort(option.value)"
        >
          <span class="option-text">{{ option.label }}</span>
          <span v-if="option.icon" class="option-icon">{{ option.icon }}</span>
        </button>
      </div>
      
      <div class="review-stats">
        <span class="stats-text">共 {{ totalReviews }} 条评论</span>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="reviews-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state-tencent">
        <div class="tencent-spinner"></div>
        <p>正在加载评论...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="reviews.length === 0" class="empty-state-tencent">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#CCCCCC">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zM6 12h2v2H6zm0-3h2v2H6zm0-3h2v2H6zm4 6h5v2h-5zm0-3h8v2h-8zm0-3h8v2h-8z"/>
        </svg>
        <h3>还没有评论</h3>
        <p>快来发表第一条评论吧</p>
      </div>

      <!-- 评论卡片 -->
      <div v-else class="reviews-grid">
        <div
          v-for="review in reviews"
          :key="review._id"
          class="review-card-tencent"
          :class="{ 'owner-card': review.isOwner }"
        >
          <div class="card-header">
            <div class="user-avatar-tencent">
              <img
                :src="review.user?.avatar || '/default-avatar.png'"
                :alt="review.user?.username"
                @error="handleAvatarError"
              />
              <div v-if="review.isOwner" class="owner-badge">作者</div>
            </div>
            
            <div class="user-info-tencent">
              <div class="user-name-tencent">{{ review.user?.username || '匿名用户' }}</div>
              <div class="user-level">Lv.{{ Math.floor(Math.random() * 30) + 1 }}</div>
            </div>
            
            <div class="review-meta-tencent">
              <RatingStars :value="review.rating" size="small" :show-value="false" />
              <span class="review-time">{{ formatTime(review.createdAt) }}</span>
            </div>
          </div>

          <div class="card-body">
            <p class="review-content-tencent">{{ review.content }}</p>
            
            <div v-if="review.images" class="review-images">
              <img
                v-for="(img, index) in review.images.slice(0, 3)"
                :key="index"
                :src="img"
                class="review-image"
              />
            </div>
          </div>

          <div class="card-footer">
            <div class="action-buttons">
              <button
                @click="toggleLike(review)"
                class="action-like"
                :class="{ 'liked': review.isLiked }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" :fill="review.isLiked ? '#FF3366' : '#999'"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ review.likes || 0 }}</span>
              </button>
              
              <button class="action-comment">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#999" d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <span>回复</span>
              </button>
            </div>
            
            <div v-if="review.isOwner" class="owner-actions">
              <button @click="handleEdit(review)" class="btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#666" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                编辑
              </button>
              <button @click="handleDelete(review._id)" class="btn-delete">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#666" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="tencent-pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn prev-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        </button>
        
        <div class="page-numbers-tencent">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="{
              'page-number': true,
              'active': page === currentPage,
              'ellipsis': page === '...'
            }"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn next-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        
        <div class="page-jump">
          <span>前往</span>
          <input
            type="number"
            v-model.number="jumpPage"
            min="1"
            :max="totalPages"
            @keyup.enter="goToPage(jumpPage)"
          />
          <span>页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import RatingStars from './RatingStars.vue'
  import { reviewApi } from '../utils/api.js'
  import { defineExpose } from 'vue'
  
  const props = defineProps({
    itemId: {
      type: String,
      required: true
    },
    averageRating: {
      type: Number,
      default: 0
    }
  })
  
  const emit = defineEmits(['edit-review', 'delete-review', 'refresh'])
  
  // 响应式数据
  const reviews = ref([])
  const loading = ref(true)
  const sortBy = ref('recent')
  const currentPage = ref(1)
  const totalReviews = ref(0)
  const totalPages = ref(1)
  const ratingDistribution = ref([])
  const showDeleteModal = ref(false)
  const reviewToDelete = ref(null)
  const realAverageRating = ref(0)
  
  // 配置项
  const pageSize = 10
  const sortOptions = [
    { label: '最新', value: 'recent', icon: '🕒' },
    { label: '最热', value: 'popular', icon: '🔥' },
    { label: '评分最高', value: 'highest', icon: '⭐' },
    { label: '评分最低', value: 'lowest', icon: '⬇️' }
  ]
  
  // 计算属性
  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages.value <= maxVisible) {
      for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage.value - 2)
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = end - maxVisible + 1
      }
      
      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages.value) {
        if (end < totalPages.value - 1) pages.push('...')
        pages.push(totalPages.value)
      }
    }
    
    return pages
  })
  
  // 监听itemId变化
  watch(() => props.itemId, () => {
    loadReviews(1)
  })
  
  // 生命周期
  onMounted(() => {
    loadReviews()
  })
  
  // 方法
  const loadReviews = async (page = 1) => {
    loading.value = true
    try {
      // 构建查询参数
      const params = {
        page,
        pageSize,
        sortBy: sortBy.value
      }
      
      // 调用真实API
      const response = await reviewApi.getReviews(props.itemId, params)
      
      if (response.code === 200) {
        const { reviews: reviewList, pagination, ratingDistribution: distribution } = response.data
        
        reviews.value = reviewList
        totalReviews.value = pagination.totalReviews
        totalPages.value = pagination.totalPages
        ratingDistribution.value = distribution
        currentPage.value = pagination.page
        
        // 计算真实的平均评分
        if (distribution.length > 0) {
          const total = distribution.reduce((sum, dist) => sum + dist.rating * dist.count, 0)
          realAverageRating.value = total / totalReviews.value
        }
        
        emit('refresh', realAverageRating.value)
      } else {
        console.error('获取评论失败:', response.message)
      }
    } catch (error) {
      console.error('加载评论失败:', error)
      // 回退到模拟数据
      loadMockData(page)
    } finally {
      loading.value = false
    }
  }
  
  // 模拟数据（备用）
  const loadMockData = (page = 1) => {
    const mockReviews = [
      {
        _id: 'review1',
        user: {
          _id: 'user1',
          username: '张三',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        rating: 5,
        content: '这个内容太棒了！强烈推荐给大家。',
        likes: 12,
        isLiked: true,
        isOwner: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: 'review2',
        user: {
          _id: 'user2',
          username: '李四',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        rating: 4,
        content: '不错的内容，但还有些可以改进的地方。',
        likes: 8,
        isLiked: false,
        isOwner: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    
    const startIndex = (page - 1) * pageSize
    const paginatedReviews = mockReviews.slice(startIndex, startIndex + pageSize)
    
    reviews.value = paginatedReviews
    totalReviews.value = mockReviews.length
    totalPages.value = Math.ceil(mockReviews.length / pageSize)
    ratingDistribution.value = [
      { rating: 5, count: 1, percentage: 50 },
      { rating: 4, count: 1, percentage: 50 },
      { rating: 3, count: 0, percentage: 0 },
      { rating: 2, count: 0, percentage: 0 },
      { rating: 1, count: 0, percentage: 0 }
    ]
    currentPage.value = page
  }
  
  const handleSort = (sortValue) => {
    sortBy.value = sortValue
    loadReviews(1)
  }
  
  const goToPage = (page) => {
    if (page < 1 || page > totalPages.value || page === '...') return
    loadReviews(page)
  }
  
  const handleEdit = (review) => {
    emit('edit-review', review)
  }
  
  const handleDelete = (reviewId) => {
    reviewToDelete.value = reviewId
    showDeleteModal.value = true
  }
  
  const closeModal = () => {
    showDeleteModal.value = false
    reviewToDelete.value = null
  }
  
  const confirmDelete = async () => {
    if (!reviewToDelete.value) return
    
    try {
      const response = await reviewApi.deleteReview(reviewToDelete.value)
      
      if (response.code === 200) {
        // 重新加载评论
        loadReviews(currentPage.value)
        emit('delete-review', reviewToDelete.value)
        emit('refresh')
      } else {
        alert(response.message || '删除失败，请重试')
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除失败，请重试')
    } finally {
      closeModal()
    }
  }
  
  const toggleLike = async (review) => {
    // 检查是否登录
    // const token = localStorage.getItem('token')
    // if (!token) {
    //   alert('请先登录后再点赞')
    //   return
    // }
    
    try {
      const response = await reviewApi.toggleLike(review._id)
      
      if (response.code === 200) {
        // 更新本地数据
        const index = reviews.value.findIndex(r => r._id === review._id)
        if (index !== -1) {
          reviews.value[index].isLiked = response.data.liked
          reviews.value[index].likes = response.data.likes
        }
      } else {
        alert(response.message || '点赞失败，请重试')
      }
    } catch (error) {
      console.error('点赞失败:', error)
      // 模拟操作（如果API失败）
      const index = reviews.value.findIndex(r => r._id === review._id)
      if (index !== -1) {
        reviews.value[index].isLiked = !reviews.value[index].isLiked
        reviews.value[index].likes += reviews.value[index].isLiked ? 1 : -1
      }
    }
  }
  
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
  
  const handleAvatarError = (event) => {
    event.target.src = '/default-avatar.png'
  }
  defineExpose({ loadReviews }) 
  </script>
  
  <style scoped>
  .review-list {
    margin-top: 32px;
    padding: 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .review-title {
    margin: 0 0 24px 0;
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 600;
  }
  
  .review-summary {
    display: flex;
    gap: 48px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .average-rating-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 150px;
  }
  
  .average-score {
    font-size: 48px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 12px;
  }
  
  .rating-breakdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .total-count {
    color: #666;
    font-size: 14px;
  }
  
  .rating-distribution {
    flex: 1;
    min-width: 300px;
  }
  
  .distribution-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .rating-label {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 80px;
  }
  
  .rating-label span {
    min-width: 28px;
    color: #666;
    font-size: 14px;
  }
  
  .distribution-bar {
    flex: 1;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
  }
  
  .bar-fill.rating-5 { background-color: #ff9800; }
  .bar-fill.rating-4 { background-color: #ffb74d; }
  .bar-fill.rating-3 { background-color: #ffcc80; }
  .bar-fill.rating-2 { background-color: #ffe0b2; }
  .bar-fill.rating-1 { background-color: #fff3e0; }
  
  .percentage {
    width: 50px;
    text-align: right;
    color: #666;
    font-size: 14px;
  }
  
  .count {
    width: 50px;
    color: #999;
    font-size: 12px;
  }
  
  .sort-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .sort-label {
    color: #666;
    font-size: 14px;
    margin-right: 12px;
  }
  
  .sort-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .sort-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    border: 1px solid #e0e0e0;
    background: #fff;
    border-radius: 20px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .sort-btn:hover:not(:disabled) {
    border-color: #007bff;
    color: #007bff;
    transform: translateY(-1px);
  }
  
  .sort-btn.active {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
  }
  
  .sort-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .sort-icon {
    font-size: 12px;
  }
  
  /* 加载状态 */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
  }
  
  .loading-state .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-state p {
    color: #666;
    margin: 0;
  }
  
  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 0;
  }
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
  }
  
  .empty-state h3 {
    margin: 0 0 8px 0;
    color: #666;
    font-weight: 500;
  }
  
  .empty-state p {
    color: #999;
    margin: 0;
  }
  
  /* 评论列表 */
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .review-card {
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    background: #fff;
    transition: all 0.3s ease;
  }
  
  .review-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  .review-card.own-review {
    border-left: 4px solid #007bff;
    background: linear-gradient(to right, rgba(0, 123, 255, 0.02), #fff);
  }
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #f5f5f5;
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .user-name {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 16px;
  }
  
  .review-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .review-time {
    color: #999;
    font-size: 13px;
  }
  
  .review-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .action-btn:hover {
    background: #e0e0e0;
    transform: scale(1.1);
  }
  
  .review-content {
    margin-bottom: 16px;
  }
  
  .review-content p {
    margin: 0;
    line-height: 1.6;
    color: #333;
    font-size: 15px;
  }
  
  .review-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .like-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    background: #fff;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .like-btn:hover {
    border-color: #f44336;
    color: #f44336;
    transform: translateY(-1px);
  }
  
  .like-btn.liked {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  .like-icon {
    transition: all 0.3s ease;
  }
  
  /* 分页 */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    flex-wrap: wrap;
  }
  
  .page-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: #fff;
    border-radius: 6px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 44px;
    justify-content: center;
  }
  
  .page-btn:hover:not(:disabled) {
    border-color: #007bff;
    color: #007bff;
    transform: translateY(-1px);
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-btn.active {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
  }
  
  .page-numbers {
    display: flex;
    gap: 4px;
  }
  
  .page-info {
    color: #666;
    font-size: 14px;
    margin-left: 16px;
  }
  
  /* 模态框 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }
  
  .modal {
    background: white;
    border-radius: 16px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 18px;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .modal-close:hover {
    background: #f5f5f5;
    color: #666;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-body p {
    margin: 0;
    color: #666;
    line-height: 1.6;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
  }
  
  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
  }
  
  .btn-secondary {
    background: #f5f5f5;
    color: #666;
  }
  
  .btn-secondary:hover {
    background: #e0e0e0;
  }
  
  .btn-danger {
    background: #f44336;
    color: white;
  }
  
  .btn-danger:hover {
    background: #d32f2f;
    transform: translateY(-1px);
  }
  
  /* 动画 */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .review-list {
      padding: 16px;
      margin-top: 16px;
    }
    
    .review-title {
      font-size: 20px;
      margin-bottom: 20px;
    }
    
    .review-summary {
      flex-direction: column;
      gap: 24px;
    }
    
    .rating-distribution {
      min-width: 100%;
    }
    
    .sort-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .sort-options {
      width: 100%;
    }
    
    .sort-btn {
      flex: 1;
      justify-content: center;
    }
    
    .review-card {
      padding: 16px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
    }
    
    .pagination {
      flex-direction: column;
      gap: 16px;
    }
    
    .page-numbers {
      order: -1;
      width: 100%;
      justify-content: center;
    }
    
    .page-btn {
      padding: 6px 12px;
    }
  }
  /* 在 ReviewList.vue 的 style 标签末尾添加这些样式 */

.review-list-tencent {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.rating-overview {
  display: flex;
  padding: 32px;
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  border-bottom: 1px solid #e8f4ff;
}

.overview-main {
  flex: 1;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 24px;
}

.average-number {
  font-size: 64px;
  font-weight: 700;
  color: #006eff;
  line-height: 1;
}

.average-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.total-reviews {
  color: #666;
  font-size: 14px;
}

.rating-distribution-tencent {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 24px;
}

.dist-label {
  width: 40px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.dist-bar-container {
  flex: 1;
  height: 8px;
  background: #f0f7ff;
  border-radius: 4px;
  overflow: hidden;
}

.dist-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease-out;
}

.rating-bar-5 { background: linear-gradient(90deg, #ffc107, #ff9800); }
.rating-bar-4 { background: linear-gradient(90deg, #4caf50, #8bc34a); }
.rating-bar-3 { background: linear-gradient(90deg, #2196f3, #03a9f4); }
.rating-bar-2 { background: linear-gradient(90deg, #9c27b0, #e91e63); }
.rating-bar-1 { background: linear-gradient(90deg, #f44336, #ff5722); }

.dist-percentage {
  width: 40px;
  text-align: right;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
}

.dist-count {
  width: 50px;
  color: #999;
  font-size: 12px;
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.sort-options-tencent {
  display: flex;
  gap: 8px;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fbff;
  border: 1px solid #e0f0ff;
  border-radius: 20px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-option:hover:not(.disabled) {
  background: #e0f0ff;
  color: #006eff;
  transform: translateY(-1px);
}

.sort-option.active {
  background: #006eff;
  border-color: #006eff;
  color: white;
}

.sort-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-icon {
  font-size: 12px;
}

.review-stats .stats-text {
  color: #666;
  font-size: 14px;
}

/* 加载状态 */
.loading-state-tencent {
  padding: 80px 0;
  text-align: center;
}

.tencent-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border: 3px solid #f0f7ff;
  border-top-color: #006eff;
  border-radius: 50%;
  animation: tencent-spin 1s linear infinite;
}

@keyframes tencent-spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state-tencent {
  padding: 80px 0;
  text-align: center;
}

.empty-state-tencent h3 {
  margin: 20px 0 8px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.empty-state-tencent p {
  color: #999;
  margin: 0;
  font-size: 14px;
}

/* 评论卡片 */
.reviews-grid {
  padding: 24px 32px;
}

.review-card-tencent {
  background: white;
  border: 1px solid #e8f4ff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.review-card-tencent:hover {
  box-shadow: 0 8px 24px rgba(0, 110, 255, 0.08);
  transform: translateY(-2px);
}

.review-card-tencent.owner-card {
  border-left: 4px solid #006eff;
  background: linear-gradient(to right, rgba(0, 110, 255, 0.02), white);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.user-avatar-tencent {
  position: relative;
}

.user-avatar-tencent img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.owner-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #006eff;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.user-info-tencent {
  flex: 1;
}

.user-name-tencent {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
  margin-bottom: 2px;
}

.user-level {
  color: #ff9900;
  font-size: 12px;
  font-weight: 500;
}

.review-meta-tencent {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.review-time {
  color: #999;
  font-size: 12px;
}

.card-body {
  margin-bottom: 16px;
}

.review-content-tencent {
  margin: 0;
  line-height: 1.6;
  color: #333;
  font-size: 15px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-image:hover {
  transform: scale(1.05);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-like,
.action-comment {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-like:hover,
.action-comment:hover {
  background: #f8fbff;
  color: #666;
}

.action-like.liked {
  color: #ff3366;
}

.action-like.liked svg {
  fill: #ff3366;
}

.owner-actions {
  display: flex;
  gap: 12px;
}

.btn-edit,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8fbff;
  border: 1px solid #e0f0ff;
  color: #666;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #e0f0ff;
  color: #006eff;
  border-color: #006eff;
}

.btn-delete:hover {
  background: #fff0f0;
  color: #f44336;
  border-color: #ffcdd2;
}

/* 分页 */
.tencent-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
  margin-top: 32px;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e0f0ff;
  background: white;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #006eff;
  color: #006eff;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
}

.page-numbers-tencent {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #e0f0ff;
  background: white;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover:not(.ellipsis) {
  border-color: #006eff;
  color: #006eff;
}

.page-number.active {
  background: #006eff;
  border-color: #006eff;
  color: white;
}

.page-number.ellipsis {
  cursor: default;
  border: none;
  background: transparent;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
  color: #666;
  font-size: 14px;
}

.page-jump input {
  width: 60px;
  padding: 6px 12px;
  border: 1px solid #e0f0ff;
  border-radius: 6px;
  text-align: center;
}

.page-jump input:focus {
  outline: none;
  border-color: #006eff;
  box-shadow: 0 0 0 2px rgba(0, 110, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rating-overview {
    flex-direction: column;
    padding: 24px 20px;
    gap: 24px;
  }
  
  .average-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .rating-distribution-tencent {
    width: 100%;
  }
  
  .sort-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  
  .review-stats {
    width: 100%;
    text-align: center;
  }
  
  .reviews-grid {
    padding: 20px;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .review-meta-tencent {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 12px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .tencent-pagination {
    flex-wrap: wrap;
    gap: 12px;
  }
}
  </style>