import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';
import { createRequire } from 'module';
import itemRoutes from './routes/itemRoutes.js';

// ES 模块中获取 __dirname 的等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 require 函数
const require = createRequire(import.meta.url);

// 使用 import 导入 ES Module
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();

// 动态导入数据库连接
let db;
try {
  const dbModule = await import('./db/connection.js');
  db = dbModule.default || dbModule;
} catch (error) {
  console.error('❌ 导入数据库模块失败:', error);
  process.exit(1);
}

// const app = express();
// const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// API路由
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 创建测试数据的函数
const createTestData = async () => {
  try {
    const itemsCollection = db.getCollection('items');
    const count = await itemsCollection.countDocuments({});

    console.log(`📊 当前数据库有 ${count} 条数据`);

    // 如果数据少于10条，创建测试数据
    if (count < 10) {
      console.log('📝 创建测试数据...');

      const testItems = [
        // 电影数据
        {
          title: '流浪地球',
          description: '中国科幻电影巨作，太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。',
          type: 'movie',
          cover: '/images/movies/1.jpeg',
          viewCount: 1050000,
          averageRating: 4.5,
          tags: ['科幻', '灾难', '中国', '吴京'],
          status: 'active',
          releaseYear: 2019,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15')
        },
        // ... 其他测试数据保持不变
      ];

      // 插入测试数据
      const result = await itemsCollection.insertMany(testItems);
      const newCount = await itemsCollection.countDocuments({});
      console.log(`✅ 创建了 ${result.insertedCount} 条测试数据`);
      console.log(`✅ 现在数据库共有 ${newCount} 条数据`);
    } else {
      console.log(`✅ 数据库已有 ${count} 条数据，无需创建测试数据`);
    }
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Media Share API',
    database: db.isConnected ? 'connected' : 'disconnected'
  });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    message: "Media Share API",
    version: "1.0.0",
    endpoints: {
      items: {
        GET: [
          "/api/items - 获取内容列表",
          "/api/items/hot - 获取热门内容",
          "/api/items/latest - 获取最新内容",
          "/api/items/search?q=关键词 - 搜索内容",
          "/api/items/stats - 获取统计数据",
          "/api/items/:id - 获取内容详情",
          "/api/items/:id/related - 获取相关内容",
          "/api/items/user/:userId - 获取用户内容"
        ],
        POST: [
          "/api/items - 创建内容"
        ],
        PUT: [
          "/api/items/:id - 更新内容"
        ],
        DELETE: [
          "/api/items/:id - 删除内容"
        ]
      }
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    data: null,
    message: '路由不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    code: err.status || 500,
    data: null,
    message: err.message || '服务器内部错误'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    console.log('🔌 正在连接数据库...');
    await db.connect();
    console.log('✅ 数据库连接成功');

    // 创建测试数据
    await createTestData();

    app.listen(PORT, '0.0.0.0', () => {  // 监听所有网络接口
      console.log(`🚀 Server is running on:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`   http://127.0.0.1:${PORT}`);
      console.log(`   http://${getLocalIpAddress()}:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 数据库状态: ${db.isConnected ? '✅ 已连接' : '❌ 未连接'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 添加获取本地IP地址的函数
function getLocalIpAddress() {
  const interfaces = networkInterfaces();

  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

startServer();

export default app;// backend/app.js - 完整可运行版本
const express = require('express');
const app = express();

// 启用CORS（允许前端访问）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '服务器正常运行！',
    timestamp: new Date().toLocaleString(),
    endpoints: [
      '/api/test - GET 测试接口',
      '/api/hello - GET 欢迎接口',
      '/api/echo - POST 回显数据'
    ]
  });
});

// 简单欢迎接口
app.get('/api/hello', (req, res) => {
  res.json({
    message: '欢迎使用媒体分享后端服务！',
    status: 'active'
  });
});

// 回显接口
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body,
    message: '数据接收成功',
    timestamp: new Date().toISOString()
  });
});

// 活动接口
app.get('/api/activities', (req, res) => {
  res.json({
    code: 200,
    data: [
      { id: 1, title: '电影推荐', user: '张三' },
      { id: 2, title: '音乐分享', user: '李四' }
    ],
    message: '获取成功'
  });
});

// 启动服务器
const PORT = 3001; // 固定使用3001端口

const server = app.listen(PORT, '0.0.0.0', () => { // 监听所有地址
  console.log('='.repeat(50));
  console.log('✅ 服务器启动成功！');
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`🌐 网络访问: http://127.0.0.1:${PORT}`);
  console.log(`🌐 本机IP访问: http://${getIPAddress()}:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📡 可用接口:');
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/hello`);
  console.log(`   GET  http://localhost:${PORT}/api/activities`);
  console.log(`   POST http://localhost:${PORT}/api/echo`);
  console.log('\n🛑 按 Ctrl+C 停止服务器');
});

// 获取本机IP地址函数
function getIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});