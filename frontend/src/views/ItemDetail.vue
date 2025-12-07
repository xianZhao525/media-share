<template>
  <div class="item-detail-view">
    <!-- 返回按钮 -->
    <div class="back-container">
      <button class="btn-back" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
    </div>

    <div class="container">
      <!-- 加载状态 -->
      <div v-if="itemStore.isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载内容...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="itemStore.error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p class="error-message">{{ itemStore.error }}</p>
        <button @click="retryLoading" class="btn-retry">重试</button>
        <button @click="goBack" class="btn-back">返回列表</button>
      </div>

      <!-- 内容详情 -->
      <div v-else-if="itemStore.currentItem" class="item-detail">
        <!-- 头部信息 -->
        <div class="item-header">
          <div class="item-cover-container">
            <img 
              :src="itemStore.currentItem.cover || getDefaultCover(itemStore.currentItem.type)" 
              :alt="itemStore.currentItem.title"
              @error="handleImageError"
              class="item-cover"
            />
            <div class="cover-overlay">
              <span class="item-type">{{ getItemTypeIcon(itemStore.currentItem.type) }} {{ getItemTypeLabel(itemStore.currentItem.type) }}</span>
            </div>
          </div>

          <div class="item-header-info">
            <h1 class="item-title">{{ itemStore.currentItem.title }}</h1>
            
            <!-- 评分 -->
            <div class="item-rating-section">
              <div class="rating-display">
                <div class="rating-stars">
                  <span 
                    v-for="i in 5" 
                    :key="i"
                    :class="['star', { filled: i <= Math.round(itemStore.currentItem.averageRating) }]"
                  >
                    ★
                  </span>
                </div>
                <div class="rating-value">
                  <span class="value">{{ itemStore.currentItem.averageRating.toFixed(1) }}</span>
                  <span class="total">/5.0</span>
                </div>
                <div class="rating-count">(暂无评分)</div>
              </div>
              <button 
                class="btn-rate"
                @click="showRatingModal"
                v-if="authStore.isAuthenticated"
              >
                我要评分
              </button>
            </div>

            <!-- 基本信息 -->
            <div class="item-basic-info">
              <div class="info-item">
                <span class="info-label">创建者:</span>
                <span class="info-value">{{ userIdDisplay }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ formatDate.standard(itemStore.currentItem.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间:</span>
                <span class="info-value">{{ formatDate.standard(itemStore.currentItem.updatedAt || itemStore.currentItem.createdAt) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="item-actions">
              <button 
                v-if="isOwner"
                class="btn-action btn-edit"
                @click="editItem"
              >
                <span class="action-icon">✏️</span>
                编辑
              </button>
              <button 
                v-if="isOwner"
                class="btn-action btn-delete"
                @click="confirmDelete"
              >
                <span class="action-icon">🗑️</span>
                删除
              </button>
              <button class="btn-action btn-share" @click="shareItem">
                <span class="action-icon">🔗</span>
                分享
              </button>
              <button 
                class="btn-action btn-favorite"
                @click="toggleFavorite"
              >
                <span class="action-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
                {{ isFavorite ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 详情内容 -->
        <div class="item-content">
          <div class="content-main">
            <!-- 描述 -->
            <section class="section">
              <h2 class="section-title">内容描述</h2>
              <div class="section-content">
                <p class="item-description">{{ itemStore.currentItem.description }}</p>
              </div>
            </section>

            <!-- 详细信息 -->
            <section class="section" v-if="hasDetails">
              <h2 class="section-title">详细信息</h2>
              <div class="details-grid">
                <template v-if="itemStore.currentItem.type === 'book'">
                  <div class="detail-item" v-if="itemStore.currentItem.details.author">
                    <span class="detail-label">作者:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.author }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.publisher">
                    <span class="detail-label">出版社:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.publisher }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.pages">
                    <span class="detail-label">页数:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.pages }} 页</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.isbn">
                    <span class="detail-label">ISBN:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.isbn }}</span>
                  </div>
                </template>
                
                <template v-else-if="itemStore.currentItem.type === 'movie'">
                  <div class="detail-item" v-if="itemStore.currentItem.details.director">
                    <span class="detail-label">导演:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.director }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.actors && itemStore.currentItem.details.actors.length">
                    <span class="detail-label">演员:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.actors.join(', ') }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.duration">
                    <span class="detail-label">时长:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.duration }} 分钟</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.releaseDate">
                    <span class="detail-label">上映日期:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.releaseDate }}</span>
                  </div>
                </template>
                
                <template v-else-if="itemStore.currentItem.type === 'music'">
                  <div class="detail-item" v-if="itemStore.currentItem.details.artist">
                    <span class="detail-label">艺术家:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.artist }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.album">
                    <span class="detail-label">专辑:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.album }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.duration">
                    <span class="detail-label">时长:</span>
                    <span class="detail-value">{{ formatDuration(itemStore.currentItem.details.duration) }}</span>
                  </div>
                  <div class="detail-item" v-if="itemStore.currentItem.details.genre">
                    <span class="detail-label">流派:</span>
                    <span class="detail-value">{{ itemStore.currentItem.details.genre }}</span>
                  </div>
                </template>
              </div>
            </section>

            <!-- 标签 -->
            <section class="section" v-if="itemStore.currentItem.tags && itemStore.currentItem.tags.length">
              <h2 class="section-title">标签</h2>
              <div class="tags-container">
                <span 
                  v-for="tag in itemStore.currentItem.tags" 
                  :key="tag"
                  class="tag"
                  :style="{ backgroundColor: getTagColor(tag) }"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </section>

            <!-- 评论区（角色三负责） -->
            <section class="section">
              <h2 class="section-title">评论</h2>
              <div class="comments-placeholder">
                <p class="placeholder-text">评论区（由角色三负责开发）</p>
                <div class="placeholder-actions">
                  <button class="btn-comment" disabled>
                    <span class="comment-icon">💬</span>
                    发表评论
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- 侧边栏 -->
          <div class="content-sidebar">
            <!-- 相似推荐 -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">相似内容</h3>
              <div class="similar-items">
                <div 
                  v-for="item in similarItems" 
                  :key="item._id"
                  class="similar-item"
                  @click="viewItemDetail(item._id)"
                >
                  <div class="similar-cover">
                    <img 
                      :src="item.cover || getDefaultCover(item.type)" 
                      :alt="item.title"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="similar-info">
                    <h4 class="similar-title">{{ item.title }}</h4>
                    <div class="similar-meta">
                      <span class="meta-rating">⭐ {{ item.averageRating.toFixed(1) }}</span>
                      <span class="meta-type">{{ getItemTypeLabel(item.type) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 统计信息 -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">统计信息</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ itemStore.currentItem.viewCount || 0 }}</div>
                  <div class="stat-label">浏览</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ itemStore.currentItem.commentCount || 0 }}</div>
                  <div class="stat-label">评论</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ itemStore.currentItem.favoriteCount || 0 }}</div>
                  <div class="stat-label">收藏</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ itemStore.currentItem.shareCount || 0 }}</div>
                  <div class="stat-label">分享</div>
                </div>
              </div>
            </section>

            <!-- 分享链接 -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">分享链接</h3>
              <div class="share-links">
                <button class="share-btn" @click="copyLink">
                  <span class="share-icon">🔗</span>
                  复制链接
                </button>
                <button class="share-btn" @click="shareToTwitter">
                  <span class="share-icon">🐦</span>
                  Twitter
                </button>
                <button class="share-btn" @click="shareToWeibo">
                  <span class="share-icon">📱</span>
                  微博
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-message">确定要删除这个内容吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn-confirm" @click="deleteItem">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 评分模态框 -->
    <div v-if="showRatingModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">评分</h3>
        <div class="rating-input">
          <div class="rating-stars-select">
            <span 
              v-for="i in 5" 
              :key="i"
              :class="['star-select', { filled: i <= ratingValue }]"
              @mouseenter="ratingHover = i"
              @mouseleave="ratingHover = 0"
              @click="ratingValue = i"
            >
              ★
            </span>
          </div>
          <div class="rating-text">
            {{ ratingText }}
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelRating">取消</button>
          <button class="btn-confirm" @click="submitRating">提交评分</button>
        </div>
      </div>
    </div>

    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">分享</h3>
        <div class="share-input">
          <input 
            type="text" 
            :value="shareLink"
            readonly
            ref="shareInput"
            class="share-link-input"
          />
          <button class="btn-copy" @click="copyShareLink">
            {{ copySuccess ? '已复制' : '复制' }}
          </button>
        </div>
        <div class="share-qr">
          <div class="qr-placeholder">二维码区域</div>
          <p class="qr-hint">扫描二维码访问</p>
        </div>
        <div class="modal-actions">
          <button class="btn-close" @click="showShareModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useAuthStore } from '@/stores/auth'
