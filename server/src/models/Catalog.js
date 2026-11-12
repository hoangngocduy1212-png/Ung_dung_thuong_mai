import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
export const Brand = mongoose.model('Brand', brandSchema);
