// backend/routes/activities.js
const express = require('express');
const router = express.Router();

// 这个函数接收 db 参数
module.exports = function(db) {
  
  // 获取所有活动
  router.get('/', async (req, res) => {
    try {
      const activities = await db.collection('activities').find().toArray();
      res.json({
        code: 200,
        data: activities,
        message: '获取活动列表成功'
      });
    } catch (err) {
      console.error('获取活动失败:', err);
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取活动列表失败'
      });
    }
  });

  // 创建新活动
  router.post('/', async (req, res) => {
    try {
      const result = await db.collection('activities').insertOne(req.body);
      res.json({
        code: 200,
        data: { _id: result.insertedId },
        message: '创建活动成功'
      });
    } catch (err) {
      console.error('创建活动失败:', err);
      res.status(500).json({
        code: 500,
        data: null,
        message: '创建活动失败'
      });
    }
  });

  return router;
};