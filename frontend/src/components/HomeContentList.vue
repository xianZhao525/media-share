<!-- frontend/src/components/HomeContentList.vue -->
<template>
  <div class="content-list">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="items.length === 0" class="empty">
      暂无内容
    </div>

    <div v-else class="items-grid">
      <div 
        v-for="item in items" 
        :key="item._id"
        class="item-card"
        @click="$emit('item-click', item._id)"
      >
        <div class="item-cover">
          <img :src="item.cover" :alt="item.title" />
          <div class="item-type">{{ getTypeLabel(item.type) }}</div>
        </div>
        <div class="item-info">
          <h3 class="item-title">{{ item.title }}</h3>
          <p class="item-desc">{{ item.description }}</p>
          <div class="item-meta">
            <span class="rating">
              <i class="star">⭐</i> {{ item.averageRating.toFixed(1) }}
            </span>
            <span class="views">👁️ {{ item.viewCount }}</span>
          </div>
          <div class="item-tags">
            <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        上一页
      </button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button 
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalPages: {
    type: Number,
    default: 1
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

defineEmits(['item-click', 'page-change'])

const getTypeLabel = (type) => {
  const typeMap = {
    movie: '电影',
    series: '剧集',
    music: '音乐',
    book: '书籍'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
.content-list {
  width: 100%;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.item-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.item-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-type {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.item-info {
  padding: 16px;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.item-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #888;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
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
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
</style>