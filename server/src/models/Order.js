import mongoose from 'mongoose';
const oid = mongoose.Schema.Types.ObjectId;

export const ORDER_STATUS = ['cho_xac_nhan', 'da_xac_nhan', 'dang_giao', 'da_giao', 'hoan_tat', 'da_huy', 'da_tra_hang'];

// Mỗi gian hàng trong một lần thanh toán = 1 đơn hàng riêng. Các đơn cùng lần thanh toán có chung groupCode.
const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    groupCode: { type: String, required: true, index: true },
    customer: { type: oid, ref: 'User', required: true, index: true },
    shop: { type: oid, ref: 'Shop', required: true, index: true },
    items: [
      {
        product: { type: oid, ref: 'Product' },
        variant: { type: oid, ref: 'Variant' },
        productName: String,
        variantName: String,
        image: String,
        price: Number,
        quantity: Number,
        _id: false,
      },
    ],
    shippingAddress: { receiver: String, phone: String, detail: String, ward: String, district: String, province: String },
    note: String,
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    userVoucher: { type: oid, ref: 'UserVoucher' },
    voucherCode: String,
    discountBy: { type: String, enum: ['platform', 'shop'] }, // ai chịu chi phí giảm giá
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }, // = subtotal - discount + shippingFee
    sellerRevenue: { type: Number, required: true }, // doanh thu gian hàng nhận = subtotal - (discount nếu shop chịu)
    status: { type: String, enum: ORDER_STATUS, default: 'cho_xac_nhan', index: true },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: { type: oid, ref: 'User' }, note: String, _id: false }],
    payment: {
      method: { type: String, enum: ['cod', 'online'], required: true },
      status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
      paidAt: Date,
      txnId: String,
    },
    deliveredAt: Date,
    completedAt: Date,
    pointsEarned: { type: Number, default: 0 },
    cancelReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
