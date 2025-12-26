<template>
  <button 
    class="follow-button"
    :class="{
      'following': isFollowing,
      'loading': isLoading,
      'small': size === 'small',
      'medium': size === 'medium',
      'large': size === 'large'
    }"
    @click="toggleFollow"
    :disabled="isLoading"
  >
    <template v-if="isLoading">
      <span class="loading-spinner"></span>
      <span class="loading-text">{{ isFollowing ? '取消中' : '关注中' }}</span>
    </template>
    <template v-else>
      <i :class="iconClass"></i>
      <span class="button-text">
        {{ isFollowing ? (showUnfollow ? '取消关注' : '已关注') : '关注' }}
      </span>
    </template>
  </button>
</template>

<script setup>
// import { ref, computed } from 'vue'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  userId: {
    type: String,
    required: true,
    default: ''
  },
  initialFollowing: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showHoverText: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['follow-change'])

// 响应式数据
const isFollowing = ref(props.initialFollowing)
const isLoading = ref(false)
const showUnfollow = ref(false)

// 关键修复：验证 userId 是否有效
const isValidUserId = computed(() => {
  return props.userId && 
         props.userId !== 'undefined' && 
         props.userId !== 'null' && 
         props.userId !== 'current'
})

// 关键修复：监听 userId 变化
watch(() => props.userId, (newVal) => {
  if (newVal && isValidUserId.value) {
    isFollowing.value = props.initialFollowing
  }
}, { immediate: true })

const iconClass = computed(() => {
  return isFollowing.value ? 'icon-check' : 'icon-add-user'
})

// 切换关注状态
// const toggleFollow = async () => {
//   if (isLoading.value) return
  
//   isLoading.value = true
//   try {
//     if (isFollowing.value) {
//       await axios.delete(`/api/users/${props.userId}/follow`)
//     } else {
//       await axios.post(`/api/users/${props.userId}/follow`)
//     }
    
//     isFollowing.value = !isFollowing.value
//     emit('follow-change', isFollowing.value)
//   } catch (error) {
//     console.error('关注操作失败:', error)
//     // 这里可以显示错误提示
//     alert(error.response?.data?.message || '操作失败，请重试')
//   } finally {
//     isLoading.value = false
//   }
// }

// 切换关注状态
const toggleFollow = async () => {
  // 关键修复：验证 userId
  if (!props.userId || props.userId === 'undefined' || props.userId === 'current') {
    alert('无法操作：用户ID无效')
    return
  }
  
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'x-auth-token': token
      }
    }

    if (isFollowing.value) {
      await axios.delete(`http://localhost:3001/api/users/${props.userId}/follow`, config)
    } else {
      await axios.post(`http://localhost:3001/api/users/${props.userId}/follow`, {}, config)
    }
    
    isFollowing.value = !isFollowing.value
    emit('follow-change', isFollowing.value)
  } catch (error) {
    console.error('关注操作失败:', error)
    // 关键修复：更好的错误提示
    if (error.response?.status === 401) {
      alert('请先登录后再操作')
    } else if (error.response?.status === 404) {
      alert('用户不存在')
    } else {
      alert(error.response?.data?.message || '操作失败，请重试')
    }
  } finally {
    isLoading.value = false
  }
}

// 鼠标悬停事件
const handleMouseEnter = () => {
  if (props.showHoverText && isFollowing.value) {
    showUnfollow.value = true
  }
}

const handleMouseLeave = () => {
  showUnfollow.value = false
}

// 暴露方法给父组件
defineExpose({
  updateFollowingStatus: (status) => {
    isFollowing.value = status
  }
})
</script>

<style scoped>
.follow-button {
  position: relative;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 尺寸样式 */
.follow-button.small {
  padding: 6px 16px;
  font-size: 12px;
  border-radius: 15px;
  min-width: 70px;
}

.follow-button.medium {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 20px;
  min-width: 90px;
}

.follow-button.large {
  padding: 14px 32px;
  font-size: 16px;
  border-radius: 25px;
  min-width: 110px;
}

/* 未关注状态 */
.follow-button:not(.following) {
  background: linear-gradient(135deg, #00bfff, #0080ff);
  color: white;
  border: none;
}

.follow-button:not(.following):hover {
  background: linear-gradient(135deg, #00a1e4, #0066cc);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 128, 255, 0.3);
}

.follow-button:not(.following):active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 128, 255, 0.2);
}

/* 已关注状态 */
.follow-button.following {
  background: transparent;
  color: #aaa;
  border: 1px solid #555;
}

.follow-button.following:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-color: #f44336;
}

.follow-button.following:active {
  transform: scale(0.98);
}

/* 禁用状态 */
.follow-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 加载状态 */
.follow-button.loading {
  opacity: 0.8;
  cursor: wait;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

.follow-button.following .loading-spinner {
  border-color: rgba(170, 170, 170, 0.3);
  border-top-color: currentColor;
}

.loading-text {
  font-size: 0.9em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 按钮文本 */
.button-text {
  display: inline-block;
  transition: all 0.3s;
}

/* 图标样式 */
.icon-add-user:before {
  content: '➕';
  font-size: 12px;
}

.icon-check:before {
  content: '✓';
  font-size: 14px;
  font-weight: bold;
}

/* 涟漪效果 */
.follow-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.6);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.follow-button.following::after {
  background: rgba(244, 67, 54, 0.3);
}

.follow-button:focus:not(:active)::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(30, 30);
    opacity: 0;
  }
}

/* 无障碍支持 */
.follow-button:focus {
  outline: 2px solid #00a1d6;
  outline-offset: 2px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .follow-button.large {
    padding: 12px 24px;
    font-size: 15px;
    min-width: 100px;
  }
}
</style>