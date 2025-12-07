// backend/models/Item.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 演员/导演/编剧信息子文档
const PersonSchema = new Schema({
  name: String,
  role: String, // actor/director/writer/producer
  avatar: String,
  character: String // 饰演角色
});

// 集数信息子文档
const EpisodeSchema = new Schema({
  episodeNumber: Number,
  title: String,
  duration: Number, // 分钟
  airDate: Date,
  description: String,
  thumbnail: String,
  url: String
});

// 评分信息子文档
const RatingSchema = new Schema({
  source: String, // 'douban', 'imdb', 'platform'
  score: Number,
  count: Number, // 评价人数
  link: String
});

const ItemSchema = new Schema({
  // 基本信息
  title: {
    type: String,
    required: [true, '标题不能为空'],
    maxlength: [100, '标题不能超过100个字符'],
    trim: true,
    index: true
  },
  originalTitle: String, // 原标题
  type: {
    type: String,
    required: [true, '内容类型不能为空'],
    enum: ['movie', 'tv', 'variety', 'anime', 'documentary', 'short', 'live'],
    index: true
  },
  subType: {
    type: String,
    enum: [
      'action', 'comedy', 'romance', 'sci-fi', 'fantasy', 
      'horror', 'drama', 'crime', 'thriller', 'adventure',
      'family', 'music', 'sport', 'war', 'history', 'reality'
    ]
  },
  // 多媒体信息
  cover: {
    type: String,
    required: [true, '封面图不能为空'],
    default: '/default-cover.jpg'
  },
  poster: String, // 海报图
  thumbnails: [String], // 缩略图集
  trailer: String, // 预告片URL
  videoUrl: String, // 正片URL
  duration: Number, // 总时长（分钟）
  episodes: [EpisodeSchema], // 剧集列表
  totalEpisodes: Number, // 总集数
  currentEpisode: Number, // 当前更新到第几集
  
  // 描述信息
  description: {
    type: String,
    required: [true, '描述不能为空'],
    maxlength: [2000, '描述不能超过2000个字符']
  },
  summary: String, // 简短摘要
  tags: [{
    type: String,
    index: true
  }],
  releaseYear: Number,
  releaseDate: Date,
  country: [String], // 国家/地区
  language: [String], // 语言
  
  // 演职员信息
  director: [PersonSchema],
  actors: [PersonSchema],
  writer: [PersonSchema],
  
  // 评分信息
  rating: {
    platformScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    platformVotes: {
      type: Number,
      default: 0
    },
    externalRatings: [RatingSchema],
    averageScore: Number // 综合评分
  },
  
  // 统计信息
  viewCount: {
    type: Number,
    default: 0,
    index: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  collectCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  
  // 播放信息
  playCount: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // 推荐信息
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isHot: {
    type: Boolean,
    default: false,
    index: true
  },
  isRecommended: {
    type: Boolean,
    default: false,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // 限制信息
  ageLimit: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-MA'],
    default: 'G'
  },
  resolution: [String], // ['1080p', '4K', 'HDR']
  audioTracks: [String], // ['中文', '英文', '日文']
  subtitles: [String], // ['简体中文', '繁体中文', '英文']
  
  // 关联信息
  relatedItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }],
  seriesId: {
    type: Schema.Types.ObjectId,
    ref: 'Series'
  },
  
  // 上传者信息
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // 审核状态
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段
ItemSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// 文本索引
ItemSchema.index({
  title: 'text',
  originalTitle: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    originalTitle: 8,
    description: 5,
    tags: 3
  },
  name: 'item_text_index'
});

// 复合索引
ItemSchema.index({ type: 1, isFeatured: 1, sortOrder: -1 });
ItemSchema.index({ type: 1, isHot: 1, viewCount: -1 });
ItemSchema.index({ type: 1, releaseYear: -1, rating: -1 });
ItemSchema.index({ uploadedBy: 1, createdAt: -1 });
ItemSchema.index({ status: 1, createdAt: -1 });

// 静态方法
ItemSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    status: 'approved' 
  })
  .sort({ sortOrder: -1, createdAt: -1 })
  .limit(limit)
  .populate('uploadedBy', 'username avatar');
};

ItemSchema.statics.findHot = function(type = null, limit = 20) {
  const query = { 
    isHot: true, 
    status: 'approved' 
  };
  if (type) query.type = type;
  
  return this.find(query)
  .sort({ viewCount: -1, likeCount: -1 })
  .limit(limit)
  .populate('uploadedBy', 'username avatar');
};

ItemSchema.statics.findRecommended = function(userId, limit = 20) {
  // 这里可以添加推荐算法
  return this.find({ 
    isRecommended: true, 
    status: 'approved',
    uploadedBy: { $ne: userId } // 不推荐自己上传的
  })
  .sort({ rating: -1, viewCount: -1 })
  .limit(limit)
  .populate('uploadedBy', 'username avatar');
};

// 实例方法
ItemSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  this.playCount.total += 1;
  this.playCount.today += 1;
  
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 每周每月统计更新
  if (this.updatedAt < startOfWeek) {
    this.playCount.week = 0;
  }
  if (this.updatedAt < startOfMonth) {
    this.playCount.month = 0;
  }
  
  this.playCount.week += 1;
  this.playCount.month += 1;
  
  return this.save();
};

ItemSchema.methods.updateRating = async function(newScore) {
  const totalScore = this.rating.platformScore * this.rating.platformVotes + newScore;
  this.rating.platformVotes += 1;
  this.rating.platformScore = totalScore / this.rating.platformVotes;
  
  // 更新综合评分
  if (this.rating.externalRatings.length > 0) {
    const externalAvg = this.rating.externalRatings.reduce((sum, r) => sum + r.score, 0) / this.rating.externalRatings.length;
    this.rating.averageScore = (this.rating.platformScore * 0.6 + externalAvg * 0.4);
  } else {
    this.rating.averageScore = this.rating.platformScore;
  }
  
  return this.save();
};

ItemSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('viewCount')) {
    // 自动设置热门标志
    if (this.viewCount > 10000) {
      this.isHot = true;
    }
    
    // 自动设置推荐标志
    if (this.rating.platformScore >= 8.0 && this.viewCount > 5000) {
      this.isRecommended = true;
    }
  }
  
  if (this.isModified('episodes')) {
    this.totalEpisodes = this.episodes.length;
    this.currentEpisode = this.totalEpisodes;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', ItemSchema);