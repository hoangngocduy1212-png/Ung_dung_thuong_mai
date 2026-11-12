import AppError from '../utils/AppError.js';

export const notFound = (req, _res, next) => next(new AppError(`Không tìm thấy ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'CastError') { status = 400; message = 'ID không hợp lệ'; }
  else if (err.code === 11000) { status = 409; message = 'Dữ liệu đã tồn tại (trùng giá trị duy nhất)'; }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join('; '); }
  else if (err.code === 'LIMIT_FILE_SIZE') { status = 400; message = 'Ảnh quá lớn (tối đa 3MB)'; }
  if (status >= 500) { console.error(err); message = 'Lỗi máy chủ'; }
  res.status(status).json({ message, details: err.details });
};
