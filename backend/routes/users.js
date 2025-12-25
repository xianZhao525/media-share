// backend/routes/users.js
import express from 'express';
import User from '../models/User.js';
import authenticateToken from '../middleware/auth.js';
import { getDB } from '../db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * GET /api/users/me - 获取当前登录用户的完整信息
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -__v')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: { user }
    });

  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/:id - 获取任意用户的公开信息
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('username avatar bio createdAt following followers favorites stats')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: { user }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/me/stats - 获取当前用户的统计数据
 */
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('following followers favorites stats');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // ✅ 安全访问嵌套属性
    const stats = {
      following: user.following?.length || 0,
      followers: user.followers?.length || 0,
      collections: user.favorites?.length || 0,
      activities: user.stats?.itemsCount || 0
    };

    res.json({
      code: 200,
      message: '获取成功',
      data: { stats }
    });

  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/:id/stats - 获取任意用户的统计数据
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('following followers favorites stats');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // ✅ 安全访问嵌套属性
    const stats = {
      following: user.following?.length || 0,
      followers: user.followers?.length || 0,
      collections: user.favorites?.length || 0,
      activities: user.stats?.itemsCount || 0
    };

    res.json({
      code: 200,
      message: '获取成功',
      data: { stats }
    });

  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/me/activities - 获取当前用户的动态
 */
router.get('/me/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await getDB().collection('activities')
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({
      code: 200,
      message: '获取成功',
      data: { activities }
    });

  } catch (error) {
    console.error('获取动态错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/:id/activities - 获取任意用户的动态
 */
router.get('/:id/activities', async (req, res) => {
  try {
    const userId = req.params.id;

    const activities = await getDB().collection('activities')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({
      code: 200,
      message: '获取成功',
      data: { activities }
    });

  } catch (error) {
    console.error('获取动态错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * ✅ 新增：GET /api/users/me/collections - 获取当前用户的收藏
 */
router.get('/me/collections', authenticateToken, async (req, res) => {
  try {
    // 1. 先获取用户文档，找到 favorites 数组
    const user = await User.findById(req.user.userId).select('favorites');

    if (!user || !user.favorites || user.favorites.length === 0) {
      return res.json({
        code: 200,
        message: '获取成功',
        data: { collections: [] }
      });
    }

    // 2. 根据收藏的内容ID查询内容详情
    const collections = await getDB().collection('items')
      .find({ _id: { $in: user.favorites.map(id => new ObjectId(id)) } })
      .limit(20)
      .toArray();

    res.json({
      code: 200,
      message: '获取成功',
      data: { collections }
    });

  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * ✅ 新增：GET /api/users/:id/collections - 获取任意用户的收藏
 */
router.get('/:id/collections', async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. 先获取用户文档
    const user = await User.findById(userId).select('favorites');

    if (!user || !user.favorites || user.favorites.length === 0) {
      return res.json({
        code: 200,
        message: '获取成功',
        data: { collections: [] }
      });
    }

    // 2. 查询收藏的内容详情
    const collections = await getDB().collection('items')
      .find({ _id: { $in: user.favorites.map(id => new ObjectId(id)) } })
      .limit(20)
      .toArray();

    res.json({
      code: 200,
      message: '获取成功',
      data: { collections }
    });

  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * POST /api/users/:id/follow - 关注用户（需要认证）
 */
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        code: 400,
        message: '不能关注自己',
        data: null
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        code: 404,
        message: '目标用户不存在',
        data: null
      });
    }

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { following: targetUserId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: currentUserId } }
    );

    res.json({
      code: 200,
      message: '关注成功',
      data: {
        followingCount: currentUser.following.length
      }
    });

  } catch (error) {
    console.error('关注用户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * DELETE /api/users/:id/follow - 取消关注用户（需要认证）
 */
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: targetUserId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: currentUserId } }
    );

    res.json({
      code: 200,
      message: '取消关注成功',
      data: {
        followingCount: currentUser.following.length
      }
    });

  } catch (error) {
    console.error('取消关注错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/:id/following - 获取用户的关注列表
 */
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('following')
      .populate('following', 'username avatar bio createdAt');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        following: user.following,
        count: user.following.length
      }
    });

  } catch (error) {
    console.error('获取关注列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/users/:id/followers - 获取用户的粉丝列表
 */
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followers')
      .populate('followers', 'username avatar bio createdAt');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        followers: user.followers,
        count: user.followers.length
      }
    });

  } catch (error) {
    console.error('获取粉丝列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

export default router;