// backend/repositories/ItemRepository.js
const db = require('../db/connection');
const { ObjectId } = require('mongodb');

class ItemRepository {
  constructor() {
    this.collectionName = 'items';
  }

  // 创建内容
  async createItem(itemData) {
    try {
      const collection = db.getCollection(this.collectionName);
      
      // 处理用户ID
      let userId;
      if (itemData.userId && db.isValidObjectId(itemData.userId)) {
        userId = db.createObjectId(itemData.userId);
      } else {
        // 如果没有提供有效的userId，使用默认值（实际项目中应该从认证获取）
        userId = db.createObjectId();
      }

      const item = {
        ...itemData,
        userId,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      // 清理undefined字段
      Object.keys(item).forEach(key => {
        if (item[key] === undefined) {
          delete item[key];
        }
      });

      const result = await collection.insertOne(item);
      
      return {
        success: true,
        data: {
          _id: result.insertedId,
          ...item
        }
      };
    } catch (error) {
      console.error('Create item error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取内容列表
  async getItems(filters = {}) {
    try {
      const collection = db.getCollection(this.collectionName);
      
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        type = '',
        tag = '',
        userId = '',
        search = '',
        minRating = 0
      } = filters;

      // 构建查询条件
      const query = { status: 'active' };
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      if (tag) {
        query.tags = tag;
      }
      
      if (userId && db.isValidObjectId(userId)) {
        query.userId = db.createObjectId(userId);
      }
      
      if (minRating > 0) {
        query.averageRating = { $gte: parseFloat(minRating) };
      }
      
      if (search && search.trim()) {
        query.$text = { $search: search.trim() };
      }

      // 构建排序
      const sortOptions = {};
      switch(sortBy) {
        case 'viewCount':
          sortOptions.viewCount = sortOrder === 'desc' ? -1 : 1;
          break;
        case 'averageRating':
          sortOptions.averageRating = sortOrder === 'desc' ? -1 : 1;
          break;
        case 'likeCount':
          sortOptions.likeCount = sortOrder === 'desc' ? -1 : 1;
          break;
        default:
          sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
      }

      // 计算分页
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // 执行查询
      const cursor = collection.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      const items = await cursor.toArray();
      const total = await collection.countDocuments(query);

      return {
        success: true,
        data: {
          items,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            hasNext: pageNum < Math.ceil(total / limitNum),
            hasPrev: pageNum > 1
          }
        }
      };
    } catch (error) {
      console.error('Get items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取内容详情 - 修复ObjectId错误
  async getItemById(id) {
    try {
      // 验证ID
      if (!id || !db.isValidObjectId(id)) {
        return {
          success: false,
          error: '无效的内容ID'
        };
      }

      const collection = db.getCollection(this.collectionName);
      
      // 安全地创建ObjectId
      const objectId = db.createObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: '无效的内容ID格式'
        };
      }

      const item = await collection.findOne({ 
        _id: objectId,
        status: 'active'
      });

      if (!item) {
        return {
          success: false,
          error: '内容不存在或已被删除'
        };
      }

      // 增加观看次数
      await collection.updateOne(
        { _id: objectId },
        { $inc: { viewCount: 1 } }
      );

      return {
        success: true,
        data: item
      };
    } catch (error) {
      console.error('Get item by id error:', error);
      return {
        success: false,
        error: error.message.includes('ObjectId') 
          ? '内容ID格式不正确' 
          : error.message
      };
    }
  }

  // 获取热门内容
  async getHotItems(limit = 10, type = '') {
    try {
      const collection = db.getCollection(this.collectionName);
      
      const query = { 
        status: 'active',
        viewCount: { $gt: 0 }
      };
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      const items = await collection
        .find(query)
        .sort({ viewCount: -1, averageRating: -1 })
        .limit(parseInt(limit))
        .toArray();

      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Get hot items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取最新内容
  async getLatestItems(limit = 10, type = '') {
    try {
      const collection = db.getCollection(this.collectionName);
      
      const query = { status: 'active' };
      if (type && type !== 'all') {
        query.type = type;
      }
      
      const items = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();

      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Get latest items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 搜索内容
  async searchItems(searchTerm, options = {}) {
    try {
      const collection = db.getCollection(this.collectionName);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return {
          success: false,
          error: '搜索关键词不能为空'
        };
      }

      const {
        page = 1,
        limit = 20,
        type = '',
        minRating = 0
      } = options;

      const query = { 
        status: 'active',
        $text: { $search: searchTerm }
      };
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      if (minRating > 0) {
        query.averageRating = { $gte: parseFloat(minRating) };
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        collection
          .find(query)
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        collection.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          items,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            searchTerm
          }
        }
      };
    } catch (error) {
      console.error('Search items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取用户的内容 - 修复ObjectId错误
  async getUserItems(userId, options = {}) {
    try {
      // 验证用户ID
      if (!userId || !db.isValidObjectId(userId)) {
        return {
          success: false,
          error: '无效的用户ID'
        };
      }

      const collection = db.getCollection(this.collectionName);
      
      const {
        page = 1,
        limit = 20,
        type = ''
      } = options;

      const query = { 
        userId: db.createObjectId(userId),
        status: 'active'
      };
      
      if (type && type !== 'all') {
        query.type = type;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        collection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        collection.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          items,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      };
    } catch (error) {
      console.error('Get user items error:', error);
      return {
        success: false,
        error: error.message.includes('ObjectId')
          ? '用户ID格式不正确'
          : error.message
      };
    }
  }

  // 获取统计数据
  async getStats() {
    try {
      const collection = db.getCollection(this.collectionName);
      
      // 按类型统计
      const typeStats = await collection.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            avgRating: { $avg: '$averageRating' },
            avgViews: { $avg: '$viewCount' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).toArray();

      // 热门标签统计
      const tagStats = await collection.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]).toArray();

      // 总统计
      const totalStats = await collection.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            avgRating: { $avg: '$averageRating' }
          }
        }
      ]).toArray();

      return {
        success: true,
        data: {
          typeStats,
          tagStats,
          totalStats: totalStats[0] || {
            totalItems: 0,
            totalViews: 0,
            avgRating: 0
          }
        }
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 更新内容 - 修复ObjectId错误
  async updateItem(id, updateData, userId) {
    try {
      // 验证ID
      if (!id || !db.isValidObjectId(id)) {
        return {
          success: false,
          error: '无效的内容ID'
        };
      }

      if (!userId || !db.isValidObjectId(userId)) {
        return {
          success: false,
          error: '无效的用户ID'
        };
      }

      const collection = db.getCollection(this.collectionName);
      
      const itemId = db.createObjectId(id);
      const userIdObj = db.createObjectId(userId);

      // 检查内容是否存在且用户有权限
      const existingItem = await collection.findOne({ 
        _id: itemId,
        status: 'active'
      });

      if (!existingItem) {
        return {
          success: false,
          error: '内容不存在'
        };
      }

      // 检查权限（简化版，实际项目中需要更复杂的权限检查）
      if (existingItem.userId.toString() !== userIdObj.toString()) {
        return {
          success: false,
          error: '没有权限更新此内容'
        };
      }

      // 准备更新数据
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      };

      // 清理undefined字段
      Object.keys(update.$set).forEach(key => {
        if (update.$set[key] === undefined) {
          delete update.$set[key];
        }
      });

      const result = await collection.updateOne(
        { _id: itemId },
        update
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: '内容不存在'
        };
      }

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: '没有内容被修改'
        };
      }

      const updatedItem = await collection.findOne({ 
        _id: itemId 
      });

      return {
        success: true,
        data: updatedItem
      };
    } catch (error) {
      console.error('Update item error:', error);
      return {
        success: false,
        error: error.message.includes('ObjectId')
          ? 'ID格式不正确'
          : error.message
      };
    }
  }

