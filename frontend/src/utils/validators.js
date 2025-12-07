/**
 * 表单验证工具函数
 */

// 验证URL
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// 验证邮箱
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export const isStrongPassword = (password) => {
  // 至少8个字符，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

// 验证用户名
export const isValidUsername = (username) => {
  // 3-20个字符，只包含字母、数字、下划线和中文
  const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// 验证手机号（中国）
export const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证标题
export const validateTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: '标题不能为空' }
  }
  
  if (title.trim().length < 2) {
    return { valid: false, message: '标题至少需要2个字符' }
  }
  
  if (title.trim().length > 100) {
    return { valid: false, message: '标题不能超过100个字符' }
  }
  
  return { valid: true, message: '' }
}

// 验证描述
export const validateDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return { valid: false, message: '描述不能为空' }
  }
  
  if (description.trim().length < 10) {
    return { valid: false, message: '描述至少需要10个字符' }
  }
  
  if (description.trim().length > 500) {
    return { valid: false, message: '描述不能超过500个字符' }
  }
  
  return { valid: true, message: '' }
}

// 验证标签
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return { valid: false, message: '标签必须是数组' }
  }
  
  if (tags.length > 10) {
    return { valid: false, message: '最多只能添加10个标签' }
  }
  
  for (const tag of tags) {
    if (tag.length > 20) {
      return { valid: false, message: '单个标签不能超过20个字符' }
    }
  }
  
  return { valid: true, message: '' }
}

// 验证ISBN（书籍）
export const validateISBN = (isbn) => {
  if (!isbn) return { valid: true, message: '' }
  
  // 简单的ISBN验证（支持10位和13位）
  const isbnRegex = /^(?:\d{9}[\dX]|\d{13})$/
  if (!isbnRegex.test(isbn.replace(/[-\s]/g, ''))) {
    return { valid: false, message: '请输入有效的ISBN号码' }
  }
  
  return { valid: true, message: '' }
}

// 验证评分
export const validateRating = (rating) => {
  const num = parseFloat(rating)
  
  if (isNaN(num)) {
    return { valid: false, message: '请输入有效的评分' }
  }
  
  if (num < 0 || num > 5) {
    return { valid: false, message: '评分必须在0-5之间' }
  }
  
  return { valid: true, message: '' }
}

// 验证页码
export const validatePage = (page) => {
  const num = parseInt(page)
  
  if (isNaN(num) || num < 1) {
    return { valid: false, message: '页码必须大于0' }
  }
  
  return { valid: true, message: '' }
}

// 验证每页条数
export const validateLimit = (limit, maxLimit = 100) => {
  const num = parseInt(limit)
  
  if (isNaN(num) || num < 1) {
    return { valid: false, message: '每页条数必须大于0' }
  }
  
  if (num > maxLimit) {
    return { valid: false, message: `每页条数不能超过${maxLimit}` }
  }
  
  return { valid: true, message: '' }
}

// 验证搜索关键词
export const validateSearchQuery = (query) => {
  if (!query || query.trim().length === 0) {
    return { valid: false, message: '请输入搜索关键词' }
  }
  
  if (query.trim().length > 100) {
    return { valid: false, message: '搜索关键词不能超过100个字符' }
  }
  
  return { valid: true, message: '' }
}

// 验证文件大小
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) return { valid: true, message: '' }
  
  const maxSize = maxSizeMB * 1024 * 1024 // 转换为字节
  
  if (file.size > maxSize) {
    return { valid: false, message: `文件大小不能超过${maxSizeMB}MB` }
  }
  
  return { valid: true, message: '' }
}

// 验证文件类型
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  if (!file) return { valid: true, message: '' }
  
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1].toUpperCase())
    return { valid: false, message: `只支持 ${allowedExtensions.join(', ')} 格式的文件` }
  }
  
  return { valid: true, message: '' }
}

// 验证数字范围
export const validateNumberRange = (value, min, max) => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { valid: false, message: '请输入有效的数字' }
  }
  
  if (num < min) {
    return { valid: false, message: `数值不能小于${min}` }
  }
  
  if (num > max) {
    return { valid: false, message: `数值不能大于${max}` }
  }
  
  return { valid: true, message: '' }
}

// 验证必填字段
export const validateRequired = (value, fieldName = '字段') => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  return { valid: true, message: '' }
}

// 批量验证表单
export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field]
    
    if (rule.required) {
      const result = validateRequired(value, rule.label || field)
      if (!result.valid) {
        errors[field] = result.message
        isValid = false
        continue
      }
    }
    
    if (rule.validator) {
      const result = rule.validator(value, formData)
      if (!result.valid) {
        errors[field] = result.message
        isValid = false
      }
    }
    
    if (rule.type === 'email' && value) {
      if (!isValidEmail(value)) {
        errors[field] = '请输入有效的邮箱地址'
        isValid = false
      }
    }
    
    if (rule.type === 'url' && value) {
      if (!isValidUrl(value)) {
        errors[field] = '请输入有效的URL地址'
        isValid = false
      }
    }
    
    if (rule.min && value) {
      if (typeof value === 'string' && value.length < rule.min) {
        errors[field] = `${rule.label || field}至少需要${rule.min}个字符`
        isValid = false
      } else if (typeof value === 'number' && value < rule.min) {
        errors[field] = `${rule.label || field}不能小于${rule.min}`
        isValid = false
      }
    }
    
    if (rule.max && value) {
      if (typeof value === 'string' && value.length > rule.max) {
        errors[field] = `${rule.label || field}不能超过${rule.max}个字符`
        isValid = false
      } else if (typeof value === 'number' && value > rule.max) {
        errors[field] = `${rule.label || field}不能大于${rule.max}`
        isValid = false
      }
    }
  }
  
  return { isValid, errors }
}

// 清除验证错误
export const clearValidationErrors = (errors, field) => {
  if (field) {
    delete errors[field]
  } else {
    Object.keys(errors).forEach(key => delete errors[key])
  }
  return errors
}

export default {
  isValidUrl,
  isValidEmail,
  isStrongPassword,
  isValidUsername,
  isValidPhone,
  validateTitle,
  validateDescription,
  validateTags,
  validateISBN,
  validateRating,
  validatePage,
  validateLimit,
  validateSearchQuery,
  validateFileSize,
  validateFileType,
  validateNumberRange,
  validateRequired,
  validateForm,
  clearValidationErrors
}