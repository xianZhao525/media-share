// backend/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

module.exports = (db) => {
  const activityService = new (require('../services/ActivityService'))(db);

  // 1. 获取个人动态流 (需要登录)
  router.get('/feed', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, type } = req.query;
      
      const activities = await activityService.getUserFeed(
        userId, 
        parseInt(page), 
        parseInt(limit),
        type
      );
      
      res.json({
        code: 200,
        data: activities,
        message: '获取动态流成功',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await activityService.getFeedCount(userId)
        }
      });
    } catch (error) {
      console.error('获取动态流失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取动态流失败: ' + error.message
      });
    }
  });

  // 2. 获取指定用户的动态
  router.get('/users/:id/activities', async (req, res) => {
    try {
      const userId = req.params.id;
      const { page = 1, limit = 20 } = req.query;
      
      // 验证用户ID格式
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '无效的用户ID'
        });
      }
      
      const activities = await activityService.getUserActivities(
        userId, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.json({
        code: 200,
        data: activities,
        message: '获取用户动态成功',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await activityService.getActivityCount(userId)
        }
      });
    } catch (error) {
      console.error('获取用户动态失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取用户动态失败: ' + error.message
      });
    }
  });

  // 3. 创建动态 (内部接口，供其他服务调用)
  router.post('/', auth, async (req, res) => {
    try {
      const { type, objectId, targetId, content, images } = req.body;
      const userId = req.user.id;
      
      if (!['post', 'like', 'comment', 'follow', 'share'].includes(type)) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '无效的动态类型'
        });
      }
      
      let activityData = {
        type,
        actor: new ObjectId(userId),
        content: content || null
      };
      
      // 根据类型设置不同的字段
      if (objectId) {
        activityData.object = new ObjectId(objectId);
      }
      
      if (targetId) {
        activityData.target = new ObjectId(targetId);
      }
      
      if (images && images.length > 0) {
        activityData.images = images;
      }
      
      const activityId = await activityService.createActivity(activityData);
      
      // 获取完整动态数据返回
      const activity = await activityService.getActivityById(activityId);
      
      res.json({
        code: 200,
        data: activity,
        message: '创建动态成功'
      });
    } catch (error) {
      console.error('创建动态失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '创建动态失败: ' + error.message
      });
    }
  });

  // 4. 删除动态
  router.delete('/:id', auth, async (req, res) => {
    try {
      const activityId = req.params.id;
      const userId = req.user.id;
      
      // 验证动态ID格式
      if (!ObjectId.isValid(activityId)) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '无效的动态ID'
        });
      }
      
      // 检查是否有权限删除（只能删除自己的动态）
      const activity = await activityService.getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '动态不存在'
        });
      }
      
      if (activity.actor._id.toString() !== userId) {
        return res.status(403).json({
          code: 403,
          data: null,
          message: '无权删除此动态'
        });
      }
      
      const result = await activityService.deleteActivity(activityId);
      
      if (result) {
        res.json({
          code: 200,
          data: null,
          message: '删除动态成功'
        });
      } else {
        res.status(404).json({
          code: 404,
          data: null,
          message: '动态不存在'
        });
      }
    } catch (error) {
      console.error('删除动态失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '删除动态失败: ' + error.message
      });
    }
  });

  // 5. 点赞/取消点赞动态
  router.post('/:id/like', auth, async (req, res) => {
    try {
      const activityId = req.params.id;
      const userId = req.user.id;
      
      const result = await activityService.toggleLike(activityId, userId);
      
      res.json({
        code: 200,
        data: {
          isLiked: result.isLiked,
          likeCount: result.likeCount
        },
        message: result.isLiked ? '点赞成功' : '取消点赞成功'
      });
    } catch (error) {
      console.error('点赞操作失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '操作失败: ' + error.message
      });
    }
  });

  // 6. 获取动态评论
  router.get('/:id/comments', async (req, res) => {
    try {
      const activityId = req.params.id;
      const { page = 1, limit = 20 } = req.query;
      
      const comments = await activityService.getActivityComments(
        activityId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        code: 200,
        data: comments,
        message: '获取评论成功',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取评论失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取评论失败: ' + error.message
      });
    }
  });

  // 7. 添加评论
  router.post('/:id/comments', auth, async (req, res) => {
    try {
      const activityId = req.params.id;
      const userId = req.user.id;
      const { content, parentId } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '评论内容不能为空'
        });
      }
      
      const comment = await activityService.addComment(
        activityId,
        userId,
        content.trim(),
        parentId
      );
      
      res.json({
        code: 200,
        data: comment,
        message: '评论成功'
      });
    } catch (error) {
      console.error('添加评论失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '添加评论失败: ' + error.message
      });
    }
  });

  // 8. 获取动态统计信息
  router.get('/stats/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const stats = await activityService.getUserActivityStats(userId);
      
      res.json({
        code: 200,
        data: stats,
        message: '获取统计信息成功'
      });
    } catch (error) {
      console.error('获取统计信息失败:', error);
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取统计信息失败: ' + error.message
      });
    }
  });

  return router;
};