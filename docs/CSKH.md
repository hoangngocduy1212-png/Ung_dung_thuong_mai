# Khu vực nhân viên chăm sóc khách hàng

Trang `frontend/staff.html` dùng HTML/CSS/JavaScript thuần và các API `/api/staff` của dự án. Chỉ tài khoản có vai trò `cskh` truy cập được; tài khoản do quản trị viên cấp. Sau khi đăng nhập ở lối vào **Dành cho CSKH / Quản trị viên**, nhân viên CSKH được chuyển thẳng vào trang này.

## Các chức năng đã triển khai

| Chức năng | Cách sử dụng |
|---|---|
| Đăng nhập/đăng xuất | Đăng nhập bằng tài khoản được cấp; nút Đăng xuất xóa phiên trong trình duyệt. |
| Tra cứu khách hàng | Tìm theo tên, email hoặc SĐT; xem thông tin, địa chỉ và 20 đơn gần nhất; mở đơn liên quan. |
| Tra cứu đơn hàng | Tìm theo mã đơn, mã nhóm, tên/email/SĐT khách; lọc trạng thái; xem sản phẩm, giao hàng, thanh toán và lịch sử trạng thái. |
| Tiếp nhận khiếu nại | Mở Chờ tiếp nhận, xem nội dung, liên hệ và đơn liên quan. Phản hồi đầu tiên đồng thời nhận quyền phụ trách. |
| Phản hồi khiếu nại | Chọn Phản hồi khách hàng, nhập nội dung và gửi. Khách xem được phản hồi trong tài khoản của họ. |
| Hoàn tất khiếu nại | Chọn Hoàn tất khiếu nại, nhập kết quả và xác nhận. Khiếu nại xuất hiện trong Lịch sử xử lý. |
| Chuyển admin | Chọn Chuyển quản trị viên, ghi lý do và xác nhận. Sau khi chuyển, CSKH chỉ theo dõi; admin đưa ra kết quả cuối bằng API quản trị hiện có. |
| Xem đánh giá | Tìm tên sản phẩm, lọc số sao, hoặc nhấn tên sản phẩm để xem riêng đánh giá của sản phẩm đó. Gồm cả sản phẩm đã ẩn/ngừng bán. |
| Xóa đánh giá | Xem nội dung và xác nhận trước khi xóa mềm; hệ thống lưu người xóa, tính lại điểm sản phẩm và gian hàng. |
| Lịch sử xử lý | Xem các khiếu nại mình phụ trách đã đóng, kể cả admin đóng sau khi chuyển lên. Tìm theo mã, thông tin liên hệ hoặc nội dung. |

Danh sách có phân trang, trạng thái tải, thông báo lỗi/thử lại và thông báo khi chưa có kết quả. URL lưu mục, bộ lọc, trang và ID chi tiết; có thể tải lại, chia sẻ trong nội bộ hoặc dùng nút quay lại của trình duyệt. Giao diện hỗ trợ bàn phím và màn hình điện thoại.

Giao diện dùng chung logo, header, menu tài khoản và footer qua `mountShoppingChrome` (biến thể hỗ trợ nội bộ). Font, nút, biểu mẫu, menu bên trái, modal và màu trạng thái được kế thừa từ CSS dùng chung của các trang mua sắm/tài khoản; phần CSKH chỉ bổ sung bố cục nghiệp vụ. Đăng xuất nằm trong menu tài khoản ở header, giống các trang còn lại.

## Quy tắc dữ liệu

- Dùng nguyên các collection `users`, `orders`, `reviews`, `complaints` và những tham chiếu sản phẩm/gian hàng hiện có. Không thêm collection nghiệp vụ.
- `complaints.responses` lưu các phản hồi; `assignedTo` lưu nhân viên phụ trách; `result`, `resolvedBy`, `resolvedAt` lưu kết quả.
- Nhận quyền phụ trách và thay đổi trạng thái được thực hiện bằng một `findOneAndUpdate` có điều kiện. Hai nhân viên thao tác đồng thời chỉ có một người thành công; người còn lại nhận `403`.
- CSKH khác không được đọc chi tiết hoặc sửa khiếu nại đã có người phụ trách. CSKH không được sửa khiếu nại đã chuyển admin hoặc đã xử lý.
- Lý do chuyển admin được lưu cùng khiếu nại; phản hồi và kết quả cuối hiển thị trong luồng khiếu nại của khách hàng.
- Đăng xuất dùng cơ chế JWT hiện có: xóa token ở trình duyệt; API không thu hồi từng token. Khóa/xóa tài khoản có hiệu lực với token cũ nhờ middleware luôn đọc lại tài khoản.

## API được sử dụng

Tất cả route dưới đây dùng tiền tố `/api/staff` và `Authorization: Bearer <token>`. Sai vai trò trả `403`, chưa đăng nhập trả `401`.

