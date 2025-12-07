// backend/services/itemService.js
const Item = require('../models/Item');

class ItemService {
  // 获取热门内容（按类型）
  async getHotItemsByType(type, limit = 10) {
    return await Item.aggregate([
      {
        $match: {
          type: type,
          status: 'approved',
          viewCount: { $gt: 10000 }
        }
      },
      {
        $sort: {
          viewCount: -1,
          likeCount: -1,
          rating: -1
        }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      {
        $unwind: {
          path: '$uploader',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          cover: 1,
          type: 1,
          rating: 1,
          viewCount: 1,
          likeCount: 1,
          description: 1,
          tags: 1,
          releaseYear: 1,
          'uploader.username': 1,
          'uploader.avatar': 1
        }
      }
    ]);
  }

  // 获取最新更新
  async getLatestUpdates(limit = 20) {
    return await Item.aggregate([
      {
        $match: {
          status: 'approved',
          updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $sort: {
          updatedAt: -1
        }
      },
      {
        $limit: limit
      },
      {
        $group: {
          _id: '$type',
          items: {
            $push: {
              id: '$_id',
              title: '$title',
              cover: '$cover',
              description: '$description',
              rating: '$rating',
              viewCount: '$viewCount',
              updatedAt: '$updatedAt'
            }
          }
        }
      }
    ]);
  }

  // 获取相关内容
  async getRelatedItems(itemId, limit = 8) {
    const item = await Item.findById(itemId);
    
    return await Item.aggregate([
      {
        $match: {
          _id: { $ne: item._id },
          status: 'approved',
          $or: [
            { tags: { $in: item.tags } },
            { type: item.type },
            { subType: item.subType },
            { 'actors.name': { $in: item.actors.map(a => a.name) } },
            { 'director.name': { $in: item.director.map(d => d.name) } }
          ]
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              { $size: { $setIntersection: ['$tags', item.tags] } },
              { $cond: [{ $eq: ['$type', item.type] }, 1, 0] },
              { $cond: [{ $eq: ['$subType', item.subType] }, 0.5, 0] },
              {
                $divide: [
                  {
                    $size: {
                      $setIntersection: [
                        '$actors.name',
                        item.actors.map(a => a.name)
                      ]
                    }
                  },
                  2
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          similarityScore: -1,
          viewCount: -1,
          rating: -1
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          title: 1,
          cover: 1,
          type: 1,
          description: 1,
          rating: 1,
          viewCount: 1,
          similarityScore: 1
        }
      }
    ]);
  }

  // 获取排行榜
  async getTopCharts(period = 'week', limit = 20) {
    const dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 1)) };
        break;
      case 'week':
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }
    
    return await Item.aggregate([
      {
        $match: {
          status: 'approved',
          ...dateFilter
        }
      },
      {
        $sort: {
          viewCount: -1,
          likeCount: -1,
          rating: -1
        }
      },
      {
        $limit: limit
      },
      {
        $group: {
          _id: '$type',
          items: {
            $push: {
              id: '$_id',
              title: '$title',
              cover: '$cover',
              rating: '$rating',
              viewCount: '$viewCount',
              likeCount: '$likeCount'
            }
          }
        }
      }
    ]);
  }

  // 获取统计数据
  async getStatistics() {
    return await Item.aggregate([
      {
        $match: {
          status: 'approved'
        }
      },
      {
        $facet: {
          // 按类型统计
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalViews: { $sum: '$viewCount' },
                totalLikes: { $sum: '$likeCount' },
                avgRating: { $avg: '$rating.platformScore' }
              }
            },
            { $sort: { count: -1 } }
          ],
          
          // 按年份统计
          byYear: [
            {
              $group: {
                _id: '$releaseYear',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating.platformScore' }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 10 }
          ],
          
          // 热门标签
          byTag: [
            { $unwind: '$tags' },
            {
              $group: {
                _id: '$tags',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating.platformScore' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          
          // 热门演员
          byActor: [
            { $unwind: '$actors' },
            {
              $group: {
                _id: '$actors.name',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating.platformScore' },
                totalViews: { $sum: '$viewCount' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 15 }
          ],
          
          // 总统计数据
          summary: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 },
                totalViews: { $sum: '$viewCount' },
                totalLikes: { $sum: '$likeCount' },
                totalCollects: { $sum: '$collectCount' },
                avgRating: { $avg: '$rating.platformScore' },
                avgDuration: { $avg: '$duration' }
              }
            }
          ]
        }
      }
    ]);
  }

  // 智能搜索
  async smartSearch(query, filters = {}, limit = 20) {
    const searchPipeline = [];
    
    // 全文搜索
    if (query) {
      searchPipeline.push({
        $match: {
          $text: { $search: query }
        }
      });
      
      searchPipeline.push({
        $addFields: {
          score: { $meta: 'textScore' }
        }
      });
    }
    
    // 应用筛选条件
    const matchStage = { status: 'approved' };
    
    if (filters.type) matchStage.type = filters.type;
    if (filters.subType) matchStage.subType = filters.subType;
    if (filters.country) matchStage.country = filters.country;
    if (filters.year) matchStage.releaseYear = filters.year;
    if (filters.minRating) matchStage['rating.platformScore'] = { $gte: filters.minRating };
    
    searchPipeline.push({
      $match: matchStage
    });
    
    // 排序
    const sortStage = {};
    if (query) {
      sortStage.score = -1;
    }
    
    if (filters.sort) {
      switch (filters.sort) {
        case 'hot':
          sortStage.viewCount = -1;
          break;
        case 'rating':
          sortStage['rating.platformScore'] = -1;
          break;
        case 'new':
          sortStage.createdAt = -1;
          break;
        case 'year':
          sortStage.releaseYear = -1;
          break;
      }
    } else {
      sortStage.createdAt = -1;
    }
    
    searchPipeline.push({
      $sort: sortStage
    });
    
    // 分页
    const skip = (filters.page - 1) * limit || 0;
    searchPipeline.push({
      $skip: skip
    });
    
    searchPipeline.push({
      $limit: limit
    });
    
    // 关联用户信息
    searchPipeline.push({
      $lookup: {
        from: 'users',
        localField: 'uploadedBy',
        foreignField: '_id',
        as: 'uploader'
      }
    });
    
    searchPipeline.push({
      $unwind: {
        path: '$uploader',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // 投影字段
    searchPipeline.push({
      $project: {
        title: 1,
        originalTitle: 1,
        cover: 1,
        type: 1,
        subType: 1,
        description: 1,
        summary: 1,
        rating: 1,
        viewCount: 1,
        likeCount: 1,
        tags: 1,
        releaseYear: 1,
        country: 1,
        duration: 1,
        score: 1,
        'uploader.username': 1,
        'uploader.avatar': 1
      }
    });
    
    // 执行搜索
    const [results, total] = await Promise.all([
      Item.aggregate(searchPipeline),
      Item.countDocuments(matchStage)
    ]);
    
    return {
      results,
      total,
      page: filters.page || 1,
      pages: Math.ceil(total / limit),
      limit
    };
  }
}

module.exports = new ItemService();