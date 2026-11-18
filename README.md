# Sàn thương mại điện tử thiết bị điện tử

Node.js + Express + MongoDB (Mongoose) + JWT. Dự án gồm backend API và giao diện mua sắm HTML/CSS/JavaScript thuần.
Quy tắc nghiệp vụ: xem `docs/NGHIEP-VU.md`.

## Giao diện (frontend)
HTML, CSS và JavaScript thuần (ES modules) trong `frontend/`, gọi trực tiếp API thật, không dùng dữ liệu mock:
- `index.html`: trang chủ, danh mục, thương hiệu, tìm kiếm, lọc, voucher toàn sàn, giỏ và yêu thích.
- `auth.html`: đăng nhập, đăng ký khách hàng/chủ gian hàng/nhân viên, quên và đặt lại mật khẩu.
- `products.html`, `product.html`: danh sách/lọc sản phẩm và chi tiết sản phẩm, biến thể, đánh giá.
- `cart.html`, `checkout.html`, `orders.html`: giỏ hàng, thanh toán/địa chỉ, lịch sử và trạng thái đơn hàng.
- `account.html?section=...`: hồ sơ, sổ địa chỉ, bảo mật, voucher, điểm, yêu thích, đánh giá, hậu mãi và khiếu nại.
- `staff.html`: khu vực CSKH, tra cứu khách/đơn hàng, tiếp nhận/phản hồi/chuyển khiếu nại, quản lý đánh giá và lịch sử xử lý. Tài khoản `cskh` đăng nhập sẽ chuyển thẳng vào đây. Hướng dẫn và hợp đồng API: `docs/CSKH.md`.

Chạy: bật backend (xem bên dưới, cổng 5000), rồi mở thư mục `frontend` bằng Live Server tại `http://127.0.0.1:5500` (hoặc `npx serve -l 5500 frontend`). Địa chỉ API đặt ở `frontend/js/config.js` (`API_BASE_URL`).

Checkout tải mới hồ sơ và sổ địa chỉ khi mở. Địa chỉ mặc định được chọn trước; nếu chưa có mặc định, lấy địa chỉ thêm gần nhất. Có thể lưu địa chỉ hoặc gửi trực tiếp địa chỉ chỉ dùng cho đơn hiện tại. Backend lưu snapshot địa chỉ trong đơn, nên sửa sổ địa chỉ không đổi đơn cũ. Tài khoản cần role `customer`; khách vãng lai được chuyển tới đăng nhập, vai trò khác nhận thông báo trang dành cho khách hàng.

Tài liệu method, URL, body, response và mã lỗi của API khách hàng nằm trong `docs/TAI-KHOAN-API.md`. API khách hàng có danh sách review riêng tại `GET /customer/reviews`; ảnh review và ảnh yêu cầu hậu mãi hiện chưa được hỗ trợ.

CORS: backend cho phép `http://127.0.0.1:5500`, `http://localhost:5500` và các origin trong `CLIENT_ORIGIN` (phân tách bằng dấu phẩy).

Ghi chú: chưa có dịch vụ email, nên khi quên mật khẩu (môi trường không phải production) backend trả `devResetToken` và giao diện hiển thị liên kết đặt lại. Backend không có khái niệm "kênh", nên cảnh báo "sai kênh" được suy ra từ vai trò tài khoản ở phía giao diện. Thanh toán online hiện là mô phỏng theo API; phí ship và tổng tiền chính thức do backend trả về sau khi đặt hàng.

## Chạy thử
```bash
cd server
npm install
cp .env.example .env      # sửa MONGODB_URI thành chuỗi kết nối MongoDB Atlas, đổi JWT_SECRET
npm run seed:demo         # admin + danh mục + dữ liệu mẫu
npm run dev               # http://localhost:5000/api/health
npm test                  # kiểm thử toàn bộ luồng (dùng CSDL tạm rồi xóa)
npm run test:local        # bộ smoke với MongoDB tạm cục bộ, không dùng Atlas
npm run test:cskh         # kiểm thử riêng CSKH và các tình huống đồng thời trên DB tạm
```
Atlas: tạo cluster → Database Access (user/mật khẩu) → Network Access (thêm IP của bạn) → Connect → Drivers → copy chuỗi, thay `<password>`, thêm tên DB `/ecommerce_electronics`.

Tài khoản mẫu: `admin@shop.local / Admin@123`, `cskh@shop.local / Cskh@123`, `owner@shop.local / Owner@123`, `khach@shop.local / Khach@123`.

Cấu hình backend đọc `server/.env`, hoặc `.env` ở thư mục gốc nếu không có cấu hình tương ứng trong `server/.env`. Biến môi trường truyền trực tiếp luôn được ưu tiên. `npm run preview:cskh` chạy API với dữ liệu demo và tài khoản `cskh@demo.local / Demo@123` trong MongoDB tạm, không thay đổi dữ liệu Atlas. Nếu đổi cổng backend, cập nhật `API_BASE_URL` trong `frontend/js/config.js` theo cổng đó.

## Các nhóm API (`/api`, gửi `Authorization: Bearer <token>`)
| Nhóm | Tiền tố | Ghi chú |
|---|---|---|
| Xác thực | `/auth` | register, register-seller, login, forgot/reset-password, password |
| Khách vãng lai | `/categories` `/brands` `/products` `/products/:id/reviews` `/shops/:id` `/vouchers/platform` `/auth/shops` | không cần đăng nhập; lọc sản phẩm bằng `q category brand shop minPrice maxPrice sort page` |
| Khách hàng | `/customer` | profile; addresses; cart (`/cart`, `/cart/items`); wishlist; vouchers/points; orders (`/orders/checkout`, `/orders`, `/orders/:id`, `/orders/group/:groupCode/pay`); after-sales và reviews |
| Người bán | `/seller` | shop, staff, products, inventory, orders, after-sales, vouchers, reviews, stats, upload |
| CSKH | `/staff` | customers, orders, complaints, reviews |
| Quản trị | `/admin` | stats, customers, shops, cskh, vouchers, categories, brands, orders, complaints |

## Giao diện mới (React + TypeScript — Phase 0)
Nằm tại `frontend-react/`, sử dụng React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + React Router v7:
- Chạy song song với Vanilla frontend, không làm ảnh hưởng giao diện hiện có.
- API Client kết nối đồng bộ Backend Port 5000.
- Khởi động:
  ```bash
  cd frontend-react
  npm install
  npm run dev      # Mở tại http://localhost:5173
  ```

## Cấu trúc
```
server/src/       models/ (dữ liệu)  routes/ (API theo tác nhân)  services/ (đặt hàng, voucher, điểm, thống kê)  middleware/  seed.js
server/test/      test suites (smoke.js, local.js, cskh.js, cskh-extended.js, cskh-ui.js - 440 tests PASS)
frontend/         Vanilla HTML/CSS/JS (Live Server Port 5500)
frontend-react/   React + TypeScript + Vite (Port 5173)
```
