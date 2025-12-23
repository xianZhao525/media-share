// backend/app.js - ES 模块版本
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';  // 添加这个导入
import { createRequire } from 'module';  // 如果需要使用 require
import fs from 'fs';  // 添加 fs 模块导入
import itemRoutes from './routes/itemRoutes.js'; // 确保路径正确

// ES 模块中获取 __dirname 的等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 require 函数（如果需要）
const require = createRequire(import.meta.url);

dotenv.config();

// 动态导入数据库连接（因为数据库可能使用 CommonJS）
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
  origin: '*', // 允许所有来源
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务中间件
// app.use('/images', (req, res, next) => {
//   console.log(`🔍 [诊断] 请求静态文件: ${req.url}`);
//   console.log(`🔍 [诊断] 请求头 Origin: ${req.headers.origin}`);

//   // 设置完备的CORS头
//   res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Expose-Headers', '*');

//   // 关键：设置被认为"安全"的响应头
//   res.setHeader('Content-Type', 'image/jpeg');
//   res.setHeader('Cache-Control', 'public, max-age=3600');
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   res.setHeader('Access-Control-Allow-Private-Network', 'true');

//   // 如果是OPTIONS预检请求，直接返回200
//   if (req.method === 'OPTIONS') {
//     console.log(`🔍 [诊断] 处理OPTIONS预检请求`);
//     return res.status(200).end();
//   }

//   console.log(`🔍 [诊断] 设置的响应头:`, res.getHeaders());
//   next();
// }, express.static(path.join(__dirname, '../frontend/public/images')));

