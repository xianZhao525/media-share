<!-- frontend/src/views/ExploreView.vue -->
<template>
  <div class="explore-view">
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="container">
        <div class="search-wrapper">
          <div class="search-input-group">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索电影、电视剧、动漫..."
              class="search-input"
              @keyup.enter="performSearch"
            />
            <button class="search-button" @click="performSearch">
              <i class="icon-search">🔍</i>
              搜索
            </button>
          </div>
          
          <div class="search-filters">
            <div class="filter-group">
              <label class="filter-label">类型</label>
              <select v-model="filters.type" class="filter-select">
                <option value="">全部类型</option>
                <option value="movie">电影</option>
                <option value="tv">电视剧</option>
                <option value="anime">动漫</option>
                <option value="variety">综艺</option>
                <option value="documentary">纪录片</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">排序</label>
              <select v-model="filters.sortBy" class="filter-select">
                <option value="createdAt">最新发布</option>
                <option value="viewCount">最多观看</option>
                <option value="averageRating">最高评分</option>
                <option value="likeCount">最多点赞</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">评分</label>
              <select v-model="filters.minRating" class="filter-select">
                <option value="0">全部评分</option>
                <option value="8">8分以上</option>
                <option value="9">9分以上</option>
                <option value="9.5">9.5分以上</option>
              </select>
            </div>
            
            <button class="filter-toggle" @click="toggleAdvancedFilters">
              <i class="icon-filter">⚙️</i>
              高级筛选
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级筛选面板 -->
    <div v-if="showAdvancedFilters" class="advanced-filters-panel">
      <div class="container">
        <div class="advanced-filters">
          <div class="filter-section">
            <h4>年份范围</h4>
            <div class="year-range">
              <select v-model="advancedFilters.minYear" class="filter-select">
                <option value="">起始年份</option>
                <option v-for="year in yearOptions" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
              <span class="range-separator">-</span>
              <select v-model="advancedFilters.maxYear" class="filter-select">
                <option value="">结束年份</option>
                <option v-for="year in yearOptions" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="filter-section">
            <h4>标签筛选</h4>
            <div class="tags-filter">
              <input
                type="text"
                v-model="tagInput"
                placeholder="输入标签，按回车添加"
                class="tag-input"
                @keyup.enter="addTag"
              />
              <div class="selected-tags">
                <span
                  v-for="tag in advancedFilters.tags"
                  :key="tag"
                  class="selected-tag"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" class="remove-tag">×</button>
                </span>
              </div>
            </div>
          </div>
          
          <div class="filter-section">
            <h4>其他选项</h4>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="advancedFilters.hasVideo" />
                仅显示有视频的内容
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="advancedFilters.isFeatured" />
                仅显示精选内容
              </label>
            </div>
          </div>
          
          <div class="filter-actions">
            <button class="btn-secondary" @click="resetAdvancedFilters">
              重置
            </button>
            <button class="btn-primary" @click="applyAdvancedFilters">
              应用筛选
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门标签 -->
    <div class="tags-section" v-if="popularTags.length > 0">
      <div class="container">
        <h3 class="section-subtitle">热门标签</h3>
        <div class="tags-cloud">
          <button
            v-for="tag in popularTags"
            :key="tag._id"
            :class="{ active: selectedTags.includes(tag._id) }"
            @click="toggleTag(tag._id)"
            class="tag-button"
          >
            {{ tag._id }}
            <span class="tag-count">({{ tag.count }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <div class="container">
        <!-- 搜索状态 -->
        <div v-if="searchQuery && searchResults.length > 0" class="search-status">
          <h2>搜索"{{ searchQuery }}"的结果 ({{ totalItems }}项)</h2>
          <button class="clear-search" @click="clearSearch">
            <i class="icon-clear">×</i>
            清除搜索
          </button>
        </div>
        
        <!-- 分类标题 -->
        <div v-else class="section-header">
          <h2 class="section-title">
            <i class="icon-explore">🔍</i>
            {{ getCategoryTitle() }}
          </h2>
          <div class="view-options">
            <button
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              class="view-option"
              title="网格视图"
            >
              <i class="icon-grid">⬜⬜⬜</i>
            </button>
            <button
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
              class="view-option"
              title="列表视图"
            >
              <i class="icon-list">≡≡≡</i>
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="items.length === 0" class="empty-state">
          <div class="empty-illustration">
            <i class="icon-empty">🔍</i>
          </div>
          <h3>没有找到内容</h3>
          <p>尝试调整筛选条件或使用其他关键词</p>
          <button class="btn-primary" @click="resetFilters">
            <i class="icon-refresh">🔄</i>
            重置筛选
          </button>
        </div>

        <!-- 网格视图 -->
        <div v-else-if="viewMode === 'grid'" class="grid-view">
          <div
            v-for="item in items"
            :key="item._id"
            class="explore-item"
            @click="viewItemDetail(item._id)"
          >
            <div class="item-image">
              <img :src="item.cover" :alt="item.title" />
              <div class="item-badges">
                <span class="badge badge-type">{{ getTypeLabel(item.type) }}</span>
                <span 
                  v-if="item.averageRating >= 9" 
                  class="badge badge-high-rating"
                >
                  高分
                </span>
                <span 
                  v-if="item.isFeatured" 
                  class="badge badge-featured"
                >
                  精选
                </span>
              </div>
              <div class="item-overlay">
                <button class="btn-quick-play" @click.stop="playItem(item)">
                  <i class="icon-play">▶️</i>
                </button>
                <div class="item-stats-overlay">
                  <span class="stat">
                    <i class="icon-eye">👁️</i>
                    {{ formatNumber(item.viewCount) }}
                  </span>
                  <span class="stat">
                    <i class="icon-star">⭐</i>
                    {{ item.averageRating?.toFixed(1) || '0.0' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ truncateText(item.title, 22) }}</h3>
              <p class="item-description">
                {{ truncateText(item.description, 60) }}
              </p>
              <div class="item-meta">
                <span class="meta-item">
                  <i class="icon-calendar">📅</i>
                  {{ formatDate(item.createdAt) }}
                </span>
                <span class="meta-item">
                  <i class="icon-user">👤</i>
                  {{ item.user?.username || '匿名' }}
                </span>
              </div>
              <div class="item-tags">
                <span
                  v-for="tag in item.tags?.slice(0, 3)"
                  :key="tag"
                  class="tag"
                  @click.stop="filterByTag(tag)"
                >
                  {{ tag }}
                </span>
                <span v-if="item.tags?.length > 3" class="tag-more">
                  +{{ item.tags.length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <table class="items-table">
            <thead>
              <tr>
                <th>封面</th>
                <th>标题</th>
                <th>类型</th>
                <th>评分</th>
                <th>观看</th>
                <th>点赞</th>
                <th>发布日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item._id"
                @click="viewItemDetail(item._id)"
                class="table-row"
              >
                <td class="table-cover">
                  <img :src="item.cover" :alt="item.title" />
                </td>
                <td class="table-title">
                  <div class="title-wrapper">
                    <h4>{{ item.title }}</h4>
                    <p class="table-description">
                      {{ truncateText(item.description, 50) }}
                    </p>
                  </div>
                </td>
                <td class="table-type">
                  <span class="type-label">{{ getTypeLabel(item.type) }}</span>
                </td>
                <td class="table-rating">
                  <div class="rating-wrapper">
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
                </td>
                <td class="table-views">
                  {{ formatNumber(item.viewCount) }}
                </td>
                <td class="table-likes">
                  {{ formatNumber(item.likeCount || 0) }}
                </td>
                <td class="table-date">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="table-actions">
                  <button
                    class="action-btn"
                    @click.stop="playItem(item)"
                    title="播放"
                  >
                    <i class="icon-play">▶️</i>
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="collectItem(item)"
                    title="收藏"
                  >
                    <i class="icon-collect">❤️</i>
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="shareItem(item)"
                    title="分享"
                  >
                    <i class="icon-share">↗️</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <div class="pagination-info">
            显示第 {{ startItem }} - {{ endItem }} 项，共 {{ totalItems }} 项
          </div>
          <div class="pagination-controls">
            <button
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              class="pagination-btn prev"
            >
              <i class="icon-arrow">◀</i>
              上一页
            </button>
            
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="{
                  'page-btn': true,
                  'active': page === currentPage,
                  'dots': typeof page !== 'number'
                }"
                @click="typeof page === 'number' ? goToPage(page) : null"
                :disabled="typeof page !== 'number'"
              >
                {{ typeof page === 'number' ? page : '...' }}
              </button>
            </div>
            
            <button
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
              class="pagination-btn next"
            >
              下一页
              <i class="icon-arrow">▶</i>
            </button>
          </div>
          
          <div class="page-size-selector">
            <label>每页显示：</label>
            <select v-model="pageSize" @change="handlePageSizeChange">
              <option value="12">12项</option>
              <option value="24">24项</option>
              <option value="48">48项</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import itemApi from '@/api/items'

const route = useRoute()
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const items = ref([])
const searchResults = ref([])  // 存储搜索结果，与items分离
const popularTags = ref([])
const loading = ref(false)

// 筛选和分页
const filters = ref({
  type: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  minRating: 0
})

const advancedFilters = ref({
  minYear: '',
  maxYear: '',
  tags: [],
  hasVideo: false,
  isFeatured: false
})

const showAdvancedFilters = ref(false)
const selectedTags = ref([])
const viewMode = ref('grid')

// 分页
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = ref(24)

// 交互状态
const tagInput = ref('')

// 计算属性
const startItem = computed(() => {
  return (currentPage.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * pageSize.value
  return Math.min(end, totalItems.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
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
  
  return pages
})

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 30 }, (_, i) => currentYear - i)
})

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

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
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

const getCategoryTitle = () => {
  if (filters.value.type) {
    return `${getTypeLabel(filters.value.type)}专区`
  }
  if (filters.value.minRating > 0) {
    return `${filters.value.minRating}分以上内容`
  }
  return '探索所有内容'
}

const getStarClass = (rating, star) => {
  if (rating >= star) return 'star-full'
  if (rating >= star - 0.5) return 'star-half'
  return 'star-empty'
}

// 标签管理
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !advancedFilters.value.tags.includes(tag)) {
    advancedFilters.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag) => {
  advancedFilters.value.tags = advancedFilters.value.tags.filter(t => t !== tag)
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  loadItems()
}

