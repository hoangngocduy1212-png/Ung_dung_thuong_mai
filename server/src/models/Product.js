import mongoose from 'mongoose';

const oid = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema(
  {
    shop: { type: oid, ref: 'Shop', required: true, index: true },
    category: { type: oid, ref: 'Category', required: true, index: true },
    brand: { type: oid, ref: 'Brand' },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: [String],
    hidden: { type: Boolean, default: false }, // seller ẩn/hiện
    isDeleted: { type: Boolean, default: false }, // xóa mềm
    minPrice: { type: Number, default: 0, index: true }, // giá thấp nhất trong các biến thể (để lọc/sắp xếp)
    soldCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Biến thể (SKU): mỗi biến thể có giá + tồn kho riêng. Sản phẩm không có lựa chọn
// (ví dụ chuột) vẫn có đúng 1 biến thể mặc định. Tồn kho nằm ở đây, KHÔNG có bảng tồn kho riêng.
const variantSchema = new mongoose.Schema(
  {
    product: { type: oid, ref: 'Product', required: true, index: true },
    name: { type: String, required: true, trim: true }, // ví dụ "Đen / 256GB"
    sku: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
export const Variant = mongoose.model('Variant', variantSchema);
