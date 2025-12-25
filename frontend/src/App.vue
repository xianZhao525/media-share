<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">影视探索</router-link>
      </div>
      <ul class="navbar-links">
        <li>
          <router-link to="/" class="nav-link">首页</router-link>
        </li>
        <li>
          <router-link to="/explore" class="nav-link">探索</router-link>
        </li>
        <li>
          <router-link to="/create" class="nav-link">创建内容</router-link>
        </li>
      </ul>
    </nav>

    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';


onMounted(() => {
  // 可以在这里添加一些初始化逻辑
  console.log('App mounted');
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #333;
  color: white;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-links {
  list-style: none;
  padding: 0;
  display: flex;
}

.navbar-links li {
  margin: 0 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
}

.nav-link:hover {
  text-decoration: underline;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>