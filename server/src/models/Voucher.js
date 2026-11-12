import mongoose from 'mongoose';
const oid = mongoose.Schema.Types.ObjectId;

// Voucher chỉ giảm theo SỐ TIỀN. scope=shop: chỉ dùng cho gian hàng đó. scope=platform: do sàn chịu chi phí.
const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    scope: { type: String, enum: ['platform', 'shop'], required: true, index: true },
    shop: { type: oid, ref: 'Shop' },
    amount: { type: Number, required: true, min: 1000 },
    minOrder: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 }, // tổng số lượng phát hành
    remaining: { type: Number, required: true }, // còn lại có thể nhận/đổi
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // pointsCost = 0: nhận miễn phí (mỗi khách 1 lần). > 0: đổi bằng điểm (chỉ voucher toàn sàn, đổi được nhiều lần)
    pointsCost: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Voucher mà khách đã sở hữu. Mỗi bản chỉ dùng 1 lần.
const userVoucherSchema = new mongoose.Schema(
  {
    user: { type: oid, ref: 'User', required: true, index: true },
    voucher: { type: oid, ref: 'Voucher', required: true },
    source: { type: String, enum: ['claim', 'points'], required: true },
    status: { type: String, enum: ['unused', 'used'], default: 'unused' },
    usedAt: Date,
    order: { type: oid, ref: 'Order' },
  },
  { timestamps: true }
);

const pointTxSchema = new mongoose.Schema(
  {
    user: { type: oid, ref: 'User', required: true, index: true },
    delta: { type: Number, required: true },
    type: { type: String, enum: ['earn', 'redeem', 'revoke'], required: true },
    order: { type: oid, ref: 'Order' },
    voucher: { type: oid, ref: 'Voucher' },
    note: String,
  },
  { timestamps: true }
);

export const Voucher = mongoose.model('Voucher', voucherSchema);
export const UserVoucher = mongoose.model('UserVoucher', userVoucherSchema);
export const PointTx = mongoose.model('PointTx', pointTxSchema);