import { 
  formatDate, 
  getItemTypeLabel, 
  getItemTypeIcon, 
  getDefaultCover, 
  getTagColor,
  copyToClipboard
} from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const authStore = useAuthStore()

// 响应式数据
const isFavorite = ref(false)
const showDeleteConfirm = ref(false)
const showRatingModal = ref(false)
const showShareModal = ref(false)
const ratingValue = ref(0)
const ratingHover = ref(0)
const copySuccess = ref(false)
const shareInput = ref(null)

// 计算属性
const userIdDisplay = computed(() => {
  const userId = itemStore.currentItem?.userId
  if (!userId) return '匿名用户'
  return `用户${userId.toString().slice(-6)}`
})

const isOwner = computed(() => {
  if (!authStore.isAuthenticated || !itemStore.currentItem) return false
  return authStore.user?._id === itemStore.currentItem.userId?.toString()
})

const hasDetails = computed(() => {
  if (!itemStore.currentItem?.details) return false
  const details = itemStore.currentItem.details
  return Object.keys(details).some(key => details[key])
})

const similarItems = computed(() => {
  // 获取相似内容（这里简化处理，使用当前store中的部分内容）
  return itemStore.items
    .filter(item => item._id !== itemStore.currentItem?._id)
    .filter(item => item.type === itemStore.currentItem?.type)
    .slice(0, 3)
})

