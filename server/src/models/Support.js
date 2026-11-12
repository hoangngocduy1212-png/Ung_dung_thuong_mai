import mongoose from 'mongoose';
const oid = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    order: { type: oid, ref: 'Order', required: true },
    product: { type: oid, ref: 'Product', required: true, index: true },
    shop: { type: oid, ref: 'Shop', required: true, index: true },
    customer: { type: oid, ref: 'User', required: true },
    variantName: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, default: '' },
    reply: { content: String, by: { type: oid, ref: 'User' }, at: Date },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: oid, ref: 'User' },
  },
  { timestamps: true }
);
reviewSchema.index({ order: 1, product: 1 }, { unique: true }); // mỗi sản phẩm trong 1 đơn chỉ đánh giá 1 lần

// Yêu cầu sau bán hàng, do seller xử lý:
//  huy_don (đơn đã xác nhận nhưng chưa giao) | hoan_tien (trả hàng + hoàn tiền) | doi_hang (đổi sản phẩm)
const afterSalesSchema = new mongoose.Schema(
  {
    order: { type: oid, ref: 'Order', required: true, index: true },
    customer: { type: oid, ref: 'User', required: true, index: true },
    shop: { type: oid, ref: 'Shop', required: true, index: true },
    type: { type: String, enum: ['huy_don', 'hoan_tien', 'doi_hang'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['cho_xu_ly', 'da_chap_nhan', 'bi_tu_choi'], default: 'cho_xu_ly', index: true },
    sellerNote: String,
    handledBy: { type: oid, ref: 'User' },
    handledAt: Date,
  },
  { timestamps: true }
);

// Đơn khiếu nại gửi CSKH. Khách tự điền thông tin liên lạc, mã đơn, lý do.
const complaintSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    customer: { type: oid, ref: 'User', required: true, index: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: String,
    order: { type: oid, ref: 'Order', required: true },
    orderCode: { type: String, required: true },
    reason: { type: String, required: true },
    // moi -> dang_xu_ly -> da_xu_ly | chuyen_admin -> da_xu_ly
    status: { type: String, enum: ['moi', 'dang_xu_ly', 'chuyen_admin', 'da_xu_ly'], default: 'moi', index: true },
    assignedTo: { type: oid, ref: 'User' }, // CSKH phụ trách
    responses: [{ by: { type: oid, ref: 'User' }, role: String, content: String, at: { type: Date, default: Date.now }, _id: false }],
    result: String, // kết quả cuối cùng
    escalateNote: String,
    escalatedAt: Date,
    resolvedBy: { type: oid, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);
export const AfterSales = mongoose.model('AfterSales', afterSalesSchema);
export const Complaint = mongoose.model('Complaint', complaintSchema);
