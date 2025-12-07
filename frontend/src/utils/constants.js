// 应用常量定义
export const APP_CONSTANTS = {
  // 应用名称
  APP_NAME: '媒体分享平台',
  APP_VERSION: '1.0.0',
  
  // 内容类型
  ITEM_TYPES: {
    BOOK: 'book',
    MOVIE: 'movie',
    MUSIC: 'music'
  },
  
  // 内容类型标签
  ITEM_TYPE_LABELS: {
    book: '书籍',
    movie: '电影',
    music: '音乐'
  },
  
  // 内容类型图标
  ITEM_TYPE_ICONS: {
    book: '📚',
    movie: '🎬',
    music: '🎵'
  },
  
  // 默认封面图片
  DEFAULT_COVERS: {
    book: '/default-book.jpg',
    movie: '/default-movie.jpg',
    music: '/default-music.jpg',
    default: '/default.jpg'
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
  },
  
  // 搜索配置
  SEARCH: {
    MIN_QUERY_LENGTH: 1,
    MAX_QUERY_LENGTH: 100,
    SUGGESTION_LIMIT: 5
  },
  
  // 表单验证
  VALIDATION: {
    TITLE_MIN_LENGTH: 2,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 500,
    MAX_TAGS: 10,
    MAX_TAG_LENGTH: 20
  },
  
  // 缓存配置
  CACHE: {
    SEARCH_HISTORY_MAX: 10,
    LOCAL_STORAGE_KEYS: {
      SEARCH_HISTORY: 'searchHistory',
      USER_PREFERENCES: 'userPreferences',
      CART_ITEMS: 'cartItems'
    }
  },
  
  // API配置
  API: {
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  },
  
  // 路由配置
  ROUTES: {
    HOME: '/',
    EXPLORE: '/explore',
    CREATE: '/create',
    SEARCH: '/search',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    ITEM_DETAIL: '/item/:id',
    ITEM_EDIT: '/item/:id/edit',
    NOT_FOUND: '/404'
  },
  
  // 本地存储键
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_INFO: 'user_info',
    THEME_MODE: 'theme_mode',
    LANGUAGE: 'language'
  },
  
  // 主题颜色
  THEME_COLORS: {
    PRIMARY: '#007bff',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40'
  }
}

// 错误消息
export const ERROR_MESSAGES = {
  // 网络错误
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  SERVER_ERROR: '服务器错误，请稍后重试',
  
  // 验证错误
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_EMAIL: '请输入有效的邮箱地址',
  INVALID_URL: '请输入有效的URL地址',
  PASSWORD_TOO_SHORT: '密码至少需要6个字符',
  PASSWORD_MISMATCH: '两次输入的密码不一致',
  
  // 内容相关错误
  TITLE_REQUIRED: '标题不能为空',
  TITLE_TOO_SHORT: '标题至少需要2个字符',
  TITLE_TOO_LONG: '标题不能超过100个字符',
  DESCRIPTION_REQUIRED: '描述不能为空',
  DESCRIPTION_TOO_SHORT: '描述至少需要10个字符',
  DESCRIPTION_TOO_LONG: '描述不能超过500个字符',
  INVALID_ITEM_TYPE: '无效的内容类型',
  
  // 认证错误
  LOGIN_FAILED: '登录失败，请检查用户名和密码',
  REGISTER_FAILED: '注册失败，请稍后重试',
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '没有权限执行此操作',
  SESSION_EXPIRED: '登录已过期，请重新登录'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  // 内容操作
  ITEM_CREATED: '内容创建成功',
  ITEM_UPDATED: '内容更新成功',
  ITEM_DELETED: '内容删除成功',
  
  // 用户操作
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  PROFILE_UPDATED: '个人资料更新成功',
  
  // 通用操作
  OPERATION_SUCCESS: '操作成功',
  DATA_SAVED: '数据保存成功',
  SETTINGS_UPDATED: '设置更新成功'
}

// 提示消息
export const INFO_MESSAGES = {
  NO_DATA: '暂无数据',
  LOADING: '加载中...',
  SEARCHING: '搜索中...',
  PROCESSING: '处理中...',
  PLEASE_WAIT: '请稍候...'
}

// 确认消息
export const CONFIRM_MESSAGES = {
  DELETE_ITEM: '确定要删除这个内容吗？此操作不可恢复。',
  LEAVE_PAGE: '您有未保存的修改，确定要离开吗？',
  CLEAR_HISTORY: '确定要清除所有搜索历史吗？',
  LOGOUT: '确定要退出登录吗？'
}