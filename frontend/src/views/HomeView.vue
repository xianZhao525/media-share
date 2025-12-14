<!-- frontend/src/views/HomeView.vue -->
<template>
  <div class="home-view">
    <!-- 顶部轮播图 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-carousel" v-if="featuredItems.length > 0">
          <div 
            v-for="(item, index) in featuredItems" 
            :key="item._id"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
            @click="viewItemDetail(item._id)"
          >
            <img :src="item.cover" :alt="item.title" class="slide-image" />
            <div class="slide-overlay">
              <div class="slide-content">
                <div class="slide-badge">热门推荐</div>
                <h1 class="slide-title">{{ item.title }}</h1>
                <p class="slide-description">
                  {{ truncateText(item.description, 120) }}
                </p>
                <div class="slide-meta">
                  <span class="meta-item">
                    <i class="icon-star">⭐</i>
                    {{ item.averageRating?.toFixed(1) || '0.0' }}
                  </span>
                  <span class="meta-item">
                    <i class="icon-eye">👁️</i>
                    {{ formatNumber(item.viewCount) }}
                  </span>
                  <span class="meta-item">
                    {{ getTypeLabel(item.type) }}
                  </span>
                  <span class="meta-item">
                    {{ item.releaseYear || '未知年份' }}
                  </span>
                </div>
                <div class="slide-actions">
                  <button class="btn-primary" @click.stop="playItem(item)">
                    <i class="icon-play">▶️</i>
                    立即播放
                  </button>
                  <button class="btn-secondary" @click.stop="collectItem(item)">
                    <i class="icon-collect">❤️</i>
                    收藏
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 轮播导航 -->
          <button class="carousel-nav prev" @click.stop="prevSlide">
            <i class="icon-arrow">◀</i>
          </button>
          <button class="carousel-nav next" @click.stop="nextSlide">
            <i class="icon-arrow">▶</i>
          </button>
          
          <!-- 轮播指示器 -->
          <div class="carousel-indicators">
            <button
              v-for="(_, index) in featuredItems"
              :key="index"
              :class="{ active: currentSlide === index }"
              @click.stop="goToSlide(index)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- 分类导航 -->
    <section class="category-section">
      <div class="container">
        <div class="category-nav">
          <button
            v-for="category in categories"
            :key="category.value"
            :class="{ active: activeCategory === category.value }"
            @click="selectCategory(category.value)"
            class="category-item"
          >
            <i :class="category.icon">{{ category.iconText }}</i>
            <span>{{ category.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 热门推荐 -->
    <section class="recommend-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon-hot">🔥</i>
            热门推荐
          </h2>
          <router-link to="/explore?sort=hot" class="view-more">
            查看更多 <i class="icon-arrow">→</i>
          </router-link>
        </div>
        
        <div class="items-grid" v-if="hotItems.length > 0">
          <div
            v-for="(item, index) in hotItems"
            :key="item._id"
            class="item-card"
            @click="viewItemDetail(item._id)"
          >
            <div class="item-rank">{{ index + 1 }}</div>
            <div class="item-image">
              <img :src="item.cover" :alt="item.title" />
              <div class="item-overlay">
                <button class="btn-play" @click.stop="playItem(item)">
                  <i class="icon-play">▶️</i>
                </button>
              </div>
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ truncateText(item.title, 20) }}</h3>
              <div class="item-stats">
                <span class="stat">
                  <i class="icon-star">⭐</i>
                  {{ item.averageRating?.toFixed(1) || '0.0' }}
                </span>
                <span class="stat">
                  <i class="icon-eye">👁️</i>
                  {{ formatNumber(item.viewCount) }}
                </span>
              </div>
              <div class="item-tags">
                <span 
                  v-for="tag in item.tags?.slice(0, 2)" 
                  :key="tag"
                  class="tag"
                  @click.stop="searchByTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="icon-empty">📺</i>
          <p>暂无热门内容</p>
        </div>
      </div>
    </section>

    <!-- 最新内容 -->
    <section class="latest-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon-new">🆕</i>
            最新内容
          </h2>
          <div class="filter-tabs">
            <button
              v-for="tab in latestTabs"
              :key="tab.value"
              :class="{ active: latestTab === tab.value }"
              @click="changeLatestTab(tab.value)"
              class="tab-btn"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <div class="latest-grid" v-if="latestItems.length > 0">
          <div
            v-for="item in latestItems"
            :key="item._id"
            class="latest-item"
            @click="viewItemDetail(item._id)"
          >
            <div class="latest-image">
              <img :src="item.cover" :alt="item.title" />
              <div class="latest-badge">新</div>
              <div class="latest-overlay">
                <button class="btn-play-overlay" @click.stop="playItem(item)">
                  <i class="icon-play">▶️</i>
                </button>
              </div>
            </div>
            <div class="latest-info">
              <h4 class="latest-title">{{ truncateText(item.title, 25) }}</h4>
              <p class="latest-description">
                {{ truncateText(item.description, 40) }}
              </p>
              <div class="latest-meta">
                <span class="meta-time">
                  {{ formatTime(item.createdAt) }}
                </span>
                <span class="meta-type">
                  {{ getTypeLabel(item.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="icon-empty">📽️</i>
          <p>暂无最新内容</p>
        </div>
      </div>
    </section>

    <!-- 分类内容 -->
    <section 
      v-for="category in displayedCategories" 
      :key="category.value"
      class="category-section"
    >
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <i :class="category.icon">{{ category.iconText }}</i>
            {{ category.label }}精选
          </h2>
          <router-link 
            :to="`/explore?type=${category.value}`" 
            class="view-more"
          >
            更多{{ category.label }} <i class="icon-arrow">→</i>
          </router-link>
        </div>
        
        <div class="category-grid">
          <div
            v-for="item in categoryItems[category.value] || []"
            :key="item._id"
            class="category-item-card"
            @click="viewItemDetail(item._id)"
          >
            <div class="category-item-image">
              <img :src="item.cover" :alt="item.title" />
              <div class="item-type">{{ getTypeLabel(item.type) }}</div>
            </div>
            <div class="category-item-info">
              <h4 class="item-title">{{ truncateText(item.title, 18) }}</h4>
              <div class="item-rating">
                <div class="stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    :class="getStarClass(item.averageRating || 0, star)"
                  >★</i>
                </div>
                <span class="rating-score">
                  {{ (item.averageRating || 0).toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import itemApi from '@/api/items'

const router = useRouter()

// 响应式数据
const featuredItems = ref([])
const hotItems = ref([])
const latestItems = ref([])
const categoryItems = ref({})
const loading = ref(true)

// 轮播图状态
const currentSlide = ref(0)
const carouselInterval = ref(null)

// 分类和标签
const activeCategory = ref('all')
const latestTab = ref('all')

const categories = [
  { value: 'all', label: '全部', icon: 'icon-all', iconText: '📺' },
  { value: 'movie', label: '电影', icon: 'icon-movie', iconText: '🎬' },
  { value: 'tv', label: '电视剧', icon: 'icon-tv', iconText: '📺' },
  { value: 'anime', label: '动漫', icon: 'icon-anime', iconText: '🎌' },
  { value: 'variety', label: '综艺', icon: 'icon-variety', iconText: '🎤' }
]

const displayedCategories = categories.slice(1, 5) // 显示前4个分类

const latestTabs = [
  { value: 'all', label: '全部' },
  { value: 'movie', label: '电影' },
  { value: 'tv', label: '剧集' },
  { value: 'anime', label: '动漫' }
]

// 工具函数
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  if (diff < 30) return `${Math.floor(diff / 7)}周前`
  return `${Math.floor(diff / 30)}月前`
}

const getTypeLabel = (type) => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    variety: '综艺',
    documentary: '纪录片'
  }
  return typeMap[type] || type
}

const getStarClass = (rating, star) => {
  if (rating >= star) return 'star-full'
  if (rating >= star - 0.5) return 'star-half'
  return 'star-empty'
}

// 轮播图控制
const startCarousel = () => {
  stopCarousel()
  carouselInterval.value = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % featuredItems.value.length
  }, 5000)
}

