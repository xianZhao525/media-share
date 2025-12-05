<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="container">
        <p>© 2024 MediaShare - 在线影视分享平台</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.app-footer {
  background: #333;
  color: white;
  padding: 1rem 0;
  text-align: center;
}
</style>