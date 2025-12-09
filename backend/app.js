// backend/app.js - 完整可运行版本
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