import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 格式化时间
export const formatDate = {
  // 相对时间
  relative(date) {
    return dayjs(date).fromNow();
  },
  
  // 标准格式
  standard(date) {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  },
  
  // 仅日期
  dateOnly(date) {
    return dayjs(date).format('YYYY-MM-DD');
  },
  
  // 短格式
  short(date) {
    return dayjs(date).format('MM-DD HH:mm');
  }
};

// 文本截断
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 生成随机ID
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 复制到剪贴板
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};

// 获取内容类型标签
export const getItemTypeLabel = (type) => {
  const typeMap = {
    book: '书籍',
    movie: '电影',
    music: '音乐'
  };
  return typeMap[type] || '未知';
};

// 获取内容类型图标
export const getItemTypeIcon = (type) => {
  const iconMap = {
    book: '📚',
    movie: '🎬',
    music: '🎵'
  };
  return iconMap[type] || '📄';
};

// 获取默认封面
export const getDefaultCover = (type) => {
  const covers = {
    book: '/default-book.jpg',
    movie: '/default-movie.jpg',
    music: '/default-music.jpg'
  };
  return covers[type] || '/default.jpg';
};

// 处理图片加载错误
export const handleImageError = (event, type) => {
  event.target.src = getDefaultCover(type);
  event.target.onerror = null; // 防止无限循环
};

// 生成标签颜色
export const getTagColor = (tag) => {
  const colors = [
    'var(--primary-color)',
    'var(--success-color)',
    'var(--warning-color)',
    'var(--danger-color)',
    'var(--info-color)',
    'var(--secondary-color)'
  ];
  const index = tag.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// 验证URL
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return false;
  }
};

// 数组分块
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// 深度合并对象
export const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target, source);
  return target;
};