// backend/seed/items.seed.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
require('dotenv').config();

const sampleData = [
  {
    title: "流浪地球2",
    originalTitle: "The Wandering Earth II",
    type: "movie",
    subType: "sci-fi",
    cover: "https://example.com/wandering-earth2-cover.jpg",
    poster: "https://example.com/wandering-earth2-poster.jpg",
    thumbnails: [
      "https://example.com/wandering-earth2-thumb1.jpg",
      "https://example.com/wandering-earth2-thumb2.jpg"
    ],
    trailer: "https://example.com/wandering-earth2-trailer.mp4",
    videoUrl: "https://example.com/wandering-earth2-full.mp4",
    duration: 173,
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
      },
      {
        name: "李雪健",
        role: "actor",
        avatar: "https://example.com/lixuejian-avatar.jpg",
        character: "周喆直"
      }
    ],
    rating: {
      platformScore: 9.2,
      platformVotes: 1250000,
      externalRatings: [
        {
          source: "douban",
          score: 8.3,
          count: 1500000,
          link: "https://movie.douban.com/subject/35267208/"
        },
        {
          source: "imdb",
          score: 7.8,
          count: 25000,
          link: "https://www.imdb.com/title/tt13539646/"
        }
      ],
      averageScore: 8.5
    },
    viewCount: 12500000,
    likeCount: 980000,
    collectCount: 560000,
    commentCount: 235000,
    playCount: {
      today: 15000,
      week: 85000,
      month: 350000,
      total: 12500000
    },
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 1,
    ageLimit: "PG-13",
    resolution: ["4K", "1080p", "HDR"],
    audioTracks: ["中文", "英语"],
    subtitles: ["简体中文", "繁体中文", "英文"],
    uploadedBy: new mongoose.Types.ObjectId(),
    status: "approved"
  },
  {
    title: "狂飙",
    originalTitle: "The Knockout",
    type: "tv",
    subType: "crime",
    cover: "https://example.com/kuangbiao-cover.jpg",
    poster: "https://example.com/kuangbiao-poster.jpg",
    duration: 45,
    episodes: [
      {
        episodeNumber: 1,
        title: "初遇",
        duration: 45,
        airDate: new Date("2023-01-14"),
        description: "刑警安欣与鱼贩高启强相识于一场意外",
        thumbnail: "https://example.com/kuangbiao-ep1.jpg",
        url: "https://example.com/kuangbiao-ep1.mp4"
      },
      {
        episodeNumber: 2,
        title: "蜕变",
        duration: 45,
        airDate: new Date("2023-01-15"),
        description: "高启强开始涉足黑道生意",
        thumbnail: "https://example.com/kuangbiao-ep2.jpg",
        url: "https://example.com/kuangbiao-ep2.mp4"
      }
    ],
    totalEpisodes: 39,
    currentEpisode: 39,
    description: "京海市一线刑警安欣，在与黑恶势力的斗争中，不断遭到保护伞的打击，始终无法将犯罪分子绳之以法。全国政法队伍教育整顿工作开展后，临江省派出指导组入驻京海，联合公检法司各部门，清除了政法队伍内部的腐败分子，粉碎了黑恶势力的保护伞，一举铲除了盘踞京海多年的强盛集团。",
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
      },
      {
        name: "李一桐",
        role: "actor",
        avatar: "https://example.com/liyitong-avatar.jpg",
        character: "孟钰"
      }
    ],
    rating: {
      platformScore: 9.5,
      platformVotes: 1850000,
      externalRatings: [
        {
          source: "douban",
          score: 8.5,
          count: 680000,
          link: "https://movie.douban.com/subject/35465232/"
        }
      ],
      averageScore: 9.0
    },
    viewCount: 85000000,
    likeCount: 3500000,
    collectCount: 2800000,
    commentCount: 890000,
    playCount: {
      today: 45000,
      week: 280000,
      month: 1200000,
      total: 85000000
    },
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 2,
    ageLimit: "PG-13",
    resolution: ["1080p"],
    audioTracks: ["中文"],
    subtitles: ["简体中文"],
    uploadedBy: new mongoose.Types.ObjectId(),
    status: "approved"
  },
  {
    title: "漫长的季节",
    originalTitle: "The Long Season",
    type: "tv",
    subType: "drama",
    cover: "https://example.com/longseason-cover.jpg",
    description: "小城桦林，此时，出租司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。是仇人还是故人？遇到了，就得有交代，给自己，也给儿子。",
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
      },
      {
        name: "陈明昊",
        role: "actor",
        avatar: "https://example.com/chenminghao-avatar.jpg",
        character: "马德胜"
      }
    ],
    rating: {
      platformScore: 9.4,
      platformVotes: 980000,
      externalRatings: [
        {
          source: "douban",
          score: 9.4,
          count: 920000,
          link: "https://movie.douban.com/subject/35524356/"
        }
      ],
      averageScore: 9.4
    },
    viewCount: 68000000,
    likeCount: 2800000,
    collectCount: 1900000,
    commentCount: 650000,
    playCount: {
      today: 32000,
      week: 190000,
      month: 850000,
      total: 68000000
    },
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 3,
    ageLimit: "PG-13",
    uploadedBy: new mongoose.Types.ObjectId(),
    status: "approved"
  },
  {
    title: "三体",
    originalTitle: "Three-Body",
    type: "tv",
    subType: "sci-fi",
    cover: "https://example.com/santi-cover.jpg",
    description: "2007年，地球基础科学出现了异常的扰动，一时间科学界风雨飘飘，人心惶惶。离奇自杀的科学家，近乎神迹的倒计时，行事隐秘的科学边界，神秘莫测的《三体》游戏……纳米科学家汪淼被警官史强带到联合作战中心，并潜入名为"科学边界"的组织协助调查。",
    summary: "刘慈欣科幻小说改编，张鲁一、于和伟主演",
    tags: ["科幻", "刘慈欣", "张鲁一", "于和伟", "小说改编"],
    releaseYear: 2023,
    releaseDate: new Date("2023-01-15"),
    country: ["中国"],
    language: ["中文"],
    director: [
      {
        name: "杨磊",
        role: "director",
        avatar: "https://example.com/yanglei-avatar.jpg"
      }
    ],
    actors: [
      {
        name: "张鲁一",
        role: "actor",
        avatar: "https://example.com/zhangluyi-avatar.jpg",
        character: "汪淼"
      },
      {
        name: "于和伟",
        role: "actor",
        avatar: "https://example.com/yuhewei-avatar.jpg",
        character: "史强"
      },
      {
        name: "陈瑾",
        role: "actor",
        avatar: "https://example.com/chenjin-avatar.jpg",
        character: "叶文洁"
      }
    ],
    rating: {
      platformScore: 8.7,
      platformVotes: 1250000,
      externalRatings: [
        {
          source: "douban",
          score: 8.7,
          count: 580000,
          link: "https://movie.douban.com/subject/26647087/"
        }
      ],
      averageScore: 8.7
    },
    viewCount: 95000000,
    likeCount: 4200000,
    collectCount: 3100000,
    commentCount: 890000,
    playCount: {
      today: 38000,
      week: 210000,
      month: 950000,
      total: 95000000
    },
    isFeatured: true,
    isHot: true,
    isRecommended: true,
    sortOrder: 4,
    ageLimit: "PG-13",
    uploadedBy: new mongoose.Types.ObjectId(),
    status: "approved"
  },
  {
    title: "封神第一部：朝歌风云",
    originalTitle: "Creation of the Gods I: Kingdom of Storms",
    type: "movie",
    subType: "fantasy",
    cover: "https://example.com/fengshen-cover.jpg",
    description: "商王殷寿与狐妖妲己勾结，暴虐无道，引发天谴。昆仑仙人姜子牙携"封神榜"下山，寻找天下共主，以救苍生。西伯侯之子姬发逐渐发现殷寿的本来面目，反出朝歌……",
    summary: "神话史诗电影，费翔、李雪健主演",
    tags: ["神话", "史诗", "费翔", "李雪健", "乌尔善"],
    releaseYear: 2023,
    releaseDate: new Date("2023-07-20"),
    country: ["中国"],
    language: ["中文"],
    director: [
      {
        name: "乌尔善",
        role: "director",
        avatar: "https://example.com/wuershan-avatar.jpg"
      }
    ],
    actors: [
      {
        name: "费翔",
        role: "actor",
        avatar: "https://example.com/feixiang-avatar.jpg",
        character: "殷寿"
      },
      {
        name: "李雪健",
        role: "actor",
        avatar: "https://example.com/lixuejian-avatar.jpg",
        character: "姬昌"
      },
      {
        name: "黄渤",
        role: "actor",
        avatar: "https://example.com/huangbo-avatar.jpg",
        character: "姜子牙"
      }
    ],
    rating: {
      platformScore: 8.9,
      platformVotes: 980000,
      externalRatings: [
        {
          source: "douban",
          score: 7.9,
          count: 1200000,
          link: "https://movie.douban.com/subject/10604086/"
        }
      ],
      averageScore: 8.4
    },
    viewCount: 65000000,
    likeCount: 3100000,
    collectCount: 2400000,
    commentCount: 780000,
    playCount: {
      today: 28000,
      week: 150000,
      month: 680000,
      total: 65000000
    },
    isFeatured: true,
    isHot: true,
    sortOrder: 5,
    ageLimit: "PG-13",
    uploadedBy: new mongoose.Types.ObjectId(),
    status: "approved"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/video_share');
    console.log('Connected to MongoDB');
    
    // 清空现有数据
    await Item.deleteMany({});
    console.log('Cleared existing items');
    
    // 插入新数据
    const createdItems = await Item.insertMany(sampleData);
    console.log(`Seeded ${createdItems.length} items successfully`);
    
    // 创建文本索引
    await Item.syncIndexes();
    console.log('Indexes synced');
    
    mongoose.connection.close();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// 运行种子脚本
if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleData, seedDatabase };