app.use('/images', express.static(path.join(__dirname, '../frontend/public/images'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// API路由
app.use('/api/items', itemRoutes);

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
          // cover: 'http://localhost:3001/images/movies/1.jpeg',
          cover: '/images/movies/1.jpeg',
          viewCount: 1050000,
          averageRating: 4.5,
          tags: ['科幻', '灾难', '中国', '吴京'],
          status: 'active',
          releaseYear: 2019,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15')
        },
        {
          title: '满江红',
          description: '南宋绍兴年间，岳飞死后四年，秦桧率兵与金国会谈。会谈前夜，金国使者死在宰相驻地，所携密信也不翼而飞。小兵张大与亲兵营副统领孙均机缘巧合被裹挟进这巨大阴谋之中。',
          type: 'movie',
          // cover: 'http://localhost:3001/images/movies/2.jpg',
          cover: '/images/movies/2.jpg',
          viewCount: 980000,
          averageRating: 4.3,
          tags: ['悬疑', '喜剧', '历史', '张艺谋'],
          status: 'active',
          releaseYear: 2023,
          createdAt: new Date('2023-02-10'),
          updatedAt: new Date('2023-02-10')
        },
        {
          title: '长津湖',
          description: '以抗美援朝战争第二次战役中的长津湖战役为背景，讲述了一段波澜壮阔的历史，在极寒严酷环境下，中国人民志愿军东线作战部队凭着钢铁意志和英勇无畏的战斗精神，扭转战场态势，为长津湖战役胜利作出重要贡献的故事。',
          type: 'movie',
          // cover: 'http://localhost:3001/images/movies/4.jpg',
          cover: '/images/movies/4.jpeg',
          viewCount: 1200000,
          averageRating: 4.7,
          tags: ['战争', '历史', '爱国', '吴京'],
          status: 'active',
          releaseYear: 2021,
          createdAt: new Date('2023-01-05'),
          updatedAt: new Date('2023-01-05')
        },
        {
          title: '阿凡达：水之道',
          description: '《阿凡达2》的剧情承接自第一部的5年之后。曾经的地球残疾军人杰克·萨利，如今已经是潘多拉星球纳美族一方部族的族长，并且与爱妻娜塔莉共同育有一对可爱的儿女，日子过得平淡而充实。',
          type: 'movie',
          // cover: 'http://localhost:3001/images/movies/3.jpeg',
          cover: '/images/movies/3.jpeg',
          viewCount: 850000,
          averageRating: 4.2,
          tags: ['科幻', '冒险', '3D', '詹姆斯·卡梅隆'],
          status: 'active',
          releaseYear: 2022,
          createdAt: new Date('2023-03-01'),
          updatedAt: new Date('2023-03-01')
        },

        // 电视剧数据
        {
          title: '漫长的季节',
          description: '小城桦林，此时，出租司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。是仇人还是故人？遇到了，就得有交代，给自己，也给儿子。',
          type: 'tv',
          // cover: 'http://localhost:3001/images/tv/5.jpg',
          cover: '/images/tv/5.jpg',
          viewCount: 800000,
          averageRating: 4.8,
          tags: ['悬疑', '犯罪', '剧情', '范伟'],
          status: 'active',
          releaseYear: 2023,
          createdAt: new Date('2023-04-15'),
          updatedAt: new Date('2023-04-15')
        },
        {
          title: '狂飙',
          description: '京海市一线刑警安欣，在与黑恶势力的斗争中，不断遭到保护伞的打击，始终无法将犯罪分子绳之以法。全国政法队伍教育整顿工作开展后，临江省派出指导组入驻京海，联合公检法司各部门，清除了政法队伍内部的腐败分子，粉碎了黑恶势力的保护伞。',
          type: 'tv',
          // cover: 'http://localhost:3001/images/tv/6.jpg',
          cover: '/images/tv/6.jpg',
          viewCount: 1500000,
          averageRating: 4.9,
          tags: ['犯罪', '悬疑', '张译', '张颂文'],
          status: 'active',
          releaseYear: 2023,
          createdAt: new Date('2023-01-30'),
          updatedAt: new Date('2023-01-30')
        },
        {
          title: '三体',
          description: '2007年，地球基础科学出现了异常的扰动，一时间科学界风雨飘飘，人心惶惶。离奇自杀的科学家，近乎神迹的倒计时，行事隐秘的科学边界，神秘莫测的《三体》游戏……',
          type: 'tv',
          // cover: 'http://localhost:3001/images/tv/7.jpg',
          cover: '/images/tv/7.jpg',
          viewCount: 950000,
          averageRating: 4.7,
          tags: ['科幻', '悬疑', '刘慈欣', '于和伟'],
          status: 'active',
          releaseYear: 2023,
          createdAt: new Date('2023-02-20'),
          updatedAt: new Date('2023-02-20')
        },

        // 动漫数据
        {
          title: '鬼灭之刃',
          description: '时值日本大正时期。传说太阳下山后，有恶鬼出没吃人。亦有猎鬼人斩杀恶鬼、保护人们。卖炭少年炭治郎，他那平凡而幸福的日常生活，在家人遭到恶鬼袭击的那一天发生了剧变。母亲与四个弟妹惨遭杀害，而与他一起生还的妹妹祢豆子亦异变成凶暴的鬼。',
          type: 'anime',
          // cover: 'http://localhost:3001/images/anime/8.jpg',
          cover: '/images/anime/8.jpg',
          viewCount: 1200000,
          averageRating: 4.7,
          tags: ['动漫', '热血', '战斗', '日本'],
          status: 'active',
          releaseYear: 2019,
          createdAt: new Date('2023-03-10'),
          updatedAt: new Date('2023-03-10')
        },
        {
          title: '咒术回战',
          description: '少年战斗着——「为寻求正确的死亡」辛酸、后悔、耻辱，人类产生的负面情感，化为诅咒，潜入日常生活。诅咒是蔓延于世界的祸源，最糟糕的情况下，会让人类踏入死亡。并且，诅咒只能以诅咒祓除。',
          type: 'anime',
          // cover: 'http://localhost:3001/images/anime/9.jpg',
          cover: '/images/anime/9.jpg',
          viewCount: 1100000,
          averageRating: 4.6,
          tags: ['动漫', '战斗', '热血', '奇幻'],
          status: 'active',
          releaseYear: 2020,
          createdAt: new Date('2023-04-05'),
          updatedAt: new Date('2023-04-05')
        },

        // 综艺数据
        {
          title: '奔跑吧第七季',
          description: '《奔跑吧》是浙江卫视推出的户外竞技真人秀节目，由浙江卫视节目中心制作。节目采用主题模式，在设置上融入更具有时代感和地区意义的主线，艺人分为不同的队伍进行比赛，最后获胜一方获得称号或奖品。',
          type: 'variety',
          // cover: 'http://localhost:3001/images/variety/10.webp',
          cover: '/images/variety/10.webp',
          viewCount: 750000,
          averageRating: 4.0,
          tags: ['综艺', '真人秀', '娱乐', '跑男'],
          status: 'active',
          releaseYear: 2023,
          createdAt: new Date('2023-05-01'),
          updatedAt: new Date('2023-05-01')
        }
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
// 在 app.js 中添加更详细的启动日志
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

export default app;