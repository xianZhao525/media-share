<template>
  <div id="app">
    <!-- 这是你负责的导航栏 -->
    <NavBar />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 页脚（可以是你负责的全局样式部分） -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>© 2024 在线影视分享平台 - 角色五（搜索与全局功能）开发</p>
        <p class="footer-links">
          <a href="/about">关于我们</a> | 
          <a href="/help">帮助中心</a> | 
          <a href="/contact">联系我们</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { onMounted } from 'vue';


onMounted(() => {
  // 可以在这里添加一些初始化逻辑
  console.log('App mounted');
});
</script>

<style scoped>
/* 全局样式（你的职责之一） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
}

.app-footer {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 2rem 1rem;
  text-align: center;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  margin-top: 0.5rem;
}

.footer-links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 0.5rem;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>