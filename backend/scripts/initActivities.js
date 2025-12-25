// backend/scripts/initActivities.js
const { MongoClient } = require('mongodb');

async function initActivitiesCollections() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/media_share';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // 1. 创建activities集合
    await db.createCollection('activities', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['type', 'actor', 'createdAt'],
          properties: {
            type: {
              bsonType: 'string',
              enum: ['post', 'like', 'comment', 'follow', 'share'],
              description: '动态类型'
            },
            actor: {
              bsonType: 'objectId',
              description: '执行动作的用户ID'
            },
            object: {
              bsonType: 'objectId',
              description: '动作的对象ID'
            },
            target: {
              bsonType: ['objectId', 'null'],
              description: '动作的目标ID（可选）'
            },
            content: {
              bsonType: ['string', 'null'],
              description: '动态内容',
              maxLength: 2000
            },
            images: {
              bsonType: ['array', 'null'],
              items: {
                bsonType: 'object',
                properties: {
                  url: { bsonType: 'string' },
                  caption: { bsonType: ['string', 'null'] },
                  width: { bsonType: ['int', 'null'] },
                  height: { bsonType: ['int', 'null'] }
                }
              }
            },
            metadata: {
              bsonType: ['object', 'null'],
              description: '额外的元数据'
            },
            createdAt: {
              bsonType: 'date',
              description: '创建时间'
            },
            updatedAt: {
              bsonType: 'date',
              description: '更新时间'
            }
          }
        }
      }
    });

    // 2. 创建likes集合
    await db.createCollection('likes', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'createdAt'],
          properties: {
            activityId: {
              bsonType: 'objectId',
              description: '被点赞的动态ID'
            },
            commentId: {
              bsonType: ['objectId', 'null'],
              description: '被点赞的评论ID'
            },
            userId: {
              bsonType: 'objectId',
              description: '点赞用户ID'
            },
            createdAt: {
              bsonType: 'date',
              description: '点赞时间'
            }
          }
        }
      }
    });

    // 3. 创建comments集合
    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['activityId', 'userId', 'content', 'createdAt'],
          properties: {
            activityId: {
              bsonType: 'objectId',
              description: '所属动态ID'
            },
            parentId: {
              bsonType: ['objectId', 'null'],
              description: '父评论ID（用于回复）'
            },
            userId: {
              bsonType: 'objectId',
              description: '评论用户ID'
            },
            content: {
              bsonType: 'string',
              description: '评论内容',
              maxLength: 1000
            },
            createdAt: {
              bsonType: 'date',
              description: '创建时间'
            },
            updatedAt: {
              bsonType: 'date',
              description: '更新时间'
            }
          }
        }
      }
    });

    // 4. 创建索引
    console.log('创建索引...');
    
    // activities集合索引
    await db.collection('activities').createIndex({ actor: 1, createdAt: -1 });
    await db.collection('activities').createIndex({ createdAt: -1 });
    await db.collection('activities').createIndex({ type: 1 });
    await db.collection('activities').createIndex({ object: 1 });
    await db.collection('activities').createIndex({ target: 1 });
    
    // likes集合索引
    await db.collection('likes').createIndex({ activityId: 1, userId: 1 }, { unique: true });
    await db.collection('likes').createIndex({ commentId: 1, userId: 1 }, { unique: true });
    await db.collection('likes').createIndex({ userId: 1 });
    await db.collection('likes').createIndex({ createdAt: -1 });
    
    // comments集合索引
    await db.collection('comments').createIndex({ activityId: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ parentId: 1 });
    await db.collection('comments').createIndex({ userId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });

    // follows集合索引（如果还没有）
    if (!(await db.listCollections({ name: 'follows' }).toArray()).length) {
      await db.createCollection('follows');
      await db.collection('follows').createIndex({ follower: 1, following: 1 }, { unique: true });
      await db.collection('follows').createIndex({ follower: 1 });
      await db.collection('follows').createIndex({ following: 1 });
    }

    console.log('Activities collections initialized successfully!');
    
    // 5. 插入测试数据（可选）
    console.log('插入测试数据...');
    await insertTestData(db);
    
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await client.close();
  }
}

async function insertTestData(db) {
  const users = await db.collection('users').find().limit(3).toArray();
  
  if (users.length < 2) {
    console.log('用户数量不足，跳过测试数据插入');
    return;
  }
  
  const userId1 = users[0]._id;
  const userId2 = users[1]._id;
  
  // 插入测试动态
  const testActivities = [
    {
      type: 'post',
      actor: userId1,
      content: '这是我的第一条动态，分享给大家！',
      images: [
        { url: 'https://via.placeholder.com/600x400/00a1d6/ffffff', caption: '示例图片' }
      ],
      createdAt: new Date(Date.now() - 3600000), // 1小时前
      updatedAt: new Date(Date.now() - 3600000)
    },
    {
      type: 'follow',
      actor: userId1,
      object: userId2,
      content: `关注了用户 ${users[1].username}`,
      createdAt: new Date(Date.now() - 7200000), // 2小时前
      updatedAt: new Date(Date.now() - 7200000)
    },
    {
      type: 'like',
      actor: userId2,
      object: userId1, // 假设这是一个帖子ID
      content: `赞了用户 ${users[0].username} 的帖子`,
      createdAt: new Date(Date.now() - 10800000), // 3小时前
      updatedAt: new Date(Date.now() - 10800000)
    }
  ];
  
  await db.collection('activities').insertMany(testActivities);
  console.log('插入测试动态数据成功');
  
  // 插入测试关注关系
  await db.collection('follows').insertOne({
    follower: userId1,
    following: userId2,
    createdAt: new Date()
  });
  
  console.log('插入测试数据完成');
}

// 执行初始化
if (require.main === module) {
  initActivitiesCollections();
}

module.exports = initActivitiesCollections;