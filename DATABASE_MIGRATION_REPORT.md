# BÁO CÁO THỰC THI MIGRATION & MERGE DỮ LIỆU MONGODB
## ANIMATION LAB → MAIN PROJECT (TECHSTORE)

- **Thời điểm thực hiện:** 2026-11-18T21:43:37.943Z
- **Database Nguồn (Lab):** `ecommerce_electronics_lab` (Local Deployment: 127.0.0.1:27017)
- **Database Đích (Main):** `ecommerce_electronics` (Cloud Deployment: MongoDB Atlas Cluster)
- **Chiến lược:** MERGE – KHÔNG REPLACE (Bảo toàn tuyệt đối dữ liệu gốc của Main)

---

## 1. BACKUP & XÁC MINH AN TOÀN TRƯỚC MIGRATION
- **Thư mục lưu trữ backup:** `C:\Project\DatabaseBackups\before_lab_merge_20261119`
- **Phương pháp backup:** MongoDB Canonical Extended JSON (EJSON) kèm Checksum SHA256 từng collection.
- **Trạng thái xác minh:** Đã đối soát 100% 16/16 collection và 55/55 documents trước khi thực hiện thao tác ghi.
- **Manifest:** `backup-manifest.json` được lưu độc lập ngoài source code.

---

## 2. KẾT QUẢ MERGE THEO TỪNG COLLECTION

| Collection | Trước Migration | Sau Migration | Thay đổi (+/-) | Hành động thực tế | Ghi chú bảo mật & toàn vẹn |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **categories** | 10 | 15 | **+5** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **brands** | 11 | 41 | **+30** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **users** | 6 | 15 | **+9** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **shops** | 1 | 7 | **+6** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **products** | 6 | 164 | **+158** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **variants** | 10 | 262 | **+252** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **vouchers** | 3 | 4 | **+1** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **orders** | 3 | 16 | **+13** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **reviews** | 0 | 13 | **+13** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **carts** | 3 | 3 | **0** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **wishlists** | 1 | 1 | **0** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **aftersales** | 0 | 0 | **0** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **complaints** | 0 | 0 | **0** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |
| **paymenttransactions** | 0 | 0 | **0** | BẢO TOÀN / MỞ RỘNG | Bảo toàn dữ liệu gốc, remap ID |

---

## 3. KIỂM TRA QUAN HỆ THAM CHIẾU (REFERENTIAL INTEGRITY)
- **Sản phẩm (Products):** 100% sản phẩm có `shop`, `category`, `brand` hợp lệ tồn tại trong cơ sở dữ liệu.
- **Biến thể (Variants):** 100% biến thể liên kết chính xác với `product` hợp lệ.
- **Gian hàng (Shops):** 100% gian hàng được gắn đúng `owner` là tài khoản User hợp lệ, tuân thủ unique index `{ owner: 1 }` và `{ nameKey: 1 }`.
- **Đánh giá (Reviews):** 100% đánh giá liên kết đúng `order`, `product`, `shop`, `customer`.
- **Số lỗi tham chiếu (Orphan Records):** **0 lỗi**.

---

## 4. KẾT QUẢ KIỂM THỬ API TRỰC TIẾP (LIVE API VERIFICATION)

Backend port 5000 đã phản hồi trực tiếp các truy vấn dữ liệu thực tế sau khi merge:

| Endpoint | HTTP Status | Kết quả thực tế |
| :--- | :---: | :--- |
| `GET /api/health` | 200 OK | {"ok":true} |
| `GET /api/products (toàn bộ)` | 200 OK | Tổng số: 164 sản phẩm |
| `GET /api/products?page=1&limit=12` | 200 OK | Trang 1: 12/164 sản phẩm |
| `GET /api/categories` | 200 OK | 15 danh mục khả dụng |
| `GET /api/brands` | 200 OK | 41 thương hiệu khả dụng |
| `GET /api/auth/shops` | 200 OK | 7 gian hàng đang hoạt động |
| `GET /api/products/:id (iPhone 16 Pro Max 256GB)` | 200 OK | Giá từ: 34.490.000đ, Biến thể: 4 |

---

## 5. BẢO VỆ DỮ LIỆU NGƯỜI DÙNG & GIAO DỊCH GỐC
- **Tài khoản người dùng thật:** Toàn bộ tài khoản người dùng thật trên Main (`hoangngocduy1212@gmail.com`, `duygenshin2604@gmail.com`) được bảo toàn tuyệt đối, không bị sửa đổi mật khẩu hay quyền hạn.
- **Đơn hàng & Giỏ hàng gốc:** Toàn bộ đơn hàng và giỏ hàng của người dùng trước đó không bị xáo trộn.
- **Chỉ nhập dữ liệu demo:** Toàn bộ người dùng mới thêm vào chỉ là các tài khoản demo (`@shop.local`).

---

## 6. HƯỚNG DẪN ROLLBACK KHẨN CẤP (NẾU CẦN)
Nếu cần khôi phục lại trạng thái MongoDB trước khi merge:
1. Bản backup Extended JSON đã có sẵn tại `C:\Project\DatabaseBackups\before_lab_merge_20261119`.
2. Có thể xóa các document có thời gian tạo mới trong đợt merge, hoặc khôi phục toàn bộ từ file json thông qua script khôi phục.
