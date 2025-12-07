// backend/db.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

let db;
let client;

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/media_share';
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    db = client.db();
    console.log('✅ MongoDB connected successfully');
    
    // 初始化索引
    await initIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function initIndexes() {
  try {
    const itemsCollection = db.collection('items');
    
    // 创建索引
    await Promise.all([
      itemsCollection.createIndex({ type: 1, createdAt: -1 }),
      itemsCollection.createIndex({ userId: 1, createdAt: -1 }),
      itemsCollection.createIndex({ averageRating: -1, viewCount: -1 }),
      itemsCollection.createIndex({ tags: 1, createdAt: -1 }),
      itemsCollection.createIndex({ title: 1 }),
    ]);
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

function getItemsCollection() {
  if (!db) throw new Error('Database not connected');
  return db.collection('items');
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectDB,
  closeDB,
  getItemsCollection,
  ObjectId
};