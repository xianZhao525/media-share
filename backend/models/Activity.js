// models/Activity.js
const { ObjectId } = require('mongodb');

class ActivityModel {
  constructor(db) {
    this.collection = db.collection('activities');
    this.db = db;
  }

  // 模拟数据（用于测试）
  static getMockActivities() {
    return [
      {
        _id: '1',
        userId: 'user123',
        username: '张三',
        avatar: 'https://placehold.co/100x100',
        type: 'review',
        content: '评论了电影《肖申克的救赎》',
        item: {
          title: '肖申克的救赎',
          cover: 'https://placehold.co/200x300',
          type: 'movie'
        },
        likeCount: 15,
        commentCount: 3,
        createdAt: new Date(),
        isLiked: false
      },
      {
        _id: '2',
        userId: 'user456',
        username: '李四',
        avatar: 'https://placehold.co/100x100',
        type: 'follow',
        content: '关注了王五',
        targetUser: {
          username: '王五',
          avatar: 'https://placehold.co/100x100'
        },
        likeCount: 5,
        commentCount: 1,
        createdAt: new Date(Date.now() - 3600000), // 1小时前
        isLiked: true
      }
    ];
  }

  // 获取用户动态流
  async getUserFeed(userId, page = 1, limit = 10) {
    try {
      // 如果有数据库连接，查询真实数据
      if (this.collection) {
        const skip = (page - 1) * limit;
        const activities = await this.collection
          .find({ userId: new ObjectId(userId) })
          .skip(skip)
          .limit(limit)
          .toArray();
        return activities;
      }
    } catch (error) {
      console.log('使用模拟数据:', error.message);
    }
    
    // 返回模拟数据
    return ActivityModel.getMockActivities();
  }

  // 获取用户动态
  async getUserActivities(userId, page = 1, limit = 10) {
    return this.getUserFeed(userId, page, limit);
  }
}

module.exports = ActivityModel;