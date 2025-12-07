// backend/routes/itemRoutes.js - 简化版本
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { ObjectId } = require('mongodb');

// 获取所有内容 - 简化版本
router.get('/', async (req, res) => {
  try {
    console.log('📡 API: 获取内容列表');
    
    // 确保数据库已连接
    if (!db.isConnected) {
      await db.connect();
    }
    
    const itemsCollection = db.getCollection('items');
    
    // 调试：先获取所有数据
    const allItems = await itemsCollection.find({}).toArray();
    console.log(`数据库中找到 ${allItems.length} 条数据`);
    
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // 查询条件 - 简化，不添加任何筛选
    const query = {};
    
    // 获取分页数据
    const items = await itemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 获取总数
    const total = await itemsCollection.countDocuments(query);
    
    console.log(`返回 ${items.length} 条数据`);
    
    res.json({
      code: 200,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      message: '获取成功'
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

// 获取热门内容
router.get('/hot', async (req, res) => {
  try {
    console.log('📡 API: 获取热门内容');
    
    const itemsCollection = db.getCollection('items');
    
    // 查询热门内容
    const items = await itemsCollection
      .find({ isHot: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .toArray();
    
    console.log(`找到 ${items.length} 个热门内容`);
    
    res.json({
      code: 200,
      data: items,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取热门内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误'
    });
  }
});

router.get('/latest', async (req, res) => {
  try {
    console.log('📡 API: 获取最新内容');
    
    const itemsCollection = db.getCollection('items');
    
    const limit = parseInt(req.query.limit) || 10;
    
    const items = await itemsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    res.json({
      code: 200,
      data: items,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取最新内容错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误'
    });
  }
});

// 获取内容详情
router.get('/:id', async (req, res) => {
  try {
    const itemsCollection = db.getCollection('items');
    
    if (!db.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'ID格式错误'
      });
    }
    
    const item = await itemsCollection.findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!item) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '内容不存在'
      });
    }
    
    res.json({
      code: 200,
      data: item,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取内容详情错误:', error);
    res.status(500).json({
      code: 500,
      data: null,
      message: '服务器错误'
    });
  }
});

module.exports = router;