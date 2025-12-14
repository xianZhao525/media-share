// backend/seed/mongodb-seed.js - 修复版本
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const sampleData = [
  {
    title: "流浪地球2",
    originalTitle: "The Wandering Earth II",
    type: "movie",
    subType: "sci-fi",
    cover: "https://example.com/wandering-earth2-cover.jpg",
    description: "太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。",
    summary: "科幻灾难巨制，吴京、刘德华主演",
    tags: ["科幻", "灾难", "吴京", "刘德华", "中国科幻"],
    releaseYear: 2023,
    releaseDate: new Date("2023-01-22"),
    country: ["中国"],
    language: ["中文"],
    director: [
      {
        name: "郭帆",
        role: "director",
        avatar: "https://example.com/guofan-avatar.jpg"
      }
    ],
    actors: [
      {
        name: "吴京",
        role: "actor",
        avatar: "https://example.com/wujing-avatar.jpg",
        character: "刘培强"
      },
      {
        name: "刘德华",
        role: "actor",
        avatar: "https://example.com/liudehua-avatar.jpg",
        character: "图恒宇"
      }
    ],
    rating: {
      platformScore: 9.2,
      platformVotes: 1250000,
      averageScore: 8.5
    },
    viewCount: 12500000,
    likeCount: 980000,
    collectCount: 560000,
    commentCount: 235000,
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 1,
    ageLimit: "PG-13",
    resolution: ["4K", "1080p", "HDR"],
    audioTracks: ["中文", "英语"],
    subtitles: ["简体中文", "繁体中文", "英文"],
    uploadedBy: new ObjectId(),
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "狂飙",
    originalTitle: "The Knockout",
    type: "tv",
    subType: "crime",
    cover: "https://example.com/kuangbiao-cover.jpg",
    description: "京海市一线刑警安欣，在与黑恶势力的斗争中，不断遭到保护伞的打击。",
    summary: "扫黑除恶题材电视剧，张译、张颂文主演",
    tags: ["犯罪", "悬疑", "张译", "张颂文", "扫黑除恶"],
    releaseYear: 2023,
    releaseDate: new Date("2023-01-14"),
    country: ["中国"],
    language: ["中文"],
    director: [
      {
        name: "徐纪周",
        role: "director",
        avatar: "https://example.com/xujizhou-avatar.jpg"
      }
    ],
    actors: [
      {
        name: "张译",
        role: "actor",
        avatar: "https://example.com/zhangyi-avatar.jpg",
        character: "安欣"
      },
      {
        name: "张颂文",
        role: "actor",
        avatar: "https://example.com/zhangsongwen-avatar.jpg",
        character: "高启强"
      }
    ],
    rating: {
      platformScore: 9.5,
      platformVotes: 1850000,
      averageScore: 9.0
    },
    viewCount: 85000000,
    likeCount: 3500000,
    collectCount: 2800000,
    commentCount: 890000,
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 2,
    ageLimit: "PG-13",
    resolution: ["1080p"],
    audioTracks: ["中文"],
    subtitles: ["简体中文"],
    uploadedBy: new ObjectId(), // 修复这里
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "漫长的季节",
    originalTitle: "The Long Season",
    type: "tv",
    subType: "drama",
    cover: "https://example.com/longseason-cover.jpg",
    description: "小城桦林，此时，出租司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。",
    summary: "生活悬疑剧，范伟、秦昊主演",
    tags: ["悬疑", "犯罪", "范伟", "秦昊", "生活剧"],
    releaseYear: 2023,
    releaseDate: new Date("2023-04-22"),
    country: ["中国"],
    language: ["中文"],
    director: [
      {
        name: "辛爽",
        role: "director",
        avatar: "https://example.com/xinshuang-avatar.jpg"
      }
    ],
    actors: [
      {
        name: "范伟",
        role: "actor",
        avatar: "https://example.com/fanwei-avatar.jpg",
        character: "王响"
      },
      {
        name: "秦昊",
        role: "actor",
        avatar: "https://example.com/qinhao-avatar.jpg",
        character: "龚彪"
      }
    ],
    rating: {
      platformScore: 9.4,
      platformVotes: 980000,
      averageScore: 9.4
    },
    viewCount: 68000000,
    likeCount: 2800000,
    collectCount: 1900000,
    commentCount: 650000,
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 3,
    ageLimit: "PG-13",
    uploadedBy: new ObjectId(), // 修复这里
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db('media_share');
    const itemsCollection = db.collection('items');
    
    console.log('🗑️  Clearing existing items...');
    const deleteResult = await itemsCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} items`);
    
    console.log('🌱 Inserting sample data...');
    const insertResult = await itemsCollection.insertMany(sampleData);
    console.log(`✅ Inserted ${insertResult.insertedCount} items`);
    
    // 创建索引
    console.log('📊 Creating indexes...');
    await itemsCollection.createIndex({ type: 1 });
    await itemsCollection.createIndex({ createdAt: -1 });
    await itemsCollection.createIndex({ tags: 1 });
    await itemsCollection.createIndex({ isFeatured: 1 });
    await itemsCollection.createIndex({ isHot: 1 });
    await itemsCollection.createIndex({ 'rating.averageScore': -1 });
    
    // 验证
    const count = await itemsCollection.countDocuments({});
    console.log(`📊 Total items in database: ${count}`);
    
    // 显示插入的数据
    console.log('\n📋 Sample of inserted items:');
    const items = await itemsCollection.find({}, { projection: { title: 1, type: 1, releaseYear: 1 } }).limit(5).toArray();
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.type}, ${item.releaseYear})`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

// 运行种子脚本
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { sampleData, seedDatabase };  