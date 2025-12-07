// backend/db/connection.js - MongoDB 原生驱动版本
const { MongoClient, ObjectId } = require('mongodb');

class MongoDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.dbName = process.env.DB_NAME || 'media_share';
  }

  async connect() {
    try {
      console.log(`🚀 Connecting to MongoDB: ${this.uri}/${this.dbName}`);
      
      // 创建 MongoClient 实例
      this.client = new MongoClient(this.uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      // 连接到数据库
      await this.client.connect();
      
      // 获取数据库实例
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${this.dbName}`);
      
      // 创建索引
      await this.createIndexes();
      
      // 测试连接
      await this.db.command({ ping: 1 });
      console.log('✅ Database ping successful');
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const itemsCollection = this.db.collection('items');
      
      // 创建索引
      await itemsCollection.createIndex({ type: 1 });
      await itemsCollection.createIndex({ createdAt: -1 });
      await itemsCollection.createIndex({ userId: 1 });
      await itemsCollection.createIndex({ tags: 1 });
      await itemsCollection.createIndex({ isFeatured: 1 });
      await itemsCollection.createIndex({ isHot: 1 });
      await itemsCollection.createIndex({ 'rating.averageScore': -1 });
      
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.log('⚠️  Index creation warning:', error.message);
    }
  }

  getCollection(collectionName) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection(collectionName);
  }

  isValidObjectId(id) {
    try {
      if (!id) return false;
      return ObjectId.isValid(id);
    } catch {
      return false;
    }
  }

  createObjectId(id) {
    if (!id) return new ObjectId();
    return new ObjectId(id);
  }

  async close() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ MongoDB connection closed');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      database: this.dbName,
      collections: this.db ? this.db.listCollections().toArray() : []
    };
  }
}

// 创建单例实例
const instance = new MongoDBConnection();

module.exports = instance;