import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EJSON } from 'bson';

const BACKUP_DIR = 'C:\\Project\\DatabaseBackups\\before_lab_merge_20261119';

async function runBackup() {
  console.log('========================================================');
  console.log('  MONGODB DATABASE BACKUP PROTOCOL (MAIN PROJECT)');
  console.log('========================================================');

  // Load Main project .env
  const envPath = path.resolve('server/.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('Cannot find server/.env file');
  }
  const env = dotenv.parse(fs.readFileSync(envPath));
  const uri = env.MONGODB_URI;
  const dbName = env.MONGODB_DB_NAME || 'ecommerce_electronics';

  if (!uri) {
    throw new Error('MONGODB_URI missing from server/.env');
  }

  // Connect to database
  console.log('[1/4] Kết nối cơ sở dữ liệu Main an toàn...');
  const conn = await mongoose.createConnection(uri, { dbName }).asPromise();
  console.log(`      ✓ Đã kết nối thành công tới database: "${conn.name}"`);

  // Ensure backup directory exists
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // List all collections
  console.log('[2/4] Liệt kê và xuất toàn bộ collection...');
  const collections = await conn.db.listCollections().toArray();
  const manifest = {
    timestamp: new Date().toISOString(),
    database: conn.name,
    backupDir: BACKUP_DIR,
    format: 'MongoDB Canonical Extended JSON (EJSON)',
    collections: [],
    totalDocuments: 0,
  };

  for (const col of collections) {
    const colName = col.name;
    const colObj = conn.db.collection(colName);
    const count = await colObj.countDocuments();
    const docs = await colObj.find({}).toArray();

    // Serialize using Extended JSON canonical format
    const ejsonString = EJSON.stringify(docs, { relaxed: false });
    const targetFile = path.join(BACKUP_DIR, `${colName}.json`);
    fs.writeFileSync(targetFile, ejsonString, 'utf8');

    // Calculate sha256 checksum
    const hash = crypto.createHash('sha256').update(ejsonString).digest('hex');

    manifest.collections.push({
      collection: colName,
      file: `${colName}.json`,
      count,
      bytes: Buffer.byteLength(ejsonString, 'utf8'),
      sha256: hash,
    });
    manifest.totalDocuments += count;

    console.log(`      - Xuất [${colName}]: ${count} documents (${Buffer.byteLength(ejsonString, 'utf8')} bytes) -> ${colName}.json`);
  }

  // Write manifest file
  const manifestPath = path.join(BACKUP_DIR, 'backup-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[3/4] Đã ghi nhận manifest lưu trữ tại: ${manifestPath}`);

  // Verification step
  console.log('[4/4] Bắt đầu xác minh tính toàn vẹn của tệp backup (Verification)...');
  let verifiedCollections = 0;
  let verifiedDocuments = 0;

  for (const item of manifest.collections) {
    const filePath = path.join(BACKUP_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Tệp backup bị thiếu: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const actualHash = crypto.createHash('sha256').update(raw).digest('hex');
    if (actualHash !== item.sha256) {
      throw new Error(`Sai lệch Checksum SHA256 cho tệp ${item.file}`);
    }
    const parsed = EJSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== item.count) {
      throw new Error(`Sai lệch số lượng document cho tệp ${item.file}: kỳ vọng ${item.count}, thực tế ${parsed.length}`);
    }
    verifiedCollections++;
    verifiedDocuments += parsed.length;
  }

  await conn.close();

  console.log('========================================================');
  console.log('  KẾT QUẢ XÁC MINH BACKUP: HOÀN TOÀN HỢP LỆ (100% OK)');
  console.log(`  - Tổng số collection đã backup: ${verifiedCollections}`);
  console.log(`  - Tổng số document đã backup:   ${verifiedDocuments}`);
  console.log(`  - Thư mục lưu trữ: ${BACKUP_DIR}`);
  console.log('========================================================');
}

runBackup().catch((err) => {
  console.error('[CRITICAL] Backup thất bại:', err.message);
  process.exit(1);
});
