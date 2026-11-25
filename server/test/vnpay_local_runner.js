import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mongo = await MongoMemoryServer.create();
try {
  const child = spawn(process.execPath, [fileURLToPath(new URL('./vnpay_sandbox.test.js', import.meta.url))], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      MONGODB_URI: mongo.getUri('vnpay_test_db'),
      JWT_SECRET: 'local-vnpay-test-only',
      VNPAY_TMN_CODE: 'TESTTMN1',
      VNPAY_HASH_SECRET: 'TESTHASHSECRET1234567890123456789012345678901234567890123456789012345678901234567890',
      VNPAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      VNPAY_RETURN_URL: 'http://localhost:5173/payment/vnpay/callback',
      VNPAY_IPN_URL: 'http://localhost:5001/api/payment/vnpay/ipn',
    },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  await mongo.stop();
}
