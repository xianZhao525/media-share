// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth'); // 需要创建auth中间件

/**
 * GET /api/profile - 获取当前用户资料
 */
router.get('/profile', authenticateToken, async (req, res) => {
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
 * PUT /api/profile - 更新当前用户资料
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio, avatar, social } = req.body;
    const updateData = {};
    
    // 只允许更新特定字段
    if (username !== undefined) {
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({
          code: 400,
          message: '用户名长度应为2-20位字符',
          data: null
        });
      }
      // 检查用户名是否已被占用（排除自己）
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: '用户名已被使用',
          data: null
        });
      }
      updateData.username = username;
    }
    
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (social !== undefined) updateData.social = social;
    
    updateData.updatedAt = new Date();
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, select: '-password -__v' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        code: 404, 
        message: '用户不存在',
        data: null 
      });
    }
    
    res.json({
      code: 200,
      message: '资料更新成功',
      data: { user: updatedUser }
    });
    
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器错误',
      data: null 
    });
  }
});

/**
 * GET /api/users/:id - 获取用户公开信息
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username avatar bio createdAt following followers')
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
 * POST /api/users/:id/follow - 关注用户
 */
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;
    
    // 不能关注自己
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        code: 400,
        message: '不能关注自己',
        data: null
      });
    }
    
    // 检查目标用户是否存在
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        code: 404,
        message: '目标用户不存在',
        data: null
      });
    }
    
    // 使用$addToSet避免重复关注
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
 * DELETE /api/users/:id/follow - 取消关注用户
 */
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;
    
    // 使用$pull移除关注
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

module.exports = router;