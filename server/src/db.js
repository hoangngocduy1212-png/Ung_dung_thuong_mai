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

    // RÀNG BUỘC BẢO VỆ: Chỉ được sử dụng database được cấu hình (ecommerce_electronics_lab)
    if (targetDbName && activeDbName !== targetDbName) {
      await mongoose.disconnect();
      throw new Error(
        `[CRITICAL DB MISMATCH] Connected to database "${activeDbName}" instead of required "${targetDbName}". Connection aborted immediately to protect other databases.`
      );
    }

    const isAtlas = activeHost.includes('mongodb.net');
    // KHÓA BẢO VỆ ANIMATION LAB: Tuyệt đối không cho phép kết nối MongoDB Atlas trong môi trường Lab
    if (isAtlas) {
      await mongoose.disconnect();
      throw new Error(
        `[SAFETY GUARD BLOCKED] Animation Lab is strictly prohibited from connecting to MongoDB Atlas ("${activeHost}"). Please use local MongoDB at 127.0.0.1:27017.`
      );
    }

    console.log(`[db] Đã kết nối MongoDB thành công:`);
    console.log(`     - Database: ${activeDbName}`);
    console.log(`     - Host: ${activeHost} (Local MongoDB: YES)`);
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