const stopCarousel = () => {
  if (carouselInterval.value) {
    clearInterval(carouselInterval.value)
  }
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 
    ? featuredItems.value.length - 1 
    : currentSlide.value - 1
  startCarousel()
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % featuredItems.value.length
  startCarousel()
}

const goToSlide = (index) => {
  currentSlide.value = index
  startCarousel()
}

// 交互函数
const selectCategory = (category) => {
  activeCategory.value = category
  // 这里可以根据分类筛选内容
}

const changeLatestTab = (tab) => {
  latestTab.value = tab
  loadLatestItems(tab)
}

const viewItemDetail = (itemId) => {
  router.push(`/item/${itemId}`)
}

const playItem = (item) => {
  router.push(`/player/${item._id}`)
}

const collectItem = async (item) => {
  try {
    // 这里调用收藏API
    console.log('收藏:', item.title)
    // 可以添加收藏逻辑
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const searchByTag = (tag) => {
  router.push(`/explore?tag=${encodeURIComponent(tag)}`)
}

// 数据加载函数
const loadHomeData = async () => {
  try {
    loading.value = true
    
    // 并行加载所有数据
    const [hotRes, latestRes, statsRes] = await Promise.all([
      itemApi.getHotItems({ limit: 6 }),
      itemApi.getLatestItems({ limit: 8 }),
      itemApi.getStats()
    ])

    // 处理热门内容
    if (hotRes.code === 200) {
      hotItems.value = hotRes.data.items || hotRes.data
    }

    // 处理最新内容
    if (latestRes.code === 200) {
      latestItems.value = latestRes.data.items || latestRes.data
      // 将前4个作为特色内容
      featuredItems.value = latestItems.value.slice(0, 4)
      startCarousel()
    }

    // 处理统计数据并加载分类内容
    if (statsRes.code === 200) {
      // 根据统计加载每个分类的内容
      const categoryPromises = displayedCategories.map(async (category) => {
        try {
          const res = await itemApi.getItems({ 
            type: category.value, 
            limit: 6 
          })
          if (res.code === 200) {
            categoryItems.value[category.value] = res.data.items
          }
        } catch (error) {
          console.error(`加载${category.label}内容失败:`, error)
        }
      })
      
      await Promise.all(categoryPromises)
    }
    
  } catch (error) {
    console.error('加载首页数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadLatestItems = async (type) => {
  try {
    const params = { limit: 8 }
    if (type !== 'all') {
      params.type = type
    }
    
    const res = await itemApi.getLatestItems(params)
    if (res.code === 200) {
      latestItems.value = res.data.items || res.data
    }
  } catch (error) {
    console.error('加载最新内容失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadHomeData()
  
  // 鼠标悬停时停止轮播
  const carousel = document.querySelector('.hero-carousel')
  if (carousel) {
    carousel.addEventListener('mouseenter', stopCarousel)
    carousel.addEventListener('mouseleave', startCarousel)
  }
})

// 清理
onMounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.home-view {
  background: #f8f9fa;
}

/* 轮播图样式 */
.hero-section {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.hero-container {
  height: 100%;
}

.hero-carousel {
  position: relative;
  height: 100%;
  width: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  cursor: pointer;
}

.carousel-slide.active {
  opacity: 1;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  align-items: center;
}

.slide-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  color: white;
  width: 100%;
}

.slide-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #ff2d2d);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 20px;
}

.slide-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-description {
  font-size: 18px;
  margin-bottom: 25px;
  max-width: 600px;
  line-height: 1.5;
  opacity: 0.9;
}

.slide-meta {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  font-size: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.9;
}

.slide-actions {
  display: flex;
  gap: 15px;
}

.btn-primary, .btn-secondary {
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 114, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.3s ease;
}

.carousel-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.carousel-nav.prev {
  left: 20px;
}

.carousel-nav.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-indicators button.active {
  background: #0072ff;
  transform: scale(1.2);
}

/* 分类导航 */
.category-section:not(.hero-section) {
  padding: 40px 0;
  background: white;
  margin-bottom: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.category-nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  border: none;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 14px;
  min-width: 80px;
}

.category-item i {
  font-size: 28px;
  margin-bottom: 5px;
}

.category-item:hover {
  background: #f8f9fa;
  color: #0072ff;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-item.active {
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 114, 255, 0.3);
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-more {
  color: #0072ff;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: gap 0.3s ease;
}

.view-more:hover {
  gap: 8px;
  text-decoration: underline;
}

/* 网格布局 */
.items-grid, .latest-grid, .category-grid {
  display: grid;
  gap: 20px;
}

.items-grid {
  grid-template-columns: repeat(3, 1fr);
}

.latest-grid {
  grid-template-columns: repeat(4, 1fr);
}

.category-grid {
  grid-template-columns: repeat(6, 1fr);
}

/* 卡片样式 */
.item-card, .latest-item, .category-item-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.item-card:hover, .latest-item:hover, .category-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.item-card {
  display: flex;
  gap: 15px;
  padding: 15px;
}

.item-rank {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #ff6b6b, #ff2d2d);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  z-index: 2;
}

.item-image, .latest-image, .category-item-image {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.item-image {
  flex: 0 0 120px;
  height: 120px;
}

.latest-image {
  height: 180px;
}

.category-item-image {
  height: 160px;
}

.item-image img, .latest-image img, .category-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.item-card:hover .item-image img,
.latest-item:hover .latest-image img,
.category-item-card:hover .category-item-image img {
  transform: scale(1.05);
}

.item-overlay, .latest-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-card:hover .item-overlay,
.latest-item:hover .latest-overlay {
  opacity: 1;
}

.btn-play, .btn-play-overlay {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #0072ff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-play:hover, .btn-play-overlay:hover {
  background: white;
  transform: scale(1.1);
}

.latest-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #0072ff;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.item-type {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

/* 信息区域 */
.item-info, .latest-info, .category-item-info {
  padding: 15px;
}

.item-info {
  flex: 1;
}

.item-title, .latest-title, .category-item-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.3;
}

.item-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: #0072ff;
  color: white;
}

.latest-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.latest-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  font-size: 14px;
}

.star-full {
  color: #ffa500;
}

.star-half {
  color: #ffa500;
}

.star-empty {
  color: #ddd;
}

.rating-score {
  color: #ffa500;
  font-weight: 600;
  font-size: 14px;
}

/* 标签筛选 */
.filter-tabs {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  border-color: #0072ff;
  color: #0072ff;
}

.tab-btn.active {
  background: #0072ff;
  color: white;
  border-color: #0072ff;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0072ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .latest-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .slide-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 400px;
  }
  
  .slide-title {
    font-size: 28px;
  }
  
  .slide-description {
    font-size: 16px;
  }
  
  .category-nav {
    gap: 15px;
    overflow-x: auto;
    padding: 10px 0;
    justify-content: flex-start;
  }
  
  .items-grid,
  .latest-grid,
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .hero-section {
    height: 350px;
  }
  
  .slide-content {
    padding: 0 20px;
  }
  
  .slide-title {
    font-size: 24px;
  }
  
  .slide-description {
    font-size: 14px;
  }
  
  .slide-meta {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .slide-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .items-grid,
  .latest-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>