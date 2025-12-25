import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../db/connection.js';
import { ObjectId } from 'mongodb';

// 导入认证中间件（已修复为 ES Module）
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// 用户注册 - 使用 MongoDB 原生驱动
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDB();

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '请提供用户名、邮箱和密码',
        data: null
      });
    }

    // 检查用户是否已存在
    const existingUser = await db.collection('users').findOne({
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

    // 创建新用户文档
    const newUserDoc = {
      username,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      following: [],
      followers: [],
      favorites: [],
      history: [],
      social: {},
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        notificationEnabled: true
      },
      stats: {
        itemsCount: 0,
        reviewsCount: 0,
        followersCount: 0,
        followingCount: 0
      },
      role: 'user',
      status: 'active',
      emailVerified: false,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 插入用户到数据库
    const result = await db.collection('users').insertOne(newUserDoc);

    if (!result.insertedId) {
      throw new Error('用户创建失败');
    }

    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        username: newUserDoc.username,
        email: newUserDoc.email
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌（不包含密码）
    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        user: {
          id: result.insertedId.toString(),
          username: newUserDoc.username,
          email: newUserDoc.email,
          avatar: newUserDoc.avatar,
          createdAt: newUserDoc.createdAt
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

// 用户登录 - 使用 MongoDB 原生驱动
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: '请提供邮箱和密码',
        data: null
      });
    }

    // 查找用户
    const user = await db.collection('users').findOne({ email });
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
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: user._id.toString(),
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
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
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

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } } // 排除密码字段
    );

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

export default router;