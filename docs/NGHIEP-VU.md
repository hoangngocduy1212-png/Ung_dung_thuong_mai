# Quy tắc nghiệp vụ đã chốt – Sàn TMĐT thiết bị điện tử

## Tác nhân & tài khoản
- Mỗi tài khoản **một vai trò**: khách hàng, người bán (chủ gian hàng / nhân viên gian hàng), CSKH, quản trị viên.
- Khi đăng ký người bán phải chọn: **chủ doanh nghiệp** hoặc **nhân viên**.
  - Chủ: nhập tên gian hàng → gian hàng ở trạng thái *chờ duyệt* → admin duyệt. Mỗi gian hàng chỉ có **1 chủ**; trùng tên gian hàng bị từ chối.
  - Nhân viên: chọn gian hàng đã hoạt động → chờ **chủ gian hàng duyệt** mới đăng nhập được. Một gian hàng có nhiều nhân viên.
- Phân quyền trong gian hàng: chủ làm được tất cả; nhân viên làm được sản phẩm, tồn kho, đơn hàng, đổi trả, voucher, đánh giá; **không** sửa thông tin gian hàng, quản lý nhân viên, xem thống kê doanh thu (quyết định của người làm, có thể đổi).
- Admin đầu tiên tạo bằng `npm run seed`. CSKH do admin tạo.

## Sản phẩm
- Sản phẩm có ≥ 1 **biến thể** (tên, giá, tồn kho riêng). Không có bảng tồn kho riêng. Không có thông số kỹ thuật.
- Seller ẩn/hiện, xóa mềm. Không cần admin kiểm duyệt sản phẩm. Gian hàng bị khóa → sản phẩm biến mất khỏi sàn.
- Danh mục/thương hiệu do admin quản lý.

## Đặt hàng
- Giỏ nhiều gian hàng → **tách thành nhiều đơn** (mỗi gian hàng 1 đơn), cùng `groupCode`. Phí vận chuyển cố định mỗi đơn (30.000đ, chỉnh ở `config.js`).
- Thanh toán: COD hoặc online (giả lập). COD ghi nhận đã thu khi "Đã giao".
- Tồn kho trừ khi đặt (cập nhật nguyên tử), cộng lại khi hủy.
- Vòng đời: `chờ xác nhận → đã xác nhận → đang giao → đã giao → hoàn tất`; nhánh `đã hủy`, `đã trả hàng`.
- Hoàn tất = khách bấm "Đã nhận hàng" hoặc tự động sau 3 ngày kể từ "Đã giao".

## Hủy / hoàn tiền / đổi trả
- Chờ xác nhận: khách tự hủy ngay. Đã xác nhận (chưa giao): gửi yêu cầu hủy, seller duyệt. Đang giao: không hủy.
- Sau khi giao, trong **7 ngày**: yêu cầu hoàn tiền (trả hàng) hoặc đổi hàng. Seller chấp nhận/từ chối (bắt buộc ghi chú). Mỗi đơn chỉ 1 yêu cầu đang chờ.
- Hoàn tiền chấp nhận: đơn → "đã trả hàng", thanh toán → "đã hoàn", thu hồi điểm đã cộng. Tồn kho **không** tự cộng lại (seller tự chỉnh vì hàng trả có thể lỗi).

## Voucher & điểm
- Chỉ giảm **theo số tiền**. Khách phải **nhận** trước khi dùng. Mỗi bản dùng **1 lần**. Mỗi đơn (mỗi gian hàng) tối đa **1** voucher.
- Voucher gian hàng chỉ dùng cho gian hàng đó, **shop chịu chi phí**. Voucher toàn sàn **sàn chịu**: gian hàng vẫn nhận đủ tiền hàng.
- Nhận miễn phí: mỗi khách 1 lần/voucher. Đổi bằng điểm (chỉ voucher toàn sàn): đổi nhiều lần được; số điểm cần đổi do admin đặt (`pointsCost`).
- Đơn bị hủy trước khi giao → voucher được trả lại nếu còn hạn.
- Điểm: 1 điểm / 10.000đ (sau giảm giá, không tính ship), cộng khi đơn **hoàn tất**, thu hồi khi hoàn tiền.

## Đánh giá
- Chỉ khi đơn **hoàn tất**, mỗi sản phẩm trong mỗi đơn đánh giá 1 lần. Seller phản hồi, CSKH xóa (xóa mềm). Tên người đánh giá được che bớt.

## Khiếu nại
- Khách điền thông tin liên lạc + mã đơn (phải là đơn của mình) + lý do, gửi thẳng CSKH.
- `mới → đang xử lý → đã xử lý`, hoặc CSKH **chuyển admin** (`chuyển admin → đã xử lý`). Admin quyết định cuối, có thể ép hoàn tiền đơn liên quan.
- CSKH đầu tiên phản hồi sẽ phụ trách đơn; CSKH khác không chen vào.

## Thống kê
- Seller (chủ): doanh thu = tiền hàng các đơn hoàn tất (trừ phần voucher shop chịu).
- Admin: tổng giá trị giao dịch toàn sàn (GMV) – không có hoa hồng nên không phải "doanh thu của sàn".

## Chưa làm (giai đoạn sau)
Chat Socket.IO giữa khách và seller, giao diện React, Mobile.