| Method / URL | Tham số hoặc body |
|---|---|
| `GET /customers` | `q`, `page`, `limit` |
| `GET /customers/:id` | Chi tiết và `recentOrders` |
| `GET /orders` | `q`, `status`, `page`, `limit` |
| `GET /orders/:id` | Chi tiết đơn hàng |
| `GET /complaints` | `scope=pool\|mine\|history`, `q`, `page`, `limit` |
| `GET /complaints/:id` | Chi tiết, `responses`, `orderDetail` |
| `POST /complaints/:id/respond` | `{ "content": "..." }`, 2–2000 ký tự sau khi trim |
| `POST /complaints/:id/resolve` | `{ "result": "..." }`, 3–2000 ký tự sau khi trim |
| `POST /complaints/:id/escalate` | `{ "note": "..." }`, 3–2000 ký tự sau khi trim |
| `GET /reviews` | `q` (tên sản phẩm), `product` (ID), `rating`, `page`, `limit` |
| `DELETE /reviews/:id` | Xóa mềm; không cần body |

`scope=mine` gồm đơn đang xử lý và đã chuyển admin. `scope=history` chỉ gồm đơn đã xử lý của nhân viên hiện tại, sắp theo thời điểm hoàn tất mới nhất. Các bộ lọc tìm kiếm được kết hợp với phạm vi quyền, không mở rộng quyền truy cập.

## Chạy ứng dụng

1. Cài dependencies trong `server/` bằng `npm ci` nếu chưa cài.
2. Cấu hình `.env` ở `server/.env` hoặc thư mục gốc. `server/.env` được ưu tiên, biến môi trường truyền trực tiếp được ưu tiên cao nhất.
3. Trong `server/`, chạy `npm run dev` hoặc `npm start`.
4. Phục vụ `frontend/` tại `http://127.0.0.1:5500` bằng Live Server hoặc `python3 -m http.server 5500 --directory frontend` từ thư mục gốc.
5. Mở `http://127.0.0.1:5500/auth.html?tab=staff&view=login`.

API mặc định của giao diện là `http://localhost:5000/api` trong `frontend/js/config.js`. Nếu đổi `PORT` của backend (ví dụ 5000 bị ứng dụng khác chiếm), cần đổi URL này theo cùng cổng.

## Kiểm thử an toàn bằng database tạm

Chạy trong `server/`:

```bash
npm run test:local
npm run test:cskh
npm run test:cskh:extended
npm run test:cskh:ui
```

Các lệnh này tạo MongoDB tạm cục bộ và dọn khi kết thúc, không lấy URI Atlas từ `.env`. Lần chạy đầu có thể cần tải binary MongoDB.

`test:local` chạy bộ smoke toàn hệ thống hiện có. `test:cskh` kiểm tra xác thực, phân quyền, tìm kiếm, chi tiết, phân trang, phản hồi, hoàn tất, chuyển admin, lịch sử, xóa review và mọi cặp thao tác đồng thời giữa hai nhân viên (27 tình huống). Có kiểm tra đồng thời nhiều phản hồi của cùng nhân viên để tránh mất nội dung.

`test:cskh:extended` kiểm tra mọi API CSKH với các vai trò khác nhau, JWT sai/hết hạn, ID sai/không tồn tại, tham số đặc biệt (`__proto__`, object query), giới hạn nội dung, giả mạo body và xóa đánh giá đồng thời. Query chỉ nhận từ khóa tối đa 200 ký tự, phạm vi/trạng thái/số sao hợp lệ, ID sản phẩm hợp lệ và số trang/limit nguyên dương; limit thực tế tối đa 100. Tham số sai trả `400` thay vì đưa trực tiếp vào MongoDB.

`test:cskh:ui` chạy trình duyệt với frontend và API thật trên các cổng ngẫu nhiên. Bộ test đi qua cả giao diện khách hàng, CSKH và API admin; kiểm tra hoàn tiền, bảo vệ phiên, nhập liệu, mất mạng, bấm lặp, đổi trang khi đang gửi, phân trang sau xóa và màn hình 375–1440 px. Test xuất `report.json`, ảnh desktop/mobile và ảnh lỗi vào thư mục tạm được in ở cuối. Có thể chỉ định thư mục kết quả bằng `CSKH_TEST_OUTPUT_DIR`.

Trên macOS, test UI dùng Google Chrome nếu có sẵn. Với máy chưa có trình duyệt phù hợp, chạy `npx playwright install chromium`; hoặc truyền đường dẫn trình duyệt bằng `CSKH_BROWSER_PATH`. Playwright chỉ là dependency phát triển, không cần mở trình duyệt khi chạy backend thông thường.

Để xem giao diện với dữ liệu demo, chạy `npm run preview:cskh`, rồi phục vụ `frontend/` như trên. Tài khoản demo: `cskh@demo.local / Demo@123`. Dữ liệu của lệnh này chỉ tồn tại trong MongoDB tạm; dừng tiến trình sẽ xóa dữ liệu demo. Có thể dùng `PORT=5001 npm run preview:cskh` nếu cổng 5000 bận, và đổi URL API frontend tương ứng.
