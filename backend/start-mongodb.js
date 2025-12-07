// backend/start-mongodb.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

async function startMongoDB() {
  console.log('🚀 Starting MongoDB in-memory server from VSCode...');
  
  try {
    // 启动 MongoDB 内存服务器
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,  // 标准 MongoDB 端口
        dbName: 'media_share'
      }
    });
    
    const uri = mongod.getUri();
    console.log('✅ MongoDB started successfully!');
    console.log('📡 Connection URI:', uri);
    console.log('📁 Database:', 'media_share');
    console.log('🔌 Port: 27017');
    console.log('\n📝 To connect with MongoDB Compass or other tools:');
    console.log('   URI:', uri);
    
    // 测试连接
    const client = new MongoClient(uri);
    await client.connect();
    console.log('🔗 Test connection: SUCCESS');
    await client.close();
    
    // 保持服务器运行
    console.log('\n⏳ MongoDB is running. Press Ctrl+C to stop.');
    console.log('💡 Keep this terminal open while running your backend.');
    
    // 处理退出
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping MongoDB...');
      await mongod.stop();
      console.log('✅ MongoDB stopped.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start MongoDB:', error.message);
    process.exit(1);
  }
}

startMongoDB();