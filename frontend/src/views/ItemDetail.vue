<template>
  <div class="item-detail">
    <!-- 测试按钮 -->
    <div class="test-controls">
      <button @click="toggleLogin" class="test-btn">
        {{ isAuthenticated ? '退出登录' : '模拟登录' }}
      </button>
      <span class="login-status">
        当前状态: {{ isAuthenticated ? '已登录' : '未登录' }}
      </span>
    </div>
    
    <!-- 内容详情部分 -->
    <div class="item-content">
      <h2>内容详情页面</h2>
      <div v-if="itemId">
        <h3>内容ID: {{ itemId }}</h3>
        <div class="mock-item-info">
          <p><strong>标题：</strong>{{ itemDetails.title || '加载中...' }}</p>
          <p><strong>类型：</strong>{{ itemDetails.type || '加载中...' }}</p>
          <p><strong>描述：</strong>{{ itemDetails.description || '加载中...' }}</p>
          <p><strong>平均评分：</strong>{{ averageRating.toFixed(1) }} / 5</p>
        </div>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="reviews-section">
      <!-- 评论表单 -->
      <ReviewForm
        v-if="isAuthenticated && !editingReview"
        :itemId="itemId"
        @submit="handleSubmitReview"
        class="mb-6"
      />

      <!-- 登录提示 -->
      <div v-else-if="!isAuthenticated && !editingReview" class="login-prompt">
        <p>请先登录后才能发表评论</p>
        <button @click="toggleLogin" class="login-btn">模拟登录</button>
      </div>

      <!-- 编辑评论表单 -->
      <div v-if="editingReview" class="edit-review-container">
        <ReviewForm
          :itemId="itemId"
          :editing="true"
          :initialData="editingReview"
          @submit="handleUpdateReview"
          @cancel="editingReview = null"
        />
      </div>

      <!-- 评论列表 -->
      <ReviewList
        :itemId="itemId"
        :averageRating="averageRating"
        @edit-review="handleEditReview"
        @delete-review="handleReviewDeleted"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import ReviewForm from '../components/ReviewForm.vue'
  import ReviewList from '../components/ReviewList.vue'
  import { itemApi } from '../utils/api.js'
  
  const route = useRoute()
  
  const editingReview = ref(null)
  const itemDetails = ref({})
  const averageRating = ref(0)
  const loading = ref(false)
  
  // 从路由参数获取 itemId
  const itemId = computed(() => {
    return route.params.id || 'demo-content-123'
  })
  
  // 检查是否登录
  const isAuthenticated = computed(() => {
    return !!localStorage.getItem('token')
  })
  
  onMounted(() => {
    console.log('ItemDetail 加载，itemId:', itemId.value)
    loadItemDetails()
  })
  
  // 加载内容详情
  const loadItemDetails = async () => {
    loading.value = true
    try {
      // 调用真实API
      const response = await itemApi.getItem(itemId.value)
      
      if (response.code === 200) {
        itemDetails.value = response.data
        averageRating.value = response.data.averageRating || 0
      } else {
        // 如果API失败，使用模拟数据
        console.log('使用模拟数据')
        itemDetails.value = {
          id: itemId.value,
          title: itemId.value.includes('demo') ? '演示内容' : `内容 ${itemId.value}`,
          type: '电影',
          description: '这是一个示例内容，用于展示评论功能。',
          averageRating: 4.5,
          createdAt: new Date().toISOString()
        }
        averageRating.value = itemDetails.value.averageRating
      }
    } catch (error) {
      console.error('加载内容详情失败:', error)
      // 使用模拟数据
      itemDetails.value = {
        id: itemId.value,
        title: '示例内容',
        type: '电影',
        description: '这是一个示例内容，用于展示评论功能。',
        averageRating: 4.5,
        createdAt: new Date().toISOString()
      }
      averageRating.value = itemDetails.value.averageRating
    } finally {
      loading.value = false
    }
  }
  
  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('提交评论:', reviewData, 'itemId:', itemId.value)
      
      // 这里不需要手动调用API，ReviewForm已经处理了
      // 只需要显示成功消息
      alert('评论发表成功！')
      
      // 刷新内容详情（重新获取平均分）
      loadItemDetails()
    } catch (error) {
      console.error('发表评论失败:', error)
      alert('发表评论失败，请重试')
    }
  }
  
  const handleEditReview = (review) => {
    editingReview.value = {
      _id: review._id,
      rating: review.rating,
      content: review.content
    }
  }
  
  const handleUpdateReview = async (reviewData) => {
    try {
      console.log('更新评论:', reviewData, 'itemId:', itemId.value)
      
      // 这里不需要手动调用API，ReviewForm已经处理了
      alert('评论更新成功！')
      
      editingReview.value = null
      // 刷新内容详情
      loadItemDetails()
    } catch (error) {
      console.error('更新评论失败:', error)
      alert('更新评论失败，请重试')
    }
  }
  
  const handleReviewDeleted = (reviewId) => {
    console.log('评论已删除:', reviewId)
    // 刷新内容详情
    loadItemDetails()
  }
  
  // 切换登录状态（测试用）
  const toggleLogin = () => {
    const token = localStorage.getItem('token')
    if (token) {
      localStorage.removeItem('token')
    } else {
      // 模拟一个token（实际应该从登录API获取）
      localStorage.setItem('token', 'mock-token-123')
    }
    window.location.reload()
  }
  </script>

<style scoped>
.item-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.item-content {
  margin-bottom: 40px;
}

.reviews-section {
  margin-top: 40px;
}

.edit-review-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.mb-6 {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .item-detail {
    padding: 12px;
  }
}
</style>