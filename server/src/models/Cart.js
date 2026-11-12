import mongoose from 'mongoose';
const oid = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    user: { type: oid, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: oid, ref: 'Product', required: true },
        variant: { type: oid, ref: 'Variant', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: oid, ref: 'User', required: true, unique: true },
    products: [{ type: oid, ref: 'Product' }],
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
