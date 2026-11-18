import mongoose from 'mongoose';
import config from './config.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  const targetDbName = config.dbName;

  try {
    const connectOptions = { autoIndex: true };
    if (targetDbName) {
      connectOptions.dbName = targetDbName;
    }

    await mongoose.connect(config.mongoUri, connectOptions);

    const activeDbName = mongoose.connection.name;
    const activeHost = mongoose.connection.host || 'unknown-host';

    // RÀNG BUỘC TUYỆT ĐỐI: Chỉ được sử dụng ecommerce_electronics (ngoại trừ môi trường test)
    if (targetDbName && activeDbName !== targetDbName) {
      await mongoose.disconnect();
      throw new Error(
        `[CRITICAL DB MISMATCH] Connected to database "${activeDbName}" instead of required "${targetDbName}". Connection aborted immediately to protect other cluster databases.`
      );
    }

    const isAtlas = activeHost.includes('mongodb.net');
    console.log(`[db] Đã kết nối MongoDB thành công:`);
    console.log(`     - Database: ${activeDbName}`);
    console.log(`     - Host: ${activeHost} (Atlas: ${isAtlas ? 'YES' : 'NO / Local'})`);
  } catch (error) {
    console.error(`[db] Lỗi kết nối MongoDB:`, error.message);
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[db] Cảnh báo: Mất kết nối tới MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] Sự cố MongoDB:', err.message);
});
