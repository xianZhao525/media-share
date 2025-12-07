// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const db = require('./db/connection');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入路由
const itemRoutes = require('./routes/itemRoutes');

// API路由
app.use('/api/items', itemRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Media Share API'
  });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    message: 'Media Share API',
    version: '1.0.0',
    endpoints: {
      items: {
        GET: [
          '/api/items - 获取内容列表',
          '/api/items/hot - 获取热门内容',
          '/api/items/latest - 获取最新内容',
          '/api/items/search?q=关键词 - 搜索内容',
          '/api/items/stats - 获取统计数据',
          '/api/items/:id - 获取内容详情',
          '/api/items/:id/related - 获取相关内容',
          '/api/items/user/:userId - 获取用户内容'
        ],
        POST: [
          '/api/items - 创建内容'
        ],
        PUT: [
          '/api/items/:id - 更新内容'
        ],
        DELETE: [
          '/api/items/:id - 删除内容'
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
    // 连接数据库
    await db.connect();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

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

module.exports = app;