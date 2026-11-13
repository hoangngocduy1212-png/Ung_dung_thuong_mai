# Hợp đồng API tài khoản khách hàng TechStore

Tất cả URL bên dưới dùng tiền tố `http://localhost:5000/api`. Các route `/customer/*` cần `Authorization: Bearer <token>` và vai trò `customer`; thiếu/sai phiên trả `401`, sai vai trò trả `403`. Lỗi kiểm tra Zod trả `400` dạng `{ message, details }`.

## Hồ sơ, mật khẩu và địa chỉ

| Method / URL | Body / query | Thành công | Lỗi theo route |
|---|---|---|---|
| `GET /auth/me` | Không có | `200 { user, shop? }` | `401` phiên không hợp lệ; `403` tài khoản bị khóa/chờ duyệt |
| `PUT /auth/password` | `{ oldPassword, newPassword }`; mật khẩu mới 6-100 ký tự | `200 { message: "Đã đổi mật khẩu" }` | `400` mật khẩu cũ sai hoặc body không hợp lệ; `401/403` theo xác thực |
| `GET /customer/profile` | Không có | `200` user | `401/403` theo xác thực/vai trò |
| `PUT /customer/profile` | `{ fullName?, phone? }`; tên 2-80 ký tự, phone theo mẫu `0` hoặc `+84` và 9-10 chữ số | `200` user | `400` body không hợp lệ; `401/403` theo xác thực/vai trò |
| `GET /customer/addresses` | Không có | `200` mảng địa chỉ nhúng trong user | `401/403` theo xác thực/vai trò |
| `POST /customer/addresses` | `{ receiver, phone, detail, ward?, district?, province?, isDefault? }`; receiver tối thiểu 2, detail tối thiểu 3, phone theo mẫu backend | `201` mảng địa chỉ đã cập nhật | `400` body không hợp lệ; `401/403` theo xác thực/vai trò |
| `PUT /customer/addresses/:id` | Các field địa chỉ trên, tất cả tùy chọn | `200` mảng địa chỉ đã cập nhật | `400` body không hợp lệ; `404` không tìm thấy địa chỉ; `401/403` theo xác thực/vai trò |
| `DELETE /customer/addresses/:id` | Không có | `200` mảng địa chỉ còn lại | `404` không tìm thấy địa chỉ; `401/403` theo xác thực/vai trò |

Backend lưu địa chỉ trong `User.addresses`; route chỉ bỏ các địa chỉ khác khỏi mặc định khi địa chỉ được cập nhật/tạo với `isDefault: true`. Checkout nhận `addressId` hoặc object `address` cùng các field giao hàng. `Order.shippingAddress` lưu bản sao gồm `receiver`, `phone`, `detail`, `ward`, `district`, `province`, không tham chiếu địa chỉ sổ.

## Voucher, điểm và yêu thích

| Method / URL | Body / query | Thành công | Lỗi theo route |
|---|---|---|---|
| `GET /customer/wishlist` | Không có | `200` mảng sản phẩm wishlist còn trong DB, gồm `variants`, `variantCount`, `totalStock`, `minPrice`, `available`; sản phẩm soft-deleted/ẩn vẫn được trả với `available: false` | `401/403` theo xác thực/vai trò |
| `POST /customer/wishlist/:productId` | Không có | `201 { message }` | `404` sản phẩm không tồn tại; `401/403` theo xác thực/vai trò |
| `DELETE /customer/wishlist/:productId` | Không có | `200 { message }` | `401/403` theo xác thực/vai trò |
| `GET /customer/vouchers/available` | `shop?` | `200` mảng voucher có thể nhận/đổi | `401/403` theo xác thực/vai trò |
| `POST /customer/vouchers/:id/claim` | Không có | `201` UserVoucher | `400` voucher cần đổi điểm/không khả dụng; `404` không tồn tại/hết hạn; `409` đã nhận/hết lượt; `401/403` theo xác thực/vai trò |
| `POST /customer/vouchers/:id/redeem` | Không có | `201 { userVoucher, points }` | `400` loại voucher không hợp lệ/không đủ điểm; `404` không tồn tại/hết hạn; `409` hết lượt; `401/403` theo xác thực/vai trò |
| `GET /customer/my-vouchers` | `status?` (`unused` hoặc `used`) | `200` mảng voucher của khách, mỗi phần tử có `expired` | `401/403` theo xác thực/vai trò |
| `GET /customer/points` | Không có | `200 { points, history }`; history tối đa 100 giao dịch mới nhất | `401/403` theo xác thực/vai trò |

## Đơn hàng và hậu mãi

