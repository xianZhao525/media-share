<!-- frontend/src/views/ItemCreate.vue -->
<template>
  <div class="create-view">
    <div class="container">
      <div class="create-header">
        <h1 class="page-title">创建新内容</h1>
        <p class="page-subtitle">分享你喜欢的影视作品给大家</p>
      </div>
      
      <div class="create-container">
        <!-- 左侧表单 -->
        <div class="form-section">
          <form @submit.prevent="handleSubmit" class="create-form">
            <!-- 基本信息 -->
            <div class="form-section-card">
              <h2 class="form-section-title">
                <i class="icon-info">📝</i>
                基本信息
              </h2>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="title" class="form-label required">
                    标题 <span class="required-mark">*</span>
                  </label>
                  <input
                    id="title"
                    v-model="formData.title"
                    type="text"
                    placeholder="请输入内容标题"
                    required
                    class="form-input"
                    :class="{ error: errors.title }"
                  />
                  <div v-if="errors.title" class="error-message">
                    {{ errors.title }}
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="type" class="form-label required">
                    类型 <span class="required-mark">*</span>
                  </label>
                  <select
                    id="type"
                    v-model="formData.type"
                    required
                    class="form-select"
                    :class="{ error: errors.type }"
                    @change="resetDetails"
                  >
                    <option value="" disabled>请选择类型</option>
                    <option value="movie">电影</option>
                    <option value="tv">电视剧</option>
                    <option value="anime">动漫</option>
                    <option value="variety">综艺</option>
                    <option value="documentary">纪录片</option>
                  </select>
                  <div v-if="errors.type" class="error-message">
                    {{ errors.type }}
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="description" class="form-label required">
                  描述 <span class="required-mark">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  placeholder="请输入内容描述，建议200字以上"
                  required
                  rows="4"
                  class="form-textarea"
                  :class="{ error: errors.description }"
                ></textarea>
                <div class="form-hint">
                  已输入 {{ descriptionLength }} 字，建议200-2000字
                </div>
                <div v-if="errors.description" class="error-message">
                  {{ errors.description }}
                </div>
              </div>
            </div>
            
            <!-- 多媒体信息 -->
            <div class="form-section-card">
              <h2 class="form-section-title">
                <i class="icon-media">🎬</i>
                多媒体信息
              </h2>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="cover" class="form-label required">
                    封面图片 <span class="required-mark">*</span>
                  </label>
                  <input
                    id="cover"
                    v-model="formData.cover"
                    type="url"
                    placeholder="请输入封面图片URL"
                    required
                    class="form-input"
                    :class="{ error: errors.cover }"
                  />
                  <div class="form-hint">
                    建议尺寸：800x450，支持 JPG、PNG、WebP
                  </div>
                  <div v-if="errors.cover" class="error-message">
                    {{ errors.cover }}
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="videoUrl" class="form-label">
                    视频链接
                  </label>
                  <input
                    id="videoUrl"
                    v-model="formData.videoUrl"
                    type="url"
                    placeholder="请输入视频播放地址（可选）"
                    class="form-input"
                  />
                  <div class="form-hint">
                    支持 MP4、M3U8 等格式
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">封面预览</label>
                <div class="cover-preview">
                  <img
                    v-if="formData.cover && isValidUrl(formData.cover)"
                    :src="formData.cover"
                    alt="封面预览"
                    class="preview-image"
                    @error="handleImageError"
                  />
                  <div v-else class="preview-placeholder">
                    <i class="icon-preview">🖼️</i>
                    <p>封面预览</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 详细信息 -->
            <div v-if="formData.type" class="form-section-card">
              <h2 class="form-section-title">
                <i class="icon-details">📋</i>
                详细信息
              </h2>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="releaseYear" class="form-label">
                    上映年份
                  </label>
                  <input
                    id="releaseYear"
                    v-model.number="formData.details.releaseYear"
                    type="number"
                    min="1900"
                    :max="currentYear"
                    placeholder="请输入上映年份"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="duration" class="form-label">
                    时长（分钟）
                  </label>
                  <input
                    id="duration"
                    v-model.number="formData.details.duration"
                    type="number"
                    min="1"
                    placeholder="请输入时长"
                    class="form-input"
                  />
                </div>
              </div>
              
              <!-- 类型特定字段 -->
              <div v-if="formData.type === 'movie'" class="type-specific-fields">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="director" class="form-label">导演</label>
                    <input
                      id="director"
                      v-model="formData.details.director"
                      type="text"
                      placeholder="请输入导演姓名"
                      class="form-input"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="country" class="form-label">国家/地区</label>
                    <input
                      id="country"
                      v-model="formData.details.country"
                      type="text"
                      placeholder="请输入国家/地区"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
              
              <div v-if="formData.type === 'tv'" class="type-specific-fields">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="totalEpisodes" class="form-label">总集数</label>
                    <input
                      id="totalEpisodes"
                      v-model.number="formData.details.totalEpisodes"
                      type="number"
                      min="1"
                      placeholder="请输入总集数"
                      class="form-input"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="currentEpisode" class="form-label">当前集数</label>
                    <input
                      id="currentEpisode"
                      v-model.number="formData.details.currentEpisode"
                      type="number"
                      min="1"
                      :max="formData.details.totalEpisodes"
                      placeholder="请输入当前更新集数"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 标签和分类 -->
            <div class="form-section-card">
              <h2 class="form-section-title">
                <i class="icon-tags">🏷️</i>
                标签和分类
              </h2>
              
              <div class="form-group">
                <label class="form-label">标签</label>
                <div class="tags-input-container">
                  <input
                    v-model="tagInput"
                    type="text"
                    placeholder="输入标签，按回车或逗号添加"
                    class="tags-input"
                    @keydown.enter.prevent="addTag"
                  />
                  <button
                    type="button"
                    @click="addTag"
                    class="tags-add-btn"
                  >
                    添加
                  </button>
                </div>
                
                <div class="tags-hint">
                  建议添加3-5个相关标签，用逗号或回车分隔
                </div>
                
                <div class="tags-preview">
                  <div
                    v-for="tag in formData.tags"
                    :key="tag"
                    class="tag-item"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(tag)"
                      class="tag-remove"
                    >
                      ×
                    </button>
                  </div>
                  <div v-if="formData.tags.length === 0" class="tags-empty">
                    暂无标签，请添加相关标签
                  </div>
                </div>
                
                <div v-if="errors.tags" class="error-message">
                  {{ errors.tags }}
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">热门标签推荐</label>
                <div class="suggested-tags">
                  <button
                    v-for="tag in suggestedTags"
                    :key="tag"
                    type="button"
                    @click="suggestTag(tag)"
                    class="suggested-tag"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div class="form-actions">
              <button
                type="button"
                @click="handleReset"
                class="btn-secondary"
                :disabled="submitting"
              >
                <i class="icon-reset">🔄</i>
                重置表单
              </button>
              
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting || !isFormValid"
              >
                <i class="icon-submit">📤</i>
                {{ submitting ? '提交中...' : '发布内容' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- 右侧预览 -->
        <div class="preview-section">
          <div class="preview-card">
            <h2 class="preview-title">
              <i class="icon-preview">👁️</i>
              内容预览
            </h2>
            
            <div class="preview-content">
              <!-- 预览头部 -->
              <div class="preview-header">
                <div class="preview-cover">
                  <img
                    v-if="formData.cover && isValidUrl(formData.cover)"
                    :src="formData.cover"
                    alt="封面预览"
                    class="preview-cover-image"
                  />
                  <div v-else class="preview-cover-placeholder">
                    <i class="icon-cover">🎬</i>
                  </div>
                </div>
                
                <div class="preview-info">
                  <h3 class="preview-item-title">
                    {{ formData.title || '内容标题' }}
                  </h3>
                  
                  <div class="preview-meta">
                    <span class="preview-type">
                      {{ getTypeLabel(formData.type) || '类型' }}
                    </span>
                    <span v-if="formData.details.releaseYear" class="preview-year">
                      {{ formData.details.releaseYear }}年
                    </span>
                    <span v-if="formData.details.duration" class="preview-duration">
                      {{ formData.details.duration }}分钟
                    </span>
                  </div>
                  
                  <div class="preview-rating">
                    <div class="rating-stars">
                      <i v-for="star in 5" :key="star" class="star">★</i>
                    </div>
                    <span class="rating-text">暂无评分</span>
                  </div>
                </div>
              </div>
              
              <!-- 预览描述 -->
              <div class="preview-description">
                <h4 class="preview-section-title">内容描述</h4>
                <p class="preview-text">
                  {{ formData.description || '请输入内容描述...' }}
                </p>
              </div>
              
              <!-- 预览标签 -->
              <div class="preview-tags">
                <h4 class="preview-section-title">标签</h4>
                <div class="preview-tags-list">
                  <span
                    v-for="tag in formData.tags"
                    :key="tag"
                    class="preview-tag"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="formData.tags.length === 0" class="no-tags">
                    暂无标签
                  </span>
                </div>
              </div>
              
              <!-- 预览统计 -->
              <div class="preview-stats">
                <div class="stat-item">
                  <i class="stat-icon">👁️</i>
                  <div class="stat-content">
                    <div class="stat-value">0</div>
                    <div class="stat-label">观看</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <i class="stat-icon">❤️</i>
                  <div class="stat-content">
                    <div class="stat-value">0</div>
                    <div class="stat-label">点赞</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <i class="stat-icon">💬</i>
                  <div class="stat-content">
                    <div class="stat-value">0</div>
                    <div class="stat-label">评论</div>
                  </div>
                </div>
              </div>
              
              <!-- 预览提示 -->
              <div class="preview-tips">
                <h4 class="preview-section-title">发布提示</h4>
                <ul class="tips-list">
                  <li>确保内容符合平台规范</li>
                  <li>填写完整信息有助于获得更多推荐</li>
                  <li>优质内容可以获得官方推荐</li>
                  <li>请勿发布侵权或违规内容</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发布成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-icon">
          <i class="icon-success">🎉</i>
        </div>
        <h3 class="success-title">发布成功！</h3>
        <p class="success-message">您的内容已成功发布，正在等待审核</p>
        <div class="success-actions">
          <button @click="viewCreatedItem" class="btn-primary">
            查看内容
          </button>
          <button @click="createAnother" class="btn-secondary">
            继续创建
          </button>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="showError" class="error-toast">
      <div class="error-toast-content">
        <i class="error-icon">❌</i>
        <span>{{ errorMessage }}</span>
        <button @click="showError = false" class="error-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import itemApi from '@/api/items'

const router = useRouter()

// 表单数据
const formData = ref({
  title: '',
  type: '',
  description: '',
  cover: '',
  videoUrl: '',
  tags: [],
  details: {
    releaseYear: '',
    duration: '',
    director: '',
    country: '',
    totalEpisodes: '',
    currentEpisode: ''
  }
})

// 表单状态
const tagInput = ref('')
const errors = ref({})
const submitting = ref(false)
const showSuccessModal = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const createdItemId = ref('')

// 计算属性
const descriptionLength = computed(() => {
  return formData.value.description.length
})

const currentYear = computed(() => {
  return new Date().getFullYear()
})

const isFormValid = computed(() => {
  return formData.value.title &&
         formData.value.type &&
         formData.value.description &&
         formData.value.cover &&
         formData.value.tags.length > 0
})

const suggestedTags = ref([
  '悬疑', '喜剧', '爱情', '科幻', '动作',
  '冒险', '恐怖', '剧情', '家庭', '音乐',
  '中国', '美国', '日本', '韩国', '经典',
  '热门', '推荐', '高分', '获奖', '新片'
])

// 工具函数
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const getTypeLabel = (type) => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    variety: '综艺',
    documentary: '纪录片'
  }
  return typeMap[type] || type
}

