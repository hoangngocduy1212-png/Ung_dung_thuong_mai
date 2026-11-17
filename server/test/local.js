// Chạy bộ smoke hiện có trên MongoDB tạm; không dùng URI từ .env/Atlas.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mongo = await MongoMemoryServer.create();
try {
  const child = spawn(process.execPath, [fileURLToPath(new URL('./smoke.js', import.meta.url))], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test', MONGODB_URI: mongo.getUri('smoke_local'), JWT_SECRET: 'local-smoke-test-only' },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
} finally {
  await mongo.stop();
}