const ratingText = computed(() => {
  const value = ratingHover.value || ratingValue.value
  const texts = ['很差', '较差', '一般', '推荐', '力荐']
  return texts[value - 1] || '请选择评分'
})

const shareLink = computed(() => {
  return `${window.location.origin}/item/${route.params.id}`
})

// 方法
const fetchItemDetail = async () => {
  const itemId = route.params.id
  if (!itemId) {
    router.push('/')
    return
  }
  
  await itemStore.fetchItemById(itemId)
  if (!itemStore.currentItem) {
    router.push('/not-found')
  }
}

const retryLoading = () => {
  itemStore.clearError()
  fetchItemDetail()
}

const goBack = () => {
  router.go(-1)
}

const handleImageError = (event) => {
  if (itemStore.currentItem) {
    event.target.src = getDefaultCover(itemStore.currentItem.type)
  }
}

const editItem = () => {
  if (isOwner.value && itemStore.currentItem) {
    router.push({ name: 'item-edit', params: { id: itemStore.currentItem._id } })
  }
}

const confirmDelete = () => {
  if (isOwner.value) {
    showDeleteConfirm.value = true
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteItem = async () => {
  try {
    const itemId = itemStore.currentItem._id
    await itemStore.deleteItem(itemId)
    showDeleteConfirm.value = false
    
    // 显示删除成功消息
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const shareItem = () => {
  showShareModal.value = true
}

const copyLink = async () => {
  const success = await copyToClipboard(shareLink.value)
  if (success) {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const copyShareLink = () => {
  if (shareInput.value) {
    shareInput.value.select()
    document.execCommand('copy')
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const shareToTwitter = () => {
  const text = encodeURIComponent(`推荐: ${itemStore.currentItem.title}`)
  const url = encodeURIComponent(shareLink.value)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

const shareToWeibo = () => {
  const text = encodeURIComponent(`${itemStore.currentItem.title} ${shareLink.value}`)
  window.open(`http://service.weibo.com/share/share.php?title=${text}`, '_blank')
}

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  
  isFavorite.value = !isFavorite.value
  // 这里应该调用API更新收藏状态
}

const showRatingModal = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  ratingValue.value = Math.round(itemStore.currentItem.averageRating) || 0;
  showRatingModal.value = true;
};

const cancelRating = () => {
  showRatingModal.value = false
  ratingValue.value = 0
  ratingHover.value = 0
}

const submitRating = () => {
  // 这里应该调用API提交评分
  console.log('提交评分:', ratingValue.value)
  showRatingModal.value = false
  ratingValue.value = 0
  ratingHover.value = 0
}

const searchByTag = (tag) => {
  router.push({ path: '/search', query: { q: tag } })
}

const formatDuration = (seconds) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  fetchItemDetail()
})

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    itemStore.clearCurrentItem()
    fetchItemDetail()
  }
})
</script>

<style scoped>
.item-detail-view {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-bottom: var(--space-2xl);
}

.back-container {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-md) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.back-icon {
  font-size: 1.2em;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: var(--space-2xl);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-lg);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: var(--space-2xl);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  margin-top: var(--space-xl);
}

.error-icon {
  font-size: 4rem;
  color: var(--danger-color);
  margin-bottom: var(--space-lg);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-right: var(--space-md);
}

.btn-retry:hover {
  background: var(--primary-dark);
}

/* 头部信息 */
.item-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-top: var(--space-xl);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .item-header {
    grid-template-columns: 1fr;
  }
}