const filterByTag = (tag) => {
  if (!advancedFilters.value.tags.includes(tag)) {
    advancedFilters.value.tags.push(tag)
    applyAdvancedFilters()
  }
}

// ===================================================================
// 关键修复：搜索功能
// ===================================================================
// 执行搜索（当用户点击搜索按钮或按回车时调用）
const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    // 如果搜索框为空，则清除搜索状态
    clearSearch()
    return
  }
  
  loading.value = true
  currentPage.value = 1
  searchResults.value = []
  
  try {
    await loadSearchResults()
  } catch (error) {
    console.error('搜索失败:', error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 清除搜索，回到普通浏览模式
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  currentPage.value = 1
  loadItems()
}
// ===================================================================

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const applyAdvancedFilters = () => {
  showAdvancedFilters.value = false
  currentPage.value = 1
  loadItems()
}

const resetAdvancedFilters = () => {
  advancedFilters.value = {
    minYear: '',
    maxYear: '',
    tags: [],
    hasVideo: false,
    isFeatured: false
  }
}

const resetFilters = () => {
  filters.value = {
    type: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minRating: 0
  }
  resetAdvancedFilters()
  selectedTags.value = []
  currentPage.value = 1
  loadItems()
}

// ===================================================================
// 关键修复：分页逻辑需要区分搜索模式和普通浏览模式
// ===================================================================
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  
  // 根据当前模式加载数据
  if (searchQuery.value.trim()) {
    loadSearchResults()  // 搜索模式
  } else {
    loadItems()  // 普通浏览模式
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  if (searchQuery.value.trim()) {
    loadSearchResults()
  } else {
    loadItems()
  }
}
// ===================================================================

const viewItemDetail = (itemId) => {
  router.push(`/item/${itemId}`)
}

const playItem = (item) => {
  router.push(`/player/${item._id}`)
}

const collectItem = async (item) => {
  try {
    console.log('收藏:', item.title)
    // 这里可以添加收藏API调用
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const shareItem = (item) => {
  console.log('分享:', item.title)
  // 这里可以添加分享逻辑
}

// ===================================================================
// 数据加载函数
// ===================================================================
const loadItems = async () => {
  try {
    loading.value = true
    
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      type: filters.value.type,
      minRating: filters.value.minRating
    }
    
    // 处理标签筛选
    if (selectedTags.value.length > 0) {
      params.tag = selectedTags.value[0]
    }
    
    // 处理高级筛选
    if (advancedFilters.value.tags.length > 0) {
      params.tag = advancedFilters.value.tags[0]
    }
    
    const res = await itemApi.getItems(params)
    
    if (res.code === 200) {
      items.value = res.data.items || []
      totalItems.value = res.data.pagination?.total || items.value.length
      totalPages.value = res.data.pagination?.totalPages || 1
    }
    
  } catch (error) {
    console.error('加载内容失败:', error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 加载搜索结果（核心修复：使用独立的searchAPI）
const loadSearchResults = async () => {
  try {
    loading.value = true
    
    const res = await itemApi.searchItems(searchQuery.value, {
      page: currentPage.value,
      limit: pageSize.value,
      type: filters.value.type || undefined,
      tag: advancedFilters.value.tags[0] || selectedTags.value[0] || undefined
    })
    
    if (res.code === 200) {
      // 注意：搜索结果的数据结构可能不同，需要适配
      const searchData = res.data.results || res.data.items || []
      items.value = searchData
      totalItems.value = res.data.total || res.data.pagination?.total || 0
      totalPages.value = res.data.pages || res.data.pagination?.totalPages || 1
    }
    
  } catch (error) {
    console.error('搜索失败:', error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}
// ===================================================================

const loadPopularTags = async () => {
  try {
    const res = await itemApi.getStats()
    if (res.code === 200 && res.data.tagStats) {
      popularTags.value = res.data.tagStats
        .filter(tag => tag._id && tag.count > 0)
        .slice(0, 20)
    }
  } catch (error) {
    console.error('加载热门标签失败:', error)
  }
}

// ===================================================================
// 初始化逻辑
// ===================================================================
const initFromRoute = () => {
  const { type, tag, sort, rating, q } = route.query
  
  if (type) filters.value.type = type
  if (tag) selectedTags.value = [tag]
  if (sort) filters.value.sortBy = sort
  if (rating) filters.value.minRating = parseFloat(rating)
  if (q) searchQuery.value = q  // 支持URL中的搜索参数
  
  // 如果有搜索参数，执行搜索；否则加载普通列表
  if (q && q.trim()) {
    performSearch()
  } else {
    loadItems()
  }
}

// 监听路由变化
watch(() => route.query, (newQuery) => {
  initFromRoute()
})

// 监听筛选条件变化（修复：搜索状态下也应用筛选）
watch([
  () => filters.value.type, 
  () => filters.value.sortBy, 
  () => filters.value.minRating
], () => {
  currentPage.value = 1
  if (searchQuery.value.trim()) {
    loadSearchResults()  // 如果处于搜索状态，重新搜索
  } else {
    loadItems()
  }
})

// 生命周期钩子
onMounted(() => {
  initFromRoute()
  loadPopularTags()
})
</script>

<style scoped>
.explore-view {
  background: #f8f9fa;
  min-height: 100vh;
}

/* 搜索区域 */
.search-section {
  background: white;
  padding: 30px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.search-input-group {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 30px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0072ff;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1);
}

.search-button {
  padding: 15px 30px;
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 114, 255, 0.3);
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #0072ff;
}

.filter-toggle {
  padding: 10px 20px;
  border: 1px solid #0072ff;
  background: white;
  color: #0072ff;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.filter-toggle:hover {
  background: #0072ff;
  color: white;
}

/* 高级筛选面板 */
.advanced-filters-panel {
  background: white;
  border-top: 1px solid #eee;
  padding: 30px 0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.advanced-filters {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.filter-section h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-separator {
  color: #999;
}

.tags-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.tag-input:focus {
  outline: none;
  border-color: #0072ff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #f0f0f0;
  color: #333;
  border-radius: 20px;
  font-size: 13px;
}

.remove-tag {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-tag:hover {
  background: #ddd;
  color: #666;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: 15px;
  align-self: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 热门标签 */
.tags-section {
  background: white;
  padding: 30px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 30px;
}

.section-subtitle {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.tag-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag-button:hover {
  border-color: #0072ff;
  color: #0072ff;
  transform: translateY(-2px);
}

.tag-button.active {
  background: #0072ff;
  color: white;
  border-color: #0072ff;
}

.tag-count {
  font-size: 12px;
  color: #999;
}

.tag-button.active .tag-count {
  color: rgba(255, 255, 255, 0.8);
}

/* 内容区域 */
.content-section {
  padding: 40px 0;
}

.search-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-status h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.clear-search {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.clear-search:hover {
  background: #f8f9fa;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* 视图选项 */
.view-options {
  display: flex;
  gap: 10px;
}

.view-option {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.view-option:hover {
  border-color: #0072ff;
  color: #0072ff;
}

.view-option.active {
  background: #0072ff;
  border-color: #0072ff;
  color: white;
}

/* 网格视图 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.explore-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.explore-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.item-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.explore-item:hover .item-image img {
  transform: scale(1.05);
}

.item-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.badge-type {
  background: rgba(0, 0, 0, 0.7);
}

.badge-high-rating {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #333;
}

.badge-featured {
  background: linear-gradient(135deg, #ff6b6b, #ff2d2d);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 15px;
}

.explore-item:hover .item-overlay {
  opacity: 1;
}

.btn-quick-play {
  align-self: flex-end;
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

.btn-quick-play:hover {
  background: white;
  transform: scale(1.1);
}

.item-stats-overlay {
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 13px;
}

.item-stats-overlay .stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-info {
  padding: 20px;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.3;
}

.item-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 15px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-tags .tag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-tags .tag:hover {
  background: #0072ff;
  color: white;
}

.tag-more {
  color: #999;
  font-size: 12px;
  padding: 4px 8px;
}

/* 列表视图 */
.list-view {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #eee;
  font-size: 14px;
}

.items-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.table-row:hover {
  background: #f8f9fa;
  cursor: pointer;
}

.table-cover {
  width: 80px;
  padding: 10px 15px;
}

.table-cover img {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.table-title {
  min-width: 250px;
}

.title-wrapper h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.table-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.table-type {
  width: 80px;
}

.type-label {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f0f0;
  color: #666;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.table-rating {
  width: 100px;
}

.rating-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rating-wrapper .stars {
  display: flex;
  gap: 2px;
}

.rating-wrapper .stars i {
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

.table-views,
.table-likes {
  width: 80px;
  text-align: center;
  font-weight: 500;
  color: #666;
}

.table-date {
  width: 100px;
  color: #999;
  font-size: 13px;
}

.table-actions {
  width: 120px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 50%;
  margin: 0 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #0072ff;
  color: #0072ff;
  transform: translateY(-2px);
}

/* 分页 */
.pagination {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pagination-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #0072ff;
  color: #0072ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(.dots):not(:disabled) {
  border-color: #0072ff;
  color: #0072ff;
}

.page-btn.active {
  background: #0072ff;
  color: white;
  border-color: #0072ff;
}

.page-btn.dots {
  background: none;
  border: none;
  cursor: default;
  width: 20px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.page-size-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-illustration {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin-bottom: 25px;
  max-width: 400px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .items-table th,
  .items-table td {
    padding: 10px;
  }
  
  .table-cover {
    display: none;
  }
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .search-button {
    justify-content: center;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .item-image {
    height: 160px;
  }
  
  .items-table {
    display: block;
    overflow-x: auto;
  }
  
  .table-likes,
  .table-views,
  .table-date {
    display: none;
  }
}

@media (max-width: 576px) {
  .grid-view {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .item-image {
    height: 140px;
  }
  
  .item-info {
    padding: 15px;
  }
  
  .item-title {
    font-size: 16px;
  }
  
  .item-description {
    display: none;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-size-selector {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }
}
</style>