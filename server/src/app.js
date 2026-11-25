import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config.js';
import { uploadDir } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import customerRoutes from './routes/customer.js';
import sellerRoutes from './routes/seller.js';
import staffRoutes from './routes/staff.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';

const app = express();
// Cấu hình trust proxy an toàn cho Cloudflare Tunnel và reverse proxy nội bộ
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
// Cho phép các nguồn gốc local, CLIENT_ORIGIN và tất cả các domain Cloudflare Tunnel (*.trycloudflare.com)
const configuredOrigins = config.clientOrigin.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes(origin) ||
      origin.endsWith('.trycloudflare.com') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes); // khách vãng lai: categories, brands, products, shops
app.use('/api/customer', customerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/staff', staffRoutes); // nhân viên CSKH
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
// Chat (Socket.IO) sẽ bổ sung ở giai đoạn sau

app.use(notFound);
app.use(errorHandler);
export default app;
