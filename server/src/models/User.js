import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  receiver: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  detail: { type: String, required: true, trim: true },
  ward: String,
  district: String,
  province: String,
  isDefault: { type: Boolean, default: false },
});

// Mỗi tài khoản chỉ có MỘT vai trò (role).
//  - customer : khách hàng thân thiết (đã đăng ký)
//  - seller   : người của gian hàng, phân biệt owner (chủ, duy nhất 1/gian hàng) và staff (nhân viên)
//  - cskh     : nhân viên chăm sóc khách hàng
//  - admin    : quản trị viên
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'seller', 'cskh', 'admin'], required: true, index: true },
    sellerRole: { type: String, enum: ['owner', 'staff'] },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    // pending: nhân viên gian hàng chờ chủ gian hàng duyệt
    status: { type: String, enum: ['active', 'pending', 'locked', 'rejected'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
    points: { type: Number, default: 0, min: 0 },
    addresses: [addressSchema],
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_d, ret) => {
    delete ret.passwordHash;
    delete ret.resetTokenHash;
    delete ret.resetTokenExpires;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
