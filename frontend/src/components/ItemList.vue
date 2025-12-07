<!-- frontend/src/components/ItemList.vue -->
<template>
  <div class="item-list">
    <h2>媒体内容列表</h2>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <!-- 内容列表 -->
    <div v-else>
      <div class="stats">
        共 {{ items.length }} 个内容
      </div>
      
      <div class="items-grid">
        <div v-for="item in items" :key="item._id" class="item-card">
          <div class="item-cover" v-if="item.cover">
            <img :src="item.cover" :alt="item.title" />
          </div>
          <div class="item-content">
            <h3>{{ item.title }}</h3>
            <p class="item-description">{{ item.description }}</p>
            
            <div class="item-meta">
              <span class="item-type">{{ item.type === 'movie' ? '电影' : '电视剧' }}</span>
              <span class="item-year">{{ item.releaseYear }}</span>
              <span class="item-views">{{ formatNumber(item.viewCount) }} 播放</span>
            </div>
            
            <div class="item-tags">
              <span v-for="tag in item.tags?.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            
            <div class="item-actions">
              <button @click="viewItem(item._id)">查看详情</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="pagination && pagination.pages > 1" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="pagination.page === 1"
        >
          上一页
        </button>
        
        <span>第 {{ pagination.page }} 页 / 共 {{ pagination.pages }} 页</span>
        
        <button 
          @click="nextPage" 
          :disabled="pagination.page === pagination.pages"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { itemAPI } from '@/services/api';

// 响应式数据
const items = ref([]);
const loading = ref(true);
const error = ref(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1
});

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

// 获取数据
const fetchItems = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await itemAPI.getItems({
      page: pagination.value.page,
      limit: pagination.value.limit
    });
    
    if (response.code === 200) {
      items.value = response.data.items;
      pagination.value = response.data.pagination;
    } else {
      error.value = response.message || '获取数据失败';
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试';
    console.error('Error fetching items:', err);
  } finally {
    loading.value = false;
  }
};

// 查看详情
const viewItem = (id) => {
  console.log('View item:', id);
  // 这里可以跳转到详情页
  // router.push(`/items/${id}`);
};

// 分页控制
const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    fetchItems();
  }
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    fetchItems();
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchItems();
});

// 监听页码变化
watch(() => pagination.value.page, fetchItems);
</script>

<style scoped>
.item-list {
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #ff4444;
}

.stats {
  margin-bottom: 20px;
  color: #666;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-cover img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.item-content {
  padding: 16px;
}

.item-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.item-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #888;
}

.item-type, .item-year, .item-views {
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.item-tags {
  margin-bottom: 12px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 6px;
  margin-bottom: 6px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
}

.item-actions button {
  width: 100%;
  padding: 8px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.item-actions button:hover {
  background: #1565c0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: #e0e0e0;
}
</style>