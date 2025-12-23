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
          {{ itemDetails.description || '这是一个详细的内容描述，用于展示腾讯风格的页面设计。这里可以放置更长的描述内容，包括背景介绍、特点说明等。' }}
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
        @refresh="handleReviewRefresh"
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
          <div 
            v-for="item in relatedItems" 
            :key="item.id" 
            class="related-item"
            @click="viewItemDetail(item.id)"
          >
            <div class="related-item-image" v-if="item.cover">
              <img :src="item.cover" :alt="item.title" @error="handleImageError" />
            </div>
            <div class="related-item-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <div class="related-item-meta">
                <RatingStars :value="item.rating" size="small" :show-value="false" />
                <span>{{ item.comments }} 评论</span>
                <span>{{ item.typeLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReviewForm from '../components/ReviewForm.vue'
import ReviewList from '../components/ReviewList.vue'
import RatingStars from '../components/RatingStars.vue'
import { itemApi } from '../utils/api.js'

const route = useRoute()
const router = useRouter()

const editingReview = ref(null)
const showReviewForm = ref(false)
const itemDetails = ref({})
const averageRating = ref(4.5)
const totalReviews = ref(4)
const reviewListRef = ref(null)

const itemId = computed(() => {
  return route.params.id || '6948f9d9e7115f08b62d8f67'
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

// 完善的相关内容数据
const relatedItems = ref([
  { 
    id: 'related1', 
    title: '流浪地球2', 
    description: '中国科幻电影巨作，太阳即将毁灭，人类在地球表面建造出巨大的推进器...', 
    rating: 4.8, 
    comments: 245,
    typeLabel: '电影',
    cover: '/api/proxy/image?url=https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2886266376.jpg&type=douban'
  },
  { 
    id: 'related2', 
    title: '满江红', 
    description: '南宋绍兴年间，岳飞死后四年，秦桧率兵与金国会谈...', 
    rating: 4.3, 
    comments: 189,
    typeLabel: '电影',
    cover: '/api/proxy/image?url=https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2886266377.jpg&type=douban'
  },
  { 
    id: 'related3', 
    title: '狂飙', 
    description: '京海市一线刑警安欣，在与黑恶势力的斗争中...', 
    rating: 4.9, 
    comments: 892,
    typeLabel: '电视剧',
    cover: '/api/proxy/image?url=https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2886266378.jpg&type=douban'
  }
])

onMounted(() => {
  console.log('🚀 ItemDetail mounted, itemId:', itemId.value);
  
  // 自动设置token（跳过登录）
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'mock-token-123');
  }
  
  // 设置用户信息头
  if (isAuthenticated.value) {
    // 添加用户信息到headers（供ReviewList使用）
    window.USER_ID = 'user123';
    window.USERNAME = '测试用户';
  }
  
  loadItemDetails();
  
  // 延迟检查ReviewList是否加载
  setTimeout(() => {
    if (reviewListRef.value) {
      console.log('✅ ReviewList ref 可用');
      // 立即刷新评论数据
      reviewListRef.value.loadReviews(1);
    } else {
      console.log('❌ ReviewList ref 不可用');
    }
  }, 500);
})

const loadItemDetails = async () => {
  try {
    console.log('📡 加载内容详情...');
    const response = await itemApi.getItem(itemId.value)
    
    if (response.code === 200) {
      console.log('✅ 获取到内容详情:', response.data);
      itemDetails.value = response.data
      
      // 优先使用API返回的数据
      if (response.data.reviewCount !== undefined) {
        totalReviews.value = response.data.reviewCount;
        console.log('📊 从API设置评论数:', totalReviews.value);
      }
      if (response.data.averageRating !== undefined) {
        averageRating.value = response.data.averageRating;
        console.log('📊 从API设置平均分:', averageRating.value);
      }
    } else {
      // 使用模拟数据
      console.log('📦 使用模拟数据');
      itemDetails.value = {
        id: itemId.value,
        title: '流浪地球',
        type: 'movie',
        description: '中国科幻电影巨作，太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。',
        averageRating: 4.5,
        reviewCount: 4,
        createdAt: new Date().toISOString()
      }
      
      // 如果ReviewList已更新数据，使用其数据，否则使用默认值
      if (reviewListRef.value && reviewListRef.value.getReviewStats) {
        const stats = reviewListRef.value.getReviewStats();
        if (stats) {
          totalReviews.value = stats.totalReviews || 4;
          averageRating.value = stats.averageRating || 4.5;
          console.log('📊 从ReviewList获取统计:', stats);
        }
      }
    }
  } catch (error) {
    console.error('❌ 加载内容详情失败:', error)
    // 使用模拟数据
    itemDetails.value = {
      id: itemId.value,
      title: '流浪地球',
      type: 'movie',
      description: '中国科幻电影巨作，太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。',
      averageRating: 4.5,
      reviewCount: 4,
      createdAt: new Date().toISOString()
    }
    
    // 使用ReviewList的数据
    if (reviewListRef.value && reviewListRef.value.getReviewStats) {
      const stats = reviewListRef.value.getReviewStats();
      if (stats) {
        totalReviews.value = stats.totalReviews || 4;
        averageRating.value = stats.averageRating || 4.5;
      }
    }
  }
}

const handleReviewSubmit = async (reviewData) => {
  try {
    console.log('📝 提交评论:', reviewData);
    editingReview.value = null;
    showReviewForm.value = false;

    // 显示成功提示
    showMessage('评论发表成功！', 'success');
    
    // 等待评论列表组件刷新
    if (reviewListRef.value) {
      console.log('🔄 刷新评论列表...');
      // 直接调用loadReviews来刷新数据
      await reviewListRef.value.loadReviews(1);
      
      // 添加延迟确保数据加载完成
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 重新加载详情数据
      await loadItemDetails();
    }
    
  } catch (err) {
    console.error('❌ 提交失败', err);
    showMessage('评论发表失败，请重试', 'error');
  }
}

const handleReviewCancel = () => {
  editingReview.value = null;
  showReviewForm.value = false;
}

const handleEditReview = (review) => {
  editingReview.value = {
    _id: review._id,
    rating: review.rating,
    content: review.content
  };
  showReviewForm.value = true;
}

const handleReviewDeleted = () => {
  console.log('🗑️ 评论被删除，重新加载数据...');
  
  // 延迟刷新数据
  setTimeout(() => {
    if (reviewListRef.value) {
      reviewListRef.value.loadReviews(1);
    }
    loadItemDetails();
  }, 500);
}

// 处理评论列表刷新事件
const handleReviewRefresh = (stats) => {
  console.log('📥 收到评论刷新事件:', stats);
  
  if (stats) {
    totalReviews.value = stats.totalReviews || 0;
    averageRating.value = stats.averageRating || 0;
    
    console.log('✅ 更新统计数据:', {
      totalReviews: totalReviews.value,
      averageRating: averageRating.value
    });
    
    // 更新itemDetails中的统计数据
    if (itemDetails.value) {
      itemDetails.value.reviewCount = totalReviews.value;
      itemDetails.value.averageRating = averageRating.value;
    }
  }
  
  // 重新加载详情数据
  setTimeout(() => {
    loadItemDetails();
  }, 100);
}

// 添加watch来监控数据变化
watch(totalReviews, (newVal) => {
  console.log('📊 totalReviews变化:', newVal);
});

watch(averageRating, (newVal) => {
  console.log('📊 averageRating变化:', newVal);
});

const formatDate = (dateString) => {
  if (!dateString) return '刚刚';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

const toggleLogin = () => {
  if (isAuthenticated.value) {
    localStorage.removeItem('token');
    showReviewForm.value = false;
  } else {
    localStorage.setItem('token', 'mock-token-123');
  }
  window.location.reload();
}

const viewItemDetail = (itemId) => {
  router.push(`/item/${itemId}`);
}

// 显示消息提示
const showMessage = (message, type = 'info') => {
  const messageEl = document.createElement('div');
  messageEl.className = `message-${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  `;
  document.body.appendChild(messageEl);
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageEl.remove(), 300);
  }, 3000);
}

// 处理图片加载错误
const handleImageError = (event) => {
  const img = event.target;
  // 使用腾讯风格的占位图
  img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><rect width="60" height="80" fill="%23f0f7ff"/><text x="30" y="45" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle">图片加载中</text></svg>';
  img.onerror = null; // 防止循环错误
}
</script>

<style scoped>
/* 新增相关内容的样式 */
.related-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  background: #f8fbff;
  border-radius: 8px;
  transform: translateX(4px);
}

.related-item-image {
  flex: 0 0 60px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background: #f0f7ff;
}

.related-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-item:hover .related-item-image img {
  transform: scale(1.05);
}

.related-item-content {
  flex: 1;
  min-width: 0;
}

.related-item-content h4 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-item-content p {
  margin: 0 0 8px;
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
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

/* 原有样式保持不变 */
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

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
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
  
  /* 移动端相关内容样式 */
  .related-item {
    flex-direction: row;
  }
}

/* 消息提示动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>