.item-cover-container {
  position: relative;
}

.item-cover {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: var(--space-lg);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.item-type {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.item-header-info {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  line-height: 1.3;
}

/* 评分区域 */
.item-rating-section {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.5rem;
  color: var(--border-color);
}

.star.filled {
  color: var(--warning-color);
}

.rating-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.rating-value .total {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  font-weight: normal;
}

.rating-count {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.btn-rate {
  padding: 0.75rem 1.5rem;
  background: var(--warning-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-rate:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

/* 基本信息 */
.item-basic-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 600;
}

/* 操作按钮 */
.item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: auto;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-delete {
  background: var(--danger-color);
  color: white;
}

.btn-delete:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-share {
  background: var(--info-color);
  color: white;
}

.btn-share:hover {
  background: #138496;
  transform: translateY(-2px);
}

.btn-favorite {
  background: var(--success-color);
  color: white;
}

.btn-favorite:hover {
  background: #218838;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.2em;
}

/* 内容区域 */
.item-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-xl);
  margin-top: var(--space-xl);
}

@media (max-width: 1024px) {
  .item-content {
    grid-template-columns: 1fr;
  }
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--border-light);
}

.section-content {
  line-height: 1.8;
  color: var(--text-secondary);
}

.item-description {
  white-space: pre-line;
  font-size: var(--font-size-base);
  line-height: 1.6;
}

/* 详细信息网格 */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 600;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
  user-select: none;
}

.tag:hover {
  opacity: 0.8;
}

/* 评论区占位符 */
.comments-placeholder {
  text-align: center;
  padding: var(--space-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px dashed var(--border-color);
}

.placeholder-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.placeholder-actions {
  display: flex;
  justify-content: center;
}

.btn-comment {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.6;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.comment-icon {
  font-size: 1.2em;
}

/* 侧边栏 */
.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.sidebar-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--border-light);
}

/* 相似内容 */
.similar-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.similar-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.similar-item:hover {
  background: var(--bg-secondary);
}

.similar-cover {
  width: 60px;
  height: 80px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.similar-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-info {
  flex: 1;
  min-width: 0;
}

.similar-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.similar-meta {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.stat-item {
  text-align: center;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}

/* 分享链接 */
.share-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.share-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.share-btn:hover {
  background: var(--primary-light);
  color: var(--primary-color);
}

.share-icon {
  font-size: 1.2em;
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
  padding: var(--space-md);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.modal-message {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-cancel:hover {
  background: var(--secondary-dark);
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-confirm:hover {
  background: #c82333;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-close:hover {
  background: var(--primary-dark);
}

/* 评分输入 */
.rating-input {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.rating-stars-select {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.star-select {
  font-size: 2.5rem;
  color: var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.star-select.filled {
  color: var(--warning-color);
}

.star-select:hover {
  transform: scale(1.2);
}

.rating-text {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-weight: 600;
  min-height: 2em;
}

/* 分享输入 */
.share-input {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.share-link-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-copy {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.btn-copy:hover {
  background: var(--primary-dark);
}

.share-qr {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  margin: 0 auto var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border: 2px dashed var(--border-color);
}

.qr-hint {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .item-header {
    padding: var(--space-lg);
  }
  
  .item-title {
    font-size: var(--font-size-2xl);
  }
  
  .item-rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .item-actions {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    padding: var(--space-lg);
    margin: var(--space-md);
  }
}
</style>