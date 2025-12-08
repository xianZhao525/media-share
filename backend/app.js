// backend/app.js - 添加测试数据的完整版本
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const db = require('./db/connection');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入路由
const itemRoutes = require('./routes/itemRoutes');

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
          cover: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2545472803.jpg',
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
          cover: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2886766892.jpg',
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
          cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2682443857.jpg',
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
          cover: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2881239459.jpg',
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
          cover: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2887574537.jpg',
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
          cover: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2886707371.jpg',
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
          cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886194296.jpg',
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
          cover: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2574917278.jpg',
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
          cover: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2625667237.jpg',
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
          cover: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2892154119.jpg',
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
    console.log('🔌 正在连接数据库...');
    await db.connect();
    
    // 创建测试数据
    await createTestData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
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

module.exports = app;