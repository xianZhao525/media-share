const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/api/hello', (req, res) => {
    res.json({
        code: 200,
        data: { message: '后端API运行正常！' },
        message: 'success'
    });
});


// 在 server.js 中添加
app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: '在线影视分享平台 API 服务运行中',
        data: {
            version: '1.0.0',
            endpoints: {
                api: 'http://localhost:3000/api',
                docs: '请查看项目文档'
            }
        }
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务器运行在 http://localhost:${PORT}`);
    console.log(`✅ 测试API: http://localhost:${PORT}/api/hello`);
});