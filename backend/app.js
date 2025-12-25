import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

// 导入路由
import itemRoutes from './routes/itemRoutes.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import activityRoutes from './routes/activityRoutes.js';

// 加载环境变量
dotenv.config();

// ES 模块中获取 __dirname 的等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 动态导入数据库连接
let db;
try {
  const dbModule = await import('./db/connection.js');
  db = dbModule.default || dbModule;
} catch (error) {
  console.error('❌ 导入数据库模块失败:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  if (req.path.includes('/auth/register')) {
    console.log('📥 注册请求头:', req.headers['content-type']);
    console.log('📥 注册请求体:', req.body);
  }
  next();
});
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// 服务前端静态文件
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API路由
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activities', activityRoutes);

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

// SPA 支持：所有其他请求返回 index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 404处理 - 仅 API 请求
app.use('/api/*', (req, res) => {
  res.status(404).json({
    code: 404,
    data: null,
    message: 'API 路由不存在'
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

// 启动服务器
const startServer = async () => {
  try {
    console.log('🔌 正在连接数据库...');
    await db.connect();
    console.log('✅ 数据库连接成功');

    app.listen(PORT, '0.0.0.0', () => {
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

export default app;