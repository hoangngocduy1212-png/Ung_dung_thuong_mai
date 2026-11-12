import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, unique: true }, // tên viết thường, dùng chống trùng tên gian hàng
    logo: String,
    description: { type: String, default: '' },
    policy: { type: String, default: '' },
    // pending: chờ admin duyệt | active | locked | rejected
    status: { type: String, enum: ['pending', 'active', 'locked', 'rejected'], default: 'pending', index: true },
    rejectReason: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // 1 gian hàng - 1 chủ
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const shopKey = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase();
export default mongoose.model('Shop', shopSchema);
