<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand">
        🎬 MediaShare
      </router-link>

      <!-- 搜索框（文档要求） -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索影视、书籍、音乐..."
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button @click="handleSearch" class="search-button">
          🔍
        </button>
      </div>

      <!-- 用户菜单 -->
      <div class="user-menu">
        <router-link v-if="!userStore.isAuthenticated" to="/login" class="auth-link">
          登录
        </router-link>
        <router-link v-if="!userStore.isAuthenticated" to="/register" class="auth-link">
          注册
        </router-link>
        
        <template v-if="userStore.isAuthenticated">
          <router-link to="/create" class="create-link">
            ➕ 创建
          </router-link>
          <div class="user-dropdown">
            <img :src="userStore.user.avatar || '/default-avatar.png'" class="user-avatar" />
            <span class="username">{{ userStore.user.username }}</span>
            <div class="dropdown-menu">
              <router-link to="/profile">个人中心</router-link>
              <router-link to="/activities">我的动态</router-link>
              <button @click="handleLogout">退出登录</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    });
    searchQuery.value = '';
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};
</script>

<style scoped>
.navbar {
  background-color: var(--primary-color, #007bff);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: var(--container-width, 1200px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.search-box {
  flex: 1;
  max-width: 500px;
  display: flex;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 25px 0 0 25px;
  font-size: 1rem;
  outline: none;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: white;
  border: none;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
  font-size: 1.2rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-link, .create-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.auth-link:hover, .create-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.username {
  color: white;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  overflow: hidden;
  z-index: 1000;
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a, .dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  text-decoration: none;
}

.dropdown-menu a:hover, .dropdown-menu button:hover {
  background: #f5f5f5;
}
</style>