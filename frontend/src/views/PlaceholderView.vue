<template>
  <div class="placeholder">
    <h2>{{ title }}</h2>
    <p>此功能由 <strong>{{ role }}</strong> 负责开发</p>
    <p>当前为占位页面，真实功能开发中...</p>
    <div v-if="mockData">
      <h3>模拟数据预览：</h3>
      <pre>{{ JSON.stringify(mockData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '功能页面'
  },
  role: {
    type: String,
    default: '对应角色'
  },
  mockData: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.placeholder {
  text-align: center;
  padding: 3rem;
  min-height: 50vh;
  background: #f8f9fa;
  border-radius: 10px;
  margin: 2rem;
}

.placeholder h2 {
  color: #333;
  margin-bottom: 1rem;
}

.placeholder p {
  color: #666;
  margin-bottom: 0.5rem;
}

pre {
  text-align: left;
  background: white;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
  overflow: auto;
}
</style>