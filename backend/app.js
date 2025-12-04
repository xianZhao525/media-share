import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';

// 导入所有路由
import authRoutes from './routes/auth.js';       // 角色一
import itemRoutes from './routes/items.js';      // 角色二
import reviewRoutes from './routes/reviews.js';  // 角色三
import activityRoutes from './routes/activities.js'; // 角色四
import searchRoutes from './routes/search.js';   // 角色五（你的）

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api', reviewRoutes);
app.use('/api', activityRoutes);
app.use('/api', searchRoutes); // 你的搜索路由

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
    });
});

// 启动服务器
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('数据库连接失败:', err);
    });

export default app;