  // 删除内容 - 修复ObjectId错误
  async deleteItem(id, userId) {
    try {
      // 验证ID
      if (!id || !db.isValidObjectId(id)) {
        return {
          success: false,
          error: '无效的内容ID'
        };
      }

      if (!userId || !db.isValidObjectId(userId)) {
        return {
          success: false,
          error: '无效的用户ID'
        };
      }

      const collection = db.getCollection(this.collectionName);
      
      const itemId = db.createObjectId(id);
      const userIdObj = db.createObjectId(userId);

      // 检查内容是否存在
      const existingItem = await collection.findOne({ 
        _id: itemId,
        status: 'active'
      });

      if (!existingItem) {
        return {
          success: false,
          error: '内容不存在'
        };
      }

      // 检查权限
      if (existingItem.userId.toString() !== userIdObj.toString()) {
        return {
          success: false,
          error: '没有权限删除此内容'
        };
      }

      // 软删除：更新状态
      const result = await collection.updateOne(
        { _id: itemId },
        { 
          $set: { 
            status: 'deleted',
            deletedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: '删除失败'
        };
      }

      return {
        success: true,
        message: '内容已删除'
      };
    } catch (error) {
      console.error('Delete item error:', error);
      return {
        success: false,
        error: error.message.includes('ObjectId')
          ? 'ID格式不正确'
          : error.message
      };
    }
  }

  // 获取相关内容
  async getRelatedItems(itemId, limit = 6) {
    try {
      // 验证ID
      if (!itemId || !db.isValidObjectId(itemId)) {
        return {
          success: false,
          error: '无效的内容ID'
        };
      }

      const collection = db.getCollection(this.collectionName);
      
      const currentItem = await collection.findOne({ 
        _id: db.createObjectId(itemId),
        status: 'active'
      });

      if (!currentItem) {
        return {
          success: false,
          error: '内容不存在'
        };
      }

      // 基于标签和类型查找相关内容
      const query = {
        _id: { $ne: db.createObjectId(itemId) },
        status: 'active'
      };

      // 如果有标签，优先使用标签匹配
      if (currentItem.tags && currentItem.tags.length > 0) {
        query.tags = { $in: currentItem.tags };
      } else {
        // 否则使用类型匹配
        query.type = currentItem.type;
      }

      const relatedItems = await collection
        .find(query)
        .sort({ viewCount: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();

      return {
        success: true,
        data: relatedItems
      };
    } catch (error) {
      console.error('Get related items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 插入示例数据
  async seedSampleData() {
    try {
      const collection = db.getCollection(this.collectionName);
      
      // 先清空集合（仅用于测试）
      await collection.deleteMany({});
      
      const sampleItems = [
        {
          title: "流浪地球2",
          type: "movie",
          description: "太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。",
          cover: "https://p9-pc-sign.douyinpic.com/obj/tos-cn-p-0015/7308e2f1c0ea49b48b7e36a07d5c82af?x-expires=2016860400&x-signature=Q2OD1ESn3BkO2WGT4Uoh%2FRpG%2BXc%3D",
          tags: ["科幻", "灾难", "吴京", "中国科幻", "太空"],
          userId: db.createObjectId(),
          viewCount: 12500000,
          likeCount: 980000,
          commentCount: 235000,
          averageRating: 9.2,
          releaseYear: 2023,
          duration: 173,
          details: {
            director: "郭帆",
            country: "中国",
            actors: ["吴京", "刘德华", "李雪健"]
          },
          createdAt: new Date("2023-01-22"),
          updatedAt: new Date("2023-01-22"),
          status: "active"
        },
        {
          title: "狂飙",
          type: "tv",
          description: "京海市一线刑警安欣，在与黑恶势力的斗争中，不断遭到保护伞的打击，始终无法将犯罪分子绳之以法。全国政法队伍教育整顿工作开展后，临江省派出指导组入驻京海，联合公检法司各部门，清除了政法队伍内部的腐败分子，粉碎了黑恶势力的保护伞，一举铲除了盘踞京海多年的强盛集团。",
          cover: "https://p3-pc-sign.douyinpic.com/tos-cn-p-0015/5f7c15c5cf694d9e88f5edc1d52a1357~tplv-dy-360p.jpeg?x-expires=2016860400&x-signature=cZr7TImF4HeRfqxNfrlfgCgOT7c%3D",
          tags: ["犯罪", "悬疑", "张译", "扫黑除恶", "反腐"],
          userId: db.createObjectId(),
          viewCount: 85000000,
          likeCount: 3500000,
          commentCount: 890000,
          averageRating: 9.5,
          releaseYear: 2023,
          totalEpisodes: 39,
          currentEpisode: 39,
          details: {
            director: "徐纪周",
            country: "中国",
            actors: ["张译", "张颂文", "李一桐"]
          },
          createdAt: new Date("2023-01-14"),
          updatedAt: new Date("2023-01-14"),
          status: "active"
        },
        {
          title: "漫长的季节",
          type: "tv",
          description: "小城桦林，此时，出租司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。是仇人还是故人？遇到了，就得有交代，给自己，也给儿子。",
          cover: "https://p6-pc-sign.douyinpic.com/tos-cn-p-0015/6b4f1f8a90a3433688d3ea0706909ee7~tplv-dy-360p.jpeg?x-expires=2016860400&x-signature=7O2QKUFdTvQQYwnxQUG3WHTxab0%3D",
          tags: ["悬疑", "犯罪", "范伟", "生活剧", "东北"],
          userId: db.createObjectId(),
          viewCount: 68000000,
          likeCount: 2800000,
          commentCount: 650000,
          averageRating: 9.4,
          releaseYear: 2023,
          totalEpisodes: 12,
          currentEpisode: 12,
          details: {
            director: "辛爽",
            country: "中国",
            actors: ["范伟", "秦昊", "陈明昊"]
          },
          createdAt: new Date("2023-04-22"),
          updatedAt: new Date("2023-04-22"),
          status: "active"
        },
        {
          title: "三体",
          type: "tv",
          description: "2007年，地球基础科学出现了异常的扰动，一时间科学界风雨飘飘，人心惶惶。离奇自杀的科学家，近乎神迹的倒计时，行事隐秘的科学边界，神秘莫测的《三体》游戏……纳米科学家汪淼被警官史强带到联合作战中心，并潜入名为'科学边界'的组织协助调查。",
          cover: "https://p26-pc-sign.douyinpic.com/tos-cn-p-0015/9ef89e86fc764f11a2dba34ba083c0fa~tplv-dy-360p.jpeg?x-expires=2016860400&x-signature=Z5j8sMgFep%2FVj6d4T2fC8R9QXaw%3D",
          tags: ["科幻", "刘慈欣", "小说改编", "宇宙", "硬科幻"],
          userId: db.createObjectId(),
          viewCount: 95000000,
          likeCount: 4200000,
          commentCount: 890000,
          averageRating: 8.7,
          releaseYear: 2023,
          totalEpisodes: 30,
          currentEpisode: 30,
          details: {
            director: "杨磊",
            country: "中国",
            actors: ["张鲁一", "于和伟", "陈瑾"]
          },
          createdAt: new Date("2023-01-15"),
          updatedAt: new Date("2023-01-15"),
          status: "active"
        }
      ];

      const result = await collection.insertMany(sampleItems);
      console.log(`✅ 插入 ${result.insertedCount} 条示例数据`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Seed data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ItemRepository();