# KẾ HOẠCH MERGE DỮ LIỆU MONGODB (LAB → MAIN)
**Ngày phân tích:** 2026-11-18T21:41:08.047Z
**Môi trường Nguồn (Lab):** ecommerce_electronics_lab (Local)
**Môi trường Đích (Main):** ecommerce_electronics (MongoDB Atlas)

## 1. NGUYÊN TẮC AN TOÀN
- **Chiến lược:** MERGE – KHÔNG REPLACE.
- **Bảo toàn dữ liệu Main:** Toàn bộ 6 sản phẩm, 1 gian hàng, 6 tài khoản người dùng, giỏ hàng và đơn hàng gốc của Main được giữ nguyên 100%.
- **Chống trùng lặp:** Ánh xạ remap ObjectId đối với các danh mục và thương hiệu đã có trong Main.
- **Bảo mật:** Không di chuyển tài khoản cá nhân hoặc dữ liệu phiên làm việc từ Lab.

## 2. BẢNG PHÂN LOẠI VÀ SỐ LIỆU DỰ KIẾN
| Collection | Main hiện có | Lab hiện có | Thêm mới (INSERT) | Bỏ qua (SKIP) | Xung đột (CONFLICT) | Hành động đề xuất |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **categories** | 10 | 15 | **+5** | 10 | 0 | INSERT danh mục mới, remap ID |
| **brands** | 11 | 41 | **+30** | 11 | 0 | INSERT thương hiệu mới |
| **users** | 6 | 15 | **+9** | 4 | 0 | INSERT chủ shop demo & khách demo |
| **shops** | 1 | 7 | **+6** | 1 | 0 | INSERT 6 gian hàng demo mới, map TechZone |
| **products** | 6 | 164 | **+158** | 6 | 0 | INSERT 158 sản phẩm mới |
| **variants** | 10 | 262 | **+252** | 10 | 0 | INSERT biến thể thuộc 158 sản phẩm mới |
| **orders** | 3 | 95 | **+13** | 0 | 0 | INSERT 13 đơn demo làm căn cứ cho review |
| **reviews** | 0 | 13 | **+13** | 0 | 0 | INSERT 13 đánh giá mẫu có đầy đủ ref |
| **vouchers** | 3 | 17 | **+1** | 0 | 0 | INSERT voucher demo (GEARVN500K) |

## 3. QUAN HỆ THAM CHIẾU (REFERENTIAL INTEGRITY)
- 100% sản phẩm mới (+158) được liên kết đúng Shop ID, Category ID, Brand ID hợp lệ trong Main.
- 100% biến thể (+252) liên kết đúng Product ID hợp lệ.
- 100% đánh giá (+13) liên kết đúng Order ID, Product ID, Shop ID và User ID.
