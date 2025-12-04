<template>
  <div class="search-results">
    <!-- 搜索头部 -->
    <div class="search-header">
      <h1 v-if="searchQuery">搜索 "{{ searchQuery }}"</h1>
      <h1 v-else>全部内容</h1>
      <p class="result-count">{{ total }} 个结果</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filters">
      <div class="filter-group">
        <label>类型:</label>
        <button
          v-for="type in contentTypes"
          :key="type.value"
          :class="['type-btn', { active: selectedType === type.value }]"
          @click="toggleType(type.value)"
        >
          {{ type.icon }} {{ type.label }}
        </button>
      </div>

      <div class="filter-group">
        <label>排序:</label>
        <select v-model="sortBy" @change="applyFilters" class="sort-select">
          <option value="relevance">相关性</option>
          <option value="newest">最新</option>
          <option value="rating">评分最高</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在搜索...</p>
    </div>

    <!-- 无结果 -->
    <div v-else-if="results.length === 0" class="no-results">
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <h3>没有找到相关结果</h3>
        <p>尝试其他关键词或筛选条件</p>
      </div>
    </div>

    <!-- 结果网格 -->
    <div v-else class="results-grid">
      <div
        v-for="item in results"
        :key="item._id"
        class="result-card"
        @click="viewItem(item._id)"
      >
        <div class="card-image">
          <img :src="item.cover || '/default-cover.jpg'" :alt="item.title" />
          <span class="type-badge">{{ getTypeIcon(item.type) }}</span>
          <div v-if="item.averageRating" class="rating">
            ⭐ {{ item.averageRating.toFixed(1) }}
          </div>
        </div>
        
        <div class="card-content">
          <h3 class="title">{{ item.title }}</h3>
          <p class="description">{{ truncateText(item.description, 100) }}</p>
          
          <div class="tags">
            <span
              v-for="tag in item.tags?.slice(0, 3)"
              :key="tag"
              class="tag"
              @click.stop="searchByTag(tag)"
            >
              #{{ tag }}
            </span>
          </div>
          
          <div class="meta">
            <div class="author">
              <img :src="item.author?.avatar || '/default-avatar.png'" class="avatar" />
              <span>{{ item.author?.username || '未知用户' }}</span>
            </div>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        class="page-btn"
      >
        上一页
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-number', { active: page === currentPage }]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchAPI } from '@/api/search';

const route = useRoute();
const router = useRouter();

// 响应式数据
const searchQuery = ref('');
const selectedType = ref('');
const sortBy = ref('relevance');
const results = ref([]);
const total = ref(0);
const currentPage = ref(1);
const limit = ref(12);
const loading = ref(false);

// 内容类型
const contentTypes = [
  { value: 'movie', label: '电影', icon: '🎬' },
  { value: 'book', label: '书籍', icon: '📚' },
  { value: 'music', label: '音乐', icon: '🎵' }
];

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const visiblePages = computed(() => {
  const pages = [];
  const range = 2;
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// 监听路由变化
watch(() => route.query, (query) => {
  loadFromQuery(query);
  performSearch();
}, { immediate: true });

// 从路由加载参数
const loadFromQuery = (query) => {
  searchQuery.value = query.q || '';
  selectedType.value = query.type || '';
  sortBy.value = query.sort || 'relevance';
  currentPage.value = parseInt(query.page) || 1;
};

// 执行搜索
const performSearch = async () => {
  loading.value = true;
  
  try {
    const params = {
      q: searchQuery.value,
      type: selectedType.value,
      page: currentPage.value,
      limit: limit.value
    };
    
    const response = await searchAPI.search(params);
    
    if (response.code === 200) {
      results.value = response.data.results;
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('搜索失败:', error);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

// 切换类型筛选
const toggleType = (type) => {
  selectedType.value = selectedType.value === type ? '' : type;
  currentPage.value = 1;
  updateURL();
};

// 应用筛选
const applyFilters = () => {
  currentPage.value = 1;
  updateURL();
};

// 更新URL
const updateURL = () => {
  const query = {};
  
  if (searchQuery.value) query.q = searchQuery.value;
  if (selectedType.value) query.type = selectedType.value;
  if (sortBy.value !== 'relevance') query.sort = sortBy.value;
  if (currentPage.value > 1) query.page = currentPage.value;
  
  router.push({ path: '/search', query });
};

// 分页导航
const goToPage = (page) => {
  currentPage.value = page;
  updateURL();
};

// 查看详情
const viewItem = (id) => {
  router.push(`/items/${id}`);
};

// 按标签搜索
const searchByTag = (tag) => {
  router.push({
    path: '/search',
    query: { tag }
  });
};

// 工具函数
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getTypeIcon = (type) => {
  const icons = { movie: '🎬', book: '📚', music: '🎵' };
  return icons[type] || '📄';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.search-results {
  max-width: var(--container-width, 1200px);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h1 {
  margin: 0;
  color: #333;
}

.result-count {
  color: #666;
  margin-top: 0.5rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: bold;
  color: #555;
}

.type-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  background: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

.loading, .no-results {
  text-align: center;
  padding: 4rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state .empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.result-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
}

.rating {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
}

.card-content {
  padding: 1.5rem;
}

.title {
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
}

.tag:hover {
  background: #dee2e6;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #f8f9fa;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-number.active {
  background: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
}

.page-number:hover:not(.active) {
  background: #f8f9fa;
}
</style>