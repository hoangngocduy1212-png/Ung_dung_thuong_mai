import mongoose from 'mongoose';
import config from '../src/config.js';

async function runTest() {
  console.log('--- BẮT ĐẦU KIỂM TRA KẾT NỐI ATLAS (PHASE 5) ---');
  const targetDbName = config.dbName || 'ecommerce_electronics';

  try {
    console.log('1. Đang kết nối tới URI đã cấu hình...');
    await mongoose.connect(config.mongoUri, {
      dbName: targetDbName,
      serverSelectionTimeoutMS: 15000,
    });

    const activeDbName = mongoose.connection.name;
    const activeHost = mongoose.connection.host || 'unknown-host';
    const isAtlas = activeHost.includes('mongodb.net');

    console.log(`- Tên Database thực tế: "${activeDbName}"`);
    console.log(`- Host: ${activeHost}`);
    console.log(`- Thuộc MongoDB Atlas: ${isAtlas ? 'ĐÚNG' : 'KHÔNG'}`);

    if (activeDbName !== targetDbName) {
      throw new Error(`CRITICAL: Database name mismatch: "${activeDbName}" !== "${targetDbName}"`);
    }

    if (!isAtlas) {
      console.warn('CẢNH BÁO: Host không chứa "mongodb.net".');
    }

    console.log('\n2. Kiểm tra các collection trong database:', activeDbName);
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`- Số lượng collection: ${collectionNames.length}`);
    if (collectionNames.length > 0) {
      console.log('- Danh sách collection:', collectionNames.join(', '));
      // Đếm số document trong mỗi collection
      for (const name of collectionNames) {
        const count = await mongoose.connection.db.collection(name).countDocuments();
        console.log(`   + ${name}: ${count} documents`);
      }
    } else {
      console.log('- Database ecommerce_electronics hiện tại đang RỖNG (chưa có collection).');
    }

    console.log('\n3. Thực hiện test ghi/đọc an toàn (_atlas_connection_test)...');
    const testColl = mongoose.connection.db.collection('_atlas_connection_test');
    const testDoc = {
      testId: 'atlas-ping-' + Date.now(),
      status: 'VERIFIED',
      createdAt: new Date()
    };

    const insertResult = await testColl.insertOne(testDoc);
    console.log('- Ghi document test thành công, _id:', insertResult.insertedId);

    const foundDoc = await testColl.findOne({ _id: insertResult.insertedId });
    if (!foundDoc || foundDoc.testId !== testDoc.testId) {
      throw new Error('Đọc document test thất bại hoặc dữ liệu không khớp!');
    }
    console.log('- Đọc lại document test thành công:', foundDoc.testId);

    await testColl.deleteOne({ _id: insertResult.insertedId });
    console.log('- Xóa document test thành công.');

    await testColl.drop();
    console.log('- Đã drop collection tạm _atlas_connection_test hoàn tất.');

    console.log('\n>>> KẾT QUẢ PHASE 5: THÀNH CÔNG 100% <<<');
  } catch (err) {
    console.error('\n>>> LỖI TEST KẾT NỐI ATLAS <<<:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối an toàn.');
  }
}

runTest();
