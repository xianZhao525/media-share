// backend/routes/auth.js (修改现有文件)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// 用户注册 - 修改为统一响应格式
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ 
        code: 400, 
        message: '请提供用户名、邮箱和密码',
        data: null 
      });
    }
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        code: 400, 
        message: '邮箱或用户名已被注册',
        data: null 
      });
    }
    
    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      createdAt: new Date()
    });
    
    // 保存用户到数据库
    const savedUser = await newUser.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: savedUser._id,
        username: savedUser.username,
        email: savedUser.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息和令牌（不返回密码）
    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          avatar: savedUser.avatar,
          createdAt: savedUser.createdAt
        },
        token
      }
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器错误，请稍后重试',
      data: null 
    });
  }
});

// 用户登录 - 修改为统一响应格式
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ 
        code: 400, 
        message: '请提供邮箱和密码',
        data: null 
      });
    }
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        code: 401, 
        message: '邮箱或密码错误',
        data: null 
      });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        code: 401, 
        message: '邮箱或密码错误',
        data: null 
      });
    }
    
    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息和令牌
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt
        },
        token
      }
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器错误，请稍后重试',
      data: null 
    });
  }
});

// 获取当前用户信息 - 修改为统一响应格式
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
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
      message: '服务器错误，请稍后重试',
      data: null 
    });
  }
});

// 保留其他路由，但确保响应格式一致
// 修改密码、更新信息等路由...

module.exports = router;