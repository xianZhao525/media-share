// backend/db/connection.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

class MongoDBConnection {
  constructor() {
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/media_share';
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ MongoDB connected successfully');
      
      await this.createIndexes();
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const itemsCollection = this.db.collection('items');
      
      // 文本索引
      await itemsCollection.createIndex(
        { title: 'text', description: 'text', tags: 'text' },
        { 
          name: 'text_search',
          weights: { title: 10, description: 5, tags: 3 }
        }
      );

      // 其他索引
      await itemsCollection.createIndex({ type: 1, createdAt: -1 });
      await itemsCollection.createIndex({ userId: 1, createdAt: -1 });
      await itemsCollection.createIndex({ viewCount: -1 });
      await itemsCollection.createIndex({ tags: 1 });
      
      console.log('✅ Indexes created');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  getCollection(collectionName) {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection(collectionName);
  }

  isValidObjectId(id) {
    try {
      if (!id) return false;
      
      // 检查是否是有效的24字符十六进制字符串
      if (typeof id === 'string') {
        return /^[0-9a-fA-F]{24}$/.test(id);
      }
      
      // 检查是否是ObjectId实例
      if (id instanceof ObjectId) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  createObjectId(id) {
    try {
      if (!id) return new ObjectId();
      
      if (typeof id === 'string' && this.isValidObjectId(id)) {
        return new ObjectId(id);
      }
      
      throw new Error('Invalid ObjectId');
    } catch (error) {
      throw new Error(`Failed to create ObjectId: ${error.message}`);
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}

module.exports = new MongoDBConnection();