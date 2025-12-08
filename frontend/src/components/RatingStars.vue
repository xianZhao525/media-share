<template>
    <div class="rating-stars" :title="`${value.toFixed(1)}/5`">
      <span
        v-for="star in 5"
        :key="star"
        class="star"
        :class="getStarClass(star)"
        @click="handleClick(star)"
      >
        <!-- 完整星 -->
        <svg
          v-if="star <= Math.floor(value)"
          :width="starSize"
          :height="starSize"
          viewBox="0 0 24 24"
          class="star-svg filled"
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            :fill="starColor"
          />
        </svg>
        
        <!-- 半星 -->
        <svg
          v-else-if="showHalfStar && star === Math.ceil(value) && value % 1 >= 0.25"
          :width="starSize"
          :height="starSize"
          viewBox="0 0 24 24"
          class="star-svg half"
        >
          <!-- 左半部分填充 -->
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" :stop-color="starColor" />
              <stop offset="50%" stop-color="#e0e0e0" />
            </linearGradient>
          </defs>
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="url(#half-gradient)"
          />
        </svg>
        
        <!-- 空星 -->
        <svg
          v-else
          :width="starSize"
          :height="starSize"
          viewBox="0 0 24 24"
          class="star-svg empty"
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#e0e0e0"
          />
        </svg>
      </span>
      
      <!-- 评分数值 -->
      <span v-if="showValue" class="rating-value">{{ value.toFixed(1) }}</span>
      
      <!-- 评分数量 -->
      <span v-if="showCount && count" class="rating-count">({{ count }})</span>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    // 评分值（0-5）
    value: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 5
    },
    // 尺寸：small（16px）、medium（24px）、large（32px）
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 是否显示评分数值
    showValue: {
      type: Boolean,
      default: false
    },
    // 是否显示评分数量
    showCount: {
      type: Boolean,
      default: false
    },
    // 评分数量
    count: {
      type: Number,
      default: 0
    },
    // 是否可交互（点击评分）
    interactive: {
      type: Boolean,
      default: false
    },
    // 是否显示半星
    showHalfStar: {
      type: Boolean,
      default: true
    },
    // 星星颜色
    starColor: {
      type: String,
      default: '#ffc107'
    },
    // 只读模式
    readonly: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['rate'])
  
  // 计算星星大小
  const starSize = computed(() => {
    const sizes = {
      small: 16,
      medium: 24,
      large: 32
    }
    return sizes[props.size]
  })
  
  // 获取星星的CSS类
  const getStarClass = (star) => {
    const classes = []
    
    if (props.interactive && !props.readonly) {
      classes.push('interactive')
    }
    
    classes.push(`size-${props.size}`)
    
    return classes
  }
  
  // 处理点击事件
  const handleClick = (star) => {
    if (props.interactive && !props.readonly) {
      emit('rate', star)
    }
  }
  
  // 计算是否显示半星
  const shouldShowHalfStar = computed(() => {
    if (!props.showHalfStar) return false
    const decimal = props.value % 1
    return decimal >= 0.25 && decimal <= 0.75
  })
  </script>
  
  <style scoped>
  .rating-stars {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  
  .star {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    position: relative;
  }
  
  .star.interactive {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .star.interactive:hover {
    transform: scale(1.1);
    opacity: 0.9;
  }
  
  .star.interactive:hover .star-svg.empty {
    fill: #ffd54f;
  }
  
  .star-svg {
    display: block;
    transition: all 0.2s ease;
  }
  
  /* 尺寸样式 */
  .star.size-small .star-svg {
    width: 16px;
    height: 16px;
  }
  
  .star.size-medium .star-svg {
    width: 24px;
    height: 24px;
  }
  
  .star.size-large .star-svg {
    width: 32px;
    height: 32px;
  }
  
  /* 评分数值和数量 */
  .rating-value {
    margin-left: 8px;
    font-weight: 600;
    color: #ff9800;
    font-size: 0.95em;
    min-width: 32px;
  }
  
  .rating-count {
    margin-left: 4px;
    color: #666;
    font-size: 0.9em;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .star.size-medium .star-svg {
      width: 20px;
      height: 20px;
    }
    
    .star.size-large .star-svg {
      width: 28px;
      height: 28px;
    }
    
    .rating-value {
      font-size: 0.9em;
      margin-left: 6px;
    }
  }
  </style>