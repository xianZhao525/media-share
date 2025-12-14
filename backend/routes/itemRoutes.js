// backend/routes/itemRoutes.js - 正确的路由顺序
// const express = require('express');
// const router = express.Router();
// const db = require('../db/connection');
// const { ObjectId } = require('mongodb');

import express from 'express';
import db from '../db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
// ==================== 静态路由（必须放在动态路由之前） ====================

// 中间件：处理图片URL（添加代理前缀）
const processImageUrls = (req, res, next) => {
  // 保存原始send方法
  const originalSend = res.send;
  
  // 重写send方法
  res.send = function(data) {
    try {
      if (typeof data === 'string') {
        // 尝试解析JSON
        const parsed = JSON.parse(data);
        if (parsed.data && Array.isArray(parsed.data)) {
          // 处理数组数据
          parsed.data = parsed.data.map(item => {
            if (item.cover && item.cover.includes('doubanio.com')) {
              return {
                ...item,
                originalCover: item.cover,
                cover: `${req.protocol}://${req.get('host')}/api/proxy/image?url=${encodeURIComponent(item.cover)}&type=douban`
              };
            }
            return item;
          });
        } else if (parsed.data && parsed.data.cover) {
          // 处理单个对象
          if (parsed.data.cover.includes('doubanio.com')) {
            parsed.data = {
              ...parsed.data,
              originalCover: parsed.data.cover,
              cover: `${req.protocol}://${req.get('host')}/api/proxy/image?url=${encodeURIComponent(parsed.data.cover)}&type=douban`
            };
          }
        }
        data = JSON.stringify(parsed);
      }
    } catch (error) {
      console.error('处理图片URL时出错:', error);
    }
    
    // 调用原始的send方法
    originalSend.call(this, data);
  };
  
  next();
};

// 在所有路由上应用图片URL处理
router.use(processImageUrls);

