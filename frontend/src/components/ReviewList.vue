<template>
    <div class="review-list">
      <!-- 评分统计头部 -->
      <div class="review-header">
        <h2 class="review-title">评论 · {{ totalReviews }}</h2>
        
        <div v-if="totalReviews > 0" class="review-summary">
          <!-- 平均评分 -->
          <div class="average-rating-section">
            <div class="average-score">{{ averageRating.toFixed(1) }}</div>
            <div class="rating-breakdown">
              <RatingStars
                :value="averageRating"
                size="large"
                :show-value="false"
                :show-count="false"
                :readonly="true"
              />
              <span class="total-count">{{ totalReviews }} 条评论</span>
            </div>
          </div>
          
          <!-- 评分分布 -->
          <div v-if="ratingDistribution.length > 0" class="rating-distribution">
            <div
              v-for="(dist, index) in ratingDistribution"
              :key="index"
              class="distribution-row"
            >
              <div class="rating-label">
                <span>{{ 5 - index }}星</span>
                <RatingStars
                  :value="5 - index"
                  size="small"
                  :show-value="false"
                  :show-count="false"
                  :readonly="true"
                  :show-half-star="false"
                />
              </div>
              
              <div class="distribution-bar">
                <div
                  class="bar-fill"
                  :style="{ width: `${dist.percentage}%` }"
                  :class="`rating-${5 - index}`"
                ></div>
              </div>
              
              <div class="percentage">{{ dist.percentage }}%</div>
              <div class="count">({{ dist.count }})</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排序选项 -->
      <div v-if="reviews.length > 0" class="sort-section">
        <div class="sort-label">排序：</div>
        <div class="sort-options">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-btn"
            :class="{ 'active': sortBy === option.value }"
            @click="handleSort(option.value)"
            :disabled="loading"
          >
            {{ option.label }}
            <span v-if="option.icon" class="sort-icon">{{ option.icon }}</span>
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="reviews-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>正在加载评论...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="reviews.length === 0" class="empty-state">
          <div class="empty-icon">💭</div>
          <h3>暂时还没有评论</h3>
          <p>成为第一个分享想法的人吧！</p>
        </div>

        <!-- 评论列表 -->
        <div v-else class="reviews-list">
          <div
            v-for="review in reviews"
            :key="review._id"
            class="review-card"
            :class="{ 'own-review': review.isOwner }"
          >
            <!-- 评论头部 -->
            <div class="review-header">
              <!-- 用户信息 -->
              <div class="user-info">
                <img
                  :src="review.user?.avatar || '/default-avatar.png'"
                  :alt="review.user?.username"
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <div class="user-details">
                  <div class="user-name">{{ review.user?.username || '匿名用户' }}</div>
                  <div class="review-meta">
                    <RatingStars
                      :value="review.rating"
                      size="small"
                      :show-value="false"
                      :show-count="false"
                      :readonly="true"
                      :show-half-star="false"
                    />
                    <span class="review-time">{{ formatTime(review.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div v-if="review.isOwner" class="review-actions">
                <button
                  @click="handleEdit(review)"
                  class="action-btn edit-btn"
                  title="编辑评论"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#666"/>
                  </svg>
                </button>
                <button
                  @click="handleDelete(review._id)"
                  class="action-btn delete-btn"
                  title="删除评论"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#666"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 评论内容 -->
            <div class="review-content">
              <p>{{ review.content }}</p>
            </div>

            <!-- 评论底部 -->
            <div class="review-footer">
              <button
                @click="toggleLike(review)"
                class="like-btn"
                :class="{ 'liked': review.isLiked }"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="like-icon"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    :fill="review.isLiked ? '#f44336' : 'none'"
                    :stroke="review.isLiked ? '#f44336' : '#666'"
                    stroke-width="1.5"
                  />
                </svg>
                <span class="like-count">{{ review.likes || 0 }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1 || loading"
            class="page-btn prev-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="#666"/>
            </svg>
            上一页
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{
                'page-btn': true,
                'page-number': true,
                'active': page === currentPage
              }"
              :disabled="loading || page === '...'"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages || loading"
            class="page-btn next-btn"
          >
            下一页
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="#666"/>
            </svg>
          </button>
          
          <div class="page-info">
            第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
          </div>
        </div>
      </div>

      <!-- 删除确认模态框 -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>确认删除</h3>
            <button @click="closeModal" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>确定要删除这条评论吗？此操作不可恢复。</p>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary">取消</button>
            <button @click="confirmDelete" class="btn btn-danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
    import { ref, computed, onMounted } from 'vue'
    import RatingStars from './RatingStars.vue'
    
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
    
    // 模拟 auth store
    const authStore = {
      isAuthenticated: true,  // 设为已登录，方便测试
      token: 'mock-token-123'
    }
    
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
    
    // 生命周期
    onMounted(() => {
      loadReviews()
    })
    
    // 方法
    const loadReviews = async (page = 1) => {
      loading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟数据
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
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
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
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
          },
          {
            _id: 'review3',
            user: {
              _id: 'user3',
              username: '王五',
              avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
            },
            rating: 3,
            content: '一般般，没有想象中的好。',
            likes: 3,
            isLiked: false,
            isOwner: false,
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2天前
          },
          {
            _id: 'review4',
            user: {
              _id: 'user4',
              username: '赵六',
              avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
            },
            rating: 5,
            content: '非常出色的内容，细节处理得很好！',
            likes: 15,
            isLiked: true,
            isOwner: false,
            createdAt: new Date(Date.now() - 259200000).toISOString() // 3天前
          },
          {
            _id: 'review5',
            user: {
              _id: 'user5',
              username: '孙七',
              avatar: 'https://randomuser.me/api/portraits/men/89.jpg'
            },
            rating: 2,
            content: '有些失望，质量不如宣传的那么好。',
            likes: 1,
            isLiked: false,
            isOwner: false,
            createdAt: new Date(Date.now() - 345600000).toISOString() // 4天前
          }
        ]
        
        // 模拟分页
        const startIndex = (page - 1) * pageSize
        const paginatedReviews = mockReviews.slice(startIndex, startIndex + pageSize)
        
        reviews.value = paginatedReviews
        totalReviews.value = mockReviews.length
        totalPages.value = Math.ceil(mockReviews.length / pageSize)
        
        // 模拟评分分布
        ratingDistribution.value = [
          { rating: 5, count: 2, percentage: 40 },
          { rating: 4, count: 1, percentage: 20 },
          { rating: 3, count: 1, percentage: 20 },
          { rating: 2, count: 1, percentage: 20 },
          { rating: 1, count: 0, percentage: 0 }
        ]
        
        currentPage.value = page
      } catch (error) {
        console.error('加载评论失败:', error)
      } finally {
        loading.value = false
      }
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
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟删除评论
        const index = reviews.value.findIndex(r => r._id === reviewToDelete.value)
        if (index !== -1) {
          const deletedReview = reviews.value[index]
          reviews.value.splice(index, 1)
          totalReviews.value--
          totalPages.value = Math.ceil(totalReviews.value / pageSize)
          
          if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value
          }
          
          // 更新评分分布（模拟）
          if (deletedReview.rating === 5) {
            ratingDistribution.value[0].count--
            ratingDistribution.value[0].percentage = Math.round((ratingDistribution.value[0].count / totalReviews.value) * 100)
          } else if (deletedReview.rating === 4) {
            ratingDistribution.value[1].count--
            ratingDistribution.value[1].percentage = Math.round((ratingDistribution.value[1].count / totalReviews.value) * 100)
          }
          
          emit('delete-review', reviewToDelete.value)
          emit('refresh')
        }
      } catch (error) {
        console.error('删除评论失败:', error)
        alert('删除失败，请重试')
      } finally {
        closeModal()
      }
    }
    
    const toggleLike = async (review) => {
      if (!authStore.isAuthenticated) {
        alert('请先登录后再点赞')
        return
      }
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const index = reviews.value.findIndex(r => r._id === review._id)
        if (index !== -1) {
          reviews.value[index].isLiked = !reviews.value[index].isLiked
          reviews.value[index].likes += reviews.value[index].isLiked ? 1 : -1
        }
      } catch (error) {
        console.error('点赞失败:', error)
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
  </style>