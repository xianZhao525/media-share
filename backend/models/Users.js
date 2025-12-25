// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 基本信息
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200
  },
  coverImage: {
    type: String,
    default: ''
  },
  
  // 社交系统
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 内容互动
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  history: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 社交链接
  social: {
    github: { type: String, default: '' },
    weibo: { type: String, default: '' },
    wechat: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  
  // 用户偏好
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'zh-CN' },
    notificationEnabled: { type: Boolean, default: true }
  },
  
  // 统计数据
  stats: {
    itemsCount: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 }
  },
  
  // 系统字段
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // 自动管理createdAt和updatedAt
});

// 创建索引以提高查询性能
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'following': 1 });
userSchema.index({ 'followers': 1 });
userSchema.index({ 'favorites': 1 });

// 更新统计数据的中间件
userSchema.pre('save', function(next) {
  if (this.isModified('following')) {
    this.stats.followingCount = this.following.length;
  }
  if (this.isModified('followers')) {
    this.stats.followersCount = this.followers.length;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);