// 表单操作
const resetDetails = () => {
  formData.value.details = {
    releaseYear: '',
    duration: '',
    director: '',
    country: '',
    totalEpisodes: '',
    currentEpisode: ''
  }
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag) => {
  formData.value.tags = formData.value.tags.filter(t => t !== tag)
}

const suggestTag = (tag) => {
  if (!formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.querySelector('.preview-placeholder').style.display = 'flex'
}

// 表单验证
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.title.trim()) {
    errors.value.title = '标题不能为空'
  } else if (formData.value.title.length > 100) {
    errors.value.title = '标题不能超过100个字符'
  }
  
  if (!formData.value.type) {
    errors.value.type = '请选择内容类型'
  }
  
  if (!formData.value.description.trim()) {
    errors.value.description = '描述不能为空'
  } else if (formData.value.description.length < 50) {
    errors.value.description = '描述至少需要50个字符'
  } else if (formData.value.description.length > 2000) {
    errors.value.description = '描述不能超过2000个字符'
  }
  
  if (!formData.value.cover.trim()) {
    errors.value.cover = '封面图片不能为空'
  } else if (!isValidUrl(formData.value.cover)) {
    errors.value.cover = '请输入有效的图片URL'
  }
  
  if (formData.value.tags.length === 0) {
    errors.value.tags = '至少添加一个标签'
  } else if (formData.value.tags.length > 10) {
    errors.value.tags = '标签数量不能超过10个'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交处理
const handleSubmit = async () => {
  if (!validateForm()) {
    showErrorMessage('请检查表单错误')
    return
  }
  
  try {
    submitting.value = true
    
    // 准备提交数据
    const submitData = {
      ...formData.value,
      releaseYear: formData.value.details.releaseYear,
      duration: formData.value.details.duration,
      director: formData.value.details.director,
      country: formData.value.details.country,
      totalEpisodes: formData.value.details.totalEpisodes,
      currentEpisode: formData.value.details.currentEpisode
    }
    
    // 移除空的字段
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] == null) {
        delete submitData[key]
      }
    })
    
    // 调用API
    const response = await itemApi.createItem(submitData)
    
    if (response.code === 201) {
      createdItemId.value = response.data._id
      showSuccessModal.value = true
    } else {
      showErrorMessage(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布内容失败:', error)
    showErrorMessage(error.message || '发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  if (confirm('确定要重置表单吗？所有填写的内容将丢失。')) {
    formData.value = {
      title: '',
      type: '',
      description: '',
      cover: '',
      videoUrl: '',
      tags: [],
      details: {
        releaseYear: '',
        duration: '',
        director: '',
        country: '',
        totalEpisodes: '',
        currentEpisode: ''
      }
    }
    tagInput.value = ''
    errors.value = {}
  }
}

// 成功处理
const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/')
}