// 1. 获取所有内容列表
router.get('/', async (req, res) => {
  try {
    console.log('📡 API [GET /]: 获取内容列表', req.query);
    
    // 确保数据库已连接
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    // 解析查询参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const tags = req.query.tags;
    const q = req.query.q;
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields;
    const status = req.query.status || 'active';
    
    // 构建查询条件
    const query = {};
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 类型筛选
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // 标签筛选
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.trim()) };
    }
    
    // 关键词搜索
    if (q && q.trim() !== '') {
      query.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { tags: { $regex: q.trim(), $options: 'i' } }
      ];
    }
    
    // 构建排序
    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = {};
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      
      // 处理字段映射
      let fieldName = sortField;
      switch (sortField) {
        case 'viewCount':
        case 'averageRating':
        case 'createdAt':
        case 'updatedAt':
        case 'releaseYear':
          fieldName = sortField;
          break;
        case 'hot':
          fieldName = 'viewCount';
          break;
        case 'rating':
          fieldName = 'averageRating';
          break;
        default:
          fieldName = 'createdAt';
      }
      
      sortObj[fieldName] = sortOrder;
    }
    
    // 构建字段投影
    let projection = {};
    if (fields && fields.trim() !== '') {
      const fieldList = fields.split(',').map(f => f.trim());
      fieldList.forEach(field => {
        projection[field] = 1;
      });
      
      // 确保始终包含_id字段
      if (!projection._id) {
        projection._id = 1;
      }
    }
    
    console.log('查询条件:', JSON.stringify(query, null, 2));
    console.log('排序条件:', JSON.stringify(sortObj, null, 2));
    
    // 执行查询
    let queryBuilder = itemsCollection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    
    // 应用字段投影
    if (Object.keys(projection).length > 0) {
      queryBuilder = queryBuilder.project(projection);
    }
    
    const items = await queryBuilder.toArray();
    const total = await itemsCollection.countDocuments(query);
    
    console.log(`✅ 返回 ${items.length} 条数据，总计 ${total} 条`);
    
    // 格式化返回的数据
    const formattedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      viewCount: item.viewCount || 0,
      averageRating: item.averageRating || 0,
      tags: item.tags || [],
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
    }));
    
    res.json({
      code: 200,
      data: {
        items: formattedItems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      message: '获取内容列表成功'
    });
  } catch (error) {
    console.error('❌ 获取内容列表错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 2. 获取热门内容
router.get('/hot', async (req, res) => {
  try {
    console.log('📡 API [GET /hot]: 获取热门内容', req.query);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    const limit = parseInt(req.query.limit) || 6;
    const type = req.query.type;
    
    // 构建查询条件
    const query = { status: 'active' };
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // 按观看次数和评分综合排序
    const items = await itemsCollection
      .find(query)
      .sort({ 
        viewCount: -1, 
        averageRating: -1,
        createdAt: -1 
      })
      .limit(limit)
      .toArray();
    
    console.log(`✅ 找到 ${items.length} 个热门内容`);
    
    // 格式化返回的数据
    const formattedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      viewCount: item.viewCount || 0,
      averageRating: item.averageRating || 0
    }));
    
    res.json({
      code: 200,
      data: formattedItems,
      message: '获取热门内容成功'
    });
  } catch (error) {
    console.error('❌ 获取热门内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 3. 获取最新内容
router.get('/latest', async (req, res) => {
  try {
    console.log('📡 API [GET /latest]: 获取最新内容', req.query);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    const limit = parseInt(req.query.limit) || 8;
    const type = req.query.type;
    
    // 构建查询条件
    const query = { status: 'active' };
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const items = await itemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    console.log(`✅ 找到 ${items.length} 个最新内容`);
    
    // 格式化返回的数据
    const formattedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
    }));
    
    res.json({
      code: 200,
      data: formattedItems,
      message: '获取最新内容成功'
    });
  } catch (error) {
    console.error('❌ 获取最新内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 4. 搜索内容
router.get('/search', async (req, res) => {
  try {
    console.log('📡 API [GET /search]: 搜索内容', req.query);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    const q = req.query.q;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '搜索关键词不能为空'
      });
    }
    
    const items = await itemsCollection
      .find({
        $or: [
          { title: { $regex: q.trim(), $options: 'i' } },
          { description: { $regex: q.trim(), $options: 'i' } },
          { tags: { $regex: q.trim(), $options: 'i' } }
        ],
        status: 'active'
      })
      .sort({ viewCount: -1 })
      .limit(limit)
      .toArray();
    
    console.log(`✅ 搜索到 ${items.length} 个结果`);
    
    // 格式化返回的数据
    const formattedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      viewCount: item.viewCount || 0,
      averageRating: item.averageRating || 0
    }));
    
    res.json({
      code: 200,
      data: formattedItems,
      message: '搜索成功'
    });
  } catch (error) {
    console.error('❌ 搜索内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 5. 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    console.log('📡 API [GET /stats]: 获取统计数据');
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    // 并行获取各种统计数据
    const [
      total,
      movies,
      tvShows,
      anime,
      variety
    ] = await Promise.all([
      itemsCollection.countDocuments({ status: 'active' }),
      itemsCollection.countDocuments({ type: 'movie', status: 'active' }),
      itemsCollection.countDocuments({ type: 'tv', status: 'active' }),
      itemsCollection.countDocuments({ type: 'anime', status: 'active' }),
      itemsCollection.countDocuments({ type: 'variety', status: 'active' })
    ]);
    
    // 获取总观看次数
    const viewResult = await itemsCollection.aggregate([
      { $match: { status: 'active', viewCount: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]).toArray();
    
    // 获取平均评分
    const ratingResult = await itemsCollection.aggregate([
      { $match: { status: 'active', averageRating: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$averageRating' } } }
    ]).toArray();
    
    const stats = {
      total,
      byType: {
        movie: movies,
        tv: tvShows,
        anime: anime,
        variety: variety,
        other: total - (movies + tvShows + anime + variety)
      },
      totalViews: viewResult.length > 0 ? viewResult[0].total : 0,
      averageRating: ratingResult.length > 0 ? parseFloat(ratingResult[0].avg.toFixed(1)) : 0,
      updatedAt: new Date().toISOString()
    };
    
    console.log('📊 统计数据:', stats);
    
    res.json({
      code: 200,
      data: stats,
      message: '获取统计数据成功'
    });
  } catch (error) {
    console.error('❌ 获取统计数据错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 6. 创建内容
router.post('/', async (req, res) => {
  try {
    console.log('📡 API [POST /]: 创建内容', req.body);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    // 验证必要字段
    if (!req.body.title || !req.body.type) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '标题和类型是必填字段'
      });
    }
    
    // 准备数据
    const itemData = {
      ...req.body,
      status: req.body.status || 'active',
      viewCount: 0,
      averageRating: 0,
      tags: req.body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 插入数据库
    const result = await itemsCollection.insertOne(itemData);
    
    const newItem = {
      ...itemData,
      _id: result.insertedId.toString()
    };
    
    console.log('✅ 创建内容成功:', newItem._id);
    
    res.status(201).json({
      code: 201,
      data: newItem,
      message: '创建内容成功'
    });
  } catch (error) {
    console.error('❌ 创建内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// ==================== 动态路由（放在静态路由之后） ====================

// 7. 获取相关内容
router.get('/:id/related', async (req, res) => {
  try {
    console.log('📡 API [GET /:id/related]: 获取相关内容', req.params.id);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'ID格式错误'
      });
    }
    
    // 先获取当前内容
    const currentItem = await itemsCollection.findOne({
      _id: new ObjectId(req.params.id),
      status: 'active'
    });
    
    if (!currentItem) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    // 查找相关内容（同类型或同标签）
    const relatedItems = await itemsCollection
      .find({
        _id: { $ne: new ObjectId(req.params.id) },
        status: 'active',
        $or: [
          { type: currentItem.type },
          { tags: { $in: currentItem.tags || [] } }
        ]
      })
      .sort({ viewCount: -1 })
      .limit(6)
      .toArray();
    
    console.log(`✅ 找到 ${relatedItems.length} 个相关内容`);
    
    // 格式化返回的数据
    const formattedItems = relatedItems.map(item => ({
      ...item,
      _id: item._id.toString(),
      viewCount: item.viewCount || 0,
      averageRating: item.averageRating || 0
    }));
    
    res.json({
      code: 200,
      data: formattedItems,
      message: '获取相关内容成功'
    });
  } catch (error) {
    console.error('❌ 获取相关内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 8. 获取内容详情
router.get('/:id', async (req, res) => {
  try {
    console.log('📡 API [GET /:id]: 获取内容详情', req.params.id);
    
    // 检查是否是特殊路由名称（额外保护）
    const specialRoutes = ['hot', 'latest', 'search', 'stats', 'related'];
    if (specialRoutes.includes(req.params.id)) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    // 验证ID格式
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'ID格式错误'
      });
    }
    
    const item = await itemsCollection.findOne({
      _id: new ObjectId(req.params.id),
      status: 'active'
    });
    
    if (!item) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    // 增加观看次数
    await itemsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { viewCount: 1 } }
    );
    
    console.log('✅ 获取内容详情成功:', req.params.id);
    
    // 格式化返回的数据
    const formattedItem = {
      ...item,
      _id: item._id.toString(),
      viewCount: (item.viewCount || 0) + 1,
      averageRating: item.averageRating || 0,
      tags: item.tags || [],
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
    };
    
    res.json({
      code: 200,
      data: formattedItem,
      message: '获取内容详情成功'
    });
  } catch (error) {
    console.error('❌ 获取内容详情错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 9. 更新内容
router.put('/:id', async (req, res) => {
  try {
    console.log('📡 API [PUT /:id]: 更新内容', req.params.id, req.body);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'ID格式错误'
      });
    }
    
    // 准备更新数据
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // 执行更新
    const result = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    console.log('✅ 更新内容成功:', req.params.id);
    
    // 格式化返回的数据
    const updatedItem = {
      ...result,
      _id: result._id.toString()
    };
    
    res.json({
      code: 200,
      data: updatedItem,
      message: '更新内容成功'
    });
  } catch (error) {
    console.error('❌ 更新内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

// 10. 删除内容（软删除）
router.delete('/:id', async (req, res) => {
  try {
    console.log('📡 API [DELETE /:id]: 删除内容', req.params.id);
    
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'ID格式错误'
      });
    }
    
    // 软删除：更新状态为 deleted
    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'deleted', updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    console.log('✅ 删除内容成功:', req.params.id);
    
    res.json({
      code: 200,
      data: null,
      message: '删除内容成功'
    });
  } catch (error) {
    console.error('❌ 删除内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误: ' + error.message
    });
  }
});

export default router; 