| Method / URL | Body / query | Thành công | Lỗi theo route |
|---|---|---|---|
| `POST /customer/orders/checkout` | `{ cartItemIds?: string[], addressId?: string, address?: { receiver, phone, detail, ward?, district?, province? }, paymentMethod: "cod"|"online", note?: string (tối đa 500), vouchers?: { [shopId]: userVoucherId } }` | `201 { groupCode, orders }` | `400` body/giỏ/sản phẩm/voucher/địa chỉ không hợp lệ; `404` `addressId` không thuộc sổ; `409` tồn kho hoặc voucher tranh chấp; `401/403` theo xác thực/vai trò |
| `GET /customer/orders` | `page?`, `limit?` (mặc định 10, tối đa 100), `status?` | `200 { items, page, limit, total, totalPages }`; mỗi order có `afterSales` và `reviewedProducts` để dựng nút hành động chính xác | `401/403` theo xác thực/vai trò |
| `GET /customer/orders/:id` | Không có | `200` order kèm `afterSales` và `reviewedProducts` (bao gồm review đã soft-delete để không mở lại lượt đánh giá) | `404` đơn không thuộc khách/không tồn tại; `401/403` theo xác thực/vai trò |
| `POST /customer/orders/group/:groupCode/pay` | Không có | `200 { orders }` | `404` không có đơn online chưa thanh toán; `401/403` theo xác thực/vai trò |
| `POST /customer/orders/:id/cancel` | `{ reason }`, 3-300 ký tự | `200` order | `400` body sai hoặc trạng thái không cho tự hủy; `404` đơn không thuộc khách; `401/403` theo xác thực/vai trò |
| `POST /customer/orders/:id/confirm-received` | Không có | `200` order đã hoàn tất | `400` trạng thái không phải `da_giao` hoặc có yêu cầu hậu mãi đang chờ; `404` đơn không thuộc khách; `401/403` theo xác thực/vai trò |
| `POST /customer/orders/:id/after-sales` | `{ type: "huy_don"|"hoan_tien"|"doi_hang", reason }`; lý do 5-500 ký tự | `201` yêu cầu AfterSales | `400` body, trạng thái hoặc thời hạn không hợp lệ; `404` đơn không thuộc khách; `409` đang có yêu cầu chờ/đã hoàn tiền; `401/403` theo xác thực/vai trò |
| `GET /customer/after-sales` | Không có | `200` mảng yêu cầu, order được populate `code`, `total` | `401/403` theo xác thực/vai trò |
| `GET /customer/reviews` | `page?`, `limit?` (mặc định 10, tối đa 100) | `200 { items, page, limit, total, totalPages }`; review của khách, populate `order.code` và `product.name/images` | `401/403` theo xác thực/vai trò |
| `POST /customer/reviews` | `{ orderId, productId, rating: 1..5, content?: string (tối đa 1000) }` | `201` Review | `400` đơn chưa hoàn tất/sản phẩm không thuộc đơn/body sai; `404` đơn không thuộc khách; `409` đánh giá trùng; `401/403` theo xác thực/vai trò |
| `GET /customer/complaints` | Không có | `200` mảng khiếu nại | `401/403` theo xác thực/vai trò |
| `GET /customer/complaints/:id` | Không có | `200` Complaint, responses populate người phản hồi | `404` không tìm thấy khiếu nại của khách; `401/403` theo xác thực/vai trò |
| `POST /customer/complaints` | `{ contactName, contactPhone, contactEmail?, orderCode, reason }`; tên từ 2 ký tự, phone theo mẫu backend, email nếu có phải hợp lệ, mã đơn từ 5 ký tự, lý do 10-2000 ký tự | `201` Complaint | `400` body không hợp lệ; `404` mã đơn không thuộc tài khoản; `401/403` theo xác thực/vai trò |

## Giới hạn API đã xác nhận

- `GET /products/:id/reviews` vẫn là endpoint công khai, phân trang và che tên người đánh giá; giao diện tài khoản dùng route riêng `/customer/reviews` để đọc review của chính khách.
- AfterSales là cấp đơn, chỉ nhận `type` và một field `reason`; không có productId/item selection hay endpoint upload ảnh cho khách. Ảnh upload hiện chỉ có route `/seller/upload`.
- Review chỉ nhận `orderId`, `productId`, `rating`, `content`; không có upload ảnh. Review soft-deleted bị ẩn khỏi `GET /customer/reviews`, nhưng chi tiết đơn giữ product ID trong `reviewedProducts` để tránh xung đột unique index nếu khách gửi lại.
- Địa chỉ nhúng trong User không có timestamp/last-used field. Khi không có địa chỉ mặc định, checkout chọn phần tử cuối trong mảng địa chỉ (địa chỉ được thêm gần nhất); backend không cung cấp lịch sử dùng gần nhất.
- Mật khẩu đổi thành công không vô hiệu token hiện tại trong middleware/backend; giao diện giữ phiên đang đăng nhập.