const viewCreatedItem = () => {
  if (createdItemId.value) {
    router.push(`/item/${createdItemId.value}`)
  } else {
    router.push('/')
  }
}

const createAnother = () => {
  showSuccessModal.value = false
  handleReset()
}

// 错误处理
const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
  
  setTimeout(() => {
    showError.value = false
  }, 5000)
}

// 生命周期
onMounted(() => {
  // 可以从URL参数中获取预设值
  const params = new URLSearchParams(window.location.search)
  if (params.get('type')) {
    formData.value.type = params.get('type')
  }
})
</script>

<style scoped>
.create-view {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.create-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.create-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* 表单部分 */
.form-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 25px;
  background: #fff;
}

.form-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-label.required {
  position: relative;
}

.required-mark {
  color: #ff6b6b;
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0072ff;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ff6b6b;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.error-message {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 5px;
}

/* 封面预览 */
.cover-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f8f9fa;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #999;
}

.preview-placeholder i {
  font-size: 48px;
}

/* 标签输入 */
.tags-input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tags-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.tags-input:focus {
  outline: none;
  border-color: #0072ff;
}

.tags-add-btn {
  padding: 12px 20px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tags-add-btn:hover {
  background: #e0e0e0;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  margin-top: 15px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f0f0f0;
  color: #333;
  border-radius: 20px;
  font-size: 13px;
}

.tag-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.tag-remove:hover {
  background: #ddd;
  color: #666;
}

.tags-empty {
  color: #999;
  font-size: 13px;
  padding: 12px 0;
}

/* 推荐标签 */
.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.suggested-tag {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggested-tag:hover {
  border-color: #0072ff;
  color: #0072ff;
}

/* 类型特定字段 */
.type-specific-fields {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.btn-primary, .btn-secondary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 114, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

/* 预览部分 */
.preview-section {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-content {
  padding: 25px;
}

.preview-header {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.preview-cover {
  flex: 0 0 120px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.preview-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.preview-cover-placeholder i {
  font-size: 48px;
}

.preview-info {
  flex: 1;
}

.preview-item-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.3;
}

.preview-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.preview-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .star {
  color: #ddd;
  font-size: 16px;
}

.rating-text {
  font-size: 14px;
  color: #999;
}

.preview-description,
.preview-tags,
.preview-tips {
  margin-bottom: 25px;
}

.preview-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.preview-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
}

.preview-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  padding: 4px 10px;
  background: #f0f0f0;
  color: #666;
  border-radius: 15px;
  font-size: 12px;
}

.no-tags {
  color: #999;
  font-size: 13px;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 13px;
  color: #666;
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #0072ff;
}

/* 成功弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-modal {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.success-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.success-actions .btn-primary,
.success-actions .btn-secondary {
  padding: 12px 24px;
}

/* 错误提示 */
.error-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1001;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-toast-content {
  background: #ff6b6b;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.error-icon {
  font-size: 18px;
}

.error-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .create-container {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .create-header {
    margin-bottom: 30px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-section-card {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .preview-cover {
    width: 100%;
    max-width: 200px;
  }
  
  .preview-stats {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .success-modal {
    padding: 30px 20px;
  }
  
  .success-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .create-view {
    padding: 20px 0;
  }
  
  .container {
    padding: 0 15px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .tags-input-container {
    flex-direction: column;
  }
  
  .tags-add-btn {
    width: 100%;
  }
  
  .preview-card {
    margin-top: 30px;
  }
}
</style>