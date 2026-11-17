// Preview với dữ liệu demo cô lập; dừng tiến trình sẽ xóa toàn bộ DB tạm.
import { MongoMemoryServer } from 'mongodb-memory-server';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'local-cskh-preview-only';
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('cskh_preview');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { createCskhFixtures } = await import('./cskh-fixtures.js');
await connectDB();
await createCskhFixtures();
const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => console.log(`CSKH demo API: http://localhost:${port}/api — tài khoản cskh@demo.local / Demo@123 (database tạm)`));
async function stop() {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
  process.exit();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
