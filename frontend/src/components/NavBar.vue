<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- 左侧logo/品牌 -->
      <router-link to="/" class="nav-brand">
        🎬 影视分享
      </router-link>
      
      <!-- 中间搜索框（你的核心功能） -->
      <div class="nav-search">
        <input 
          v-model="searchKeyword"
          type="text"
          placeholder="搜索电影、剧集、用户..."
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button @click="handleSearch" class="search-btn">
          🔍
        </button>
      </div>
      
      <!-- 右侧导航链接 -->
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/explore" class="nav-link">探索</router-link>
        <router-link to="/search" class="nav-link">搜索</router-link>
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="nav-link">注册</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" class="nav-link">个人中心</router-link>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </template>
      </div>
    </div>
    
    <!-- 热门标签展示 -->
    <div v-if="popularTags.length > 0" class="tags-bar">
      <span class="tags-label">热门标签：</span>
      <span 
        v-for="tag in popularTags" 
        :key="tag.name"
        @click="searchByTag(tag.name)"
        class="tag-item"
      >
        {{ tag.name }} ({{ tag.count }})
      </span>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const searchKeyword = ref('')
const popularTags = ref([])

// 获取热门标签（你的API）
const fetchPopularTags = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/tags/popular')
    if (response.data.code === 200) {
      popularTags.value = response.data.data
    }
  } catch (error) {
    console.error('获取热门标签失败:', error)
  }
}

// 搜索功能
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchKeyword.value }
    })
  }
}

// 通过标签搜索
const searchByTag = (tag) => {
  router.push({
    path: '/search',
    query: { tag }
  })
}

// 退出登录（模拟）
const handleLogout = () => {
  console.log('退出登录')
  // 实际开发中调用退出API
}

// 假设的认证状态
const isAuthenticated = ref(false)

onMounted(() => {
  fetchPopularTags()
})
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-search {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  display: flex;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #007bff;
  border-radius: 25px 0 0 25px;
  outline: none;
}

.search-btn {
  padding: 0.5rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #007bff;
}

.logout-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.tags-bar {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-top: 1px solid #eee;
  overflow-x: auto;
  white-space: nowrap;
}

.tags-label {
  color: #666;
  margin-right: 1rem;
}

.tag-item {
  display: inline-block;
  margin: 0 0.5rem;
  padding: 0.2rem 0.5rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
}

.tag-item:hover {
  background: #dee2e6;
}
</style>