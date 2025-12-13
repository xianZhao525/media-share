<template>
    <div class="review-form">
      <div class="form-header">
        <h3>{{ editing ? '编辑评论' : '发表评论' }}</h3>
        <div class="rating-input" v-if="!editing">
          <span class="rating-label">评分：</span>
          <div class="stars">
            <button
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ 'active': star <= model.rating }"
              @click="model.rating = star"
              type="button"
            >
              ★
            </button>
          </div>
          <span class="rating-value">{{ model.rating }}/5</span>
        </div>
      </div>
  
      <form @submit.prevent="handleSubmit" class="review-form-content">
        <div class="form-group">
          <textarea
            v-model="model.content"
            placeholder="写下你的评论..."
            rows="4"
            required
            :disabled="loading"
          ></textarea>
        </div>
  
        <div class="form-actions">
          <button
            type="button"
            v-if="editing"
            @click="$emit('cancel')"
            class="btn btn-secondary"
            :disabled="loading"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !model.content.trim() || (!model.rating && !editing)"
          >
            <span v-if="loading">
              <span class="spinner"></span> 提交中...
            </span>
            <span v-else>{{ editing ? '更新评论' : '提交评论' }}</span>
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
    import { ref, reactive, watch } from 'vue'
    import { reviewApi } from '../utils/api.js'
    
    const props = defineProps({
      itemId: {
        type: String,
        required: true
      },
      editing: {
        type: Boolean,
        default: false
      },
      initialData: {
        type: Object,
        default: () => ({ rating: 5, content: '' })
      }
    })
    
    const emit = defineEmits(['submit', 'cancel'])
    
    const loading = ref(false)
    
    const model = reactive({
      rating: props.initialData.rating || 5,
      content: props.initialData.content || ''
    })
    
    // 监听初始数据变化
    watch(() => props.initialData, (newData) => {
      if (newData) {
        model.rating = newData.rating || 5
        model.content = newData.content || ''
      }
    }, { immediate: true })
    
    const handleSubmit = async () => {
      // 检查是否登录
      // const token = localStorage.getItem('token')
      // if (!token) {
      //   alert('请先登录后再发表评论')
      //   return
      // }
    
      if (!model.content.trim()) {
        alert('评论内容不能为空')
        return
      }
    
      if (!props.editing && !model.rating) {
        alert('请选择评分')
        return
      }
    
      loading.value = true
    
      try {
        const reviewData = {
          rating: model.rating,
          content: model.content.trim()
        }
    
        let response;
        
        if (props.editing) {
          // 更新评论
          response = await reviewApi.updateReview(props.initialData._id, reviewData)
        } else {
          // 发表新评论
          response = await reviewApi.createReview(props.itemId, reviewData)
        }
    
        if (response.code === 201 || response.code === 200) {
          emit('submit', reviewData)
          
          // 清空表单（如果是新建）
          if (!props.editing) {
            model.content = ''
            model.rating = 5
          }
        } else {
          alert(response.message || '提交失败，请重试')
        }
      } catch (error) {
        console.error('提交评论失败:', error)
        alert('提交失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
    </script>
  
  <style scoped>
  .review-form {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .form-header {
    margin-bottom: 20px;
  }
  
  .form-header h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 20px;
  }
  
  .rating-input {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .rating-label {
    font-weight: 500;
    color: #666;
  }
  
  .stars {
    display: flex;
    gap: 4px;
  }
  
  .star {
    background: none;
    border: none;
    font-size: 28px;
    color: #e0e0e0;
    cursor: pointer;
    padding: 0 2px;
    transition: color 0.2s ease;
  }
  
  .star:hover,
  .star.active {
    color: #ffc107;
  }
  
  .star:hover ~ .star {
    color: #e0e0e0 !important;
  }
  
  .rating-value {
    font-weight: 600;
    color: #ff9800;
    min-width: 40px;
  }
  
  .form-group textarea {
    width: 100%;
    padding: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
  }
  
  .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  .form-group textarea:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
  
  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  .btn-primary:disabled {
    background-color: #b3d7ff;
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background-color: #545b62;
  }
  
  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    .review-form {
      padding: 16px;
    }
    
    .rating-input {
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 8px 16px;
      min-width: 80px;
    }
  }
  </style>