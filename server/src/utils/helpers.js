import { z } from 'zod';
import AppError from './AppError.js';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Kiểm tra dữ liệu gửi lên bằng zod, trả lỗi 400 dễ đọc
export function parse(schema, data) {
  const r = schema.safeParse(data ?? {});
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.') || 'dữ liệu'}: ${i.message}`).join('; ');
    throw new AppError(`Dữ liệu không hợp lệ - ${msg}`, 400);
  }
  return r.data;
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function pageParams(q, defLimit = 20) {
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit) || defLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export const paged = (items, total, { page, limit }) => ({
  items,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

export const genCode = (prefix) => {
  const d = new Date();
  const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `${prefix}${ymd}${rnd}`;
};

export const zId = z.string().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ');
export const zPhone = z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ');
export const zPassword = z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100);
export const zEmail = z.string().email('Email không hợp lệ').transform((s) => s.toLowerCase().trim());
