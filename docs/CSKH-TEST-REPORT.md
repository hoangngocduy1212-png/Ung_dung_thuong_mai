# Kiểm thử CSKH — 15/11/2026

Kiểm thử trên MongoDB tạm cục bộ, frontend thật và API Express thật. Không thêm collection nghiệp vụ, không ghi dữ liệu Atlas.

## Kết quả

| Bộ kiểm thử | Kết quả |
|---|---|
| `npm run test:local` — toàn bộ luồng dự án | 127/127 đạt |
| `npm run test:cskh` — chức năng CSKH và tranh chấp nhận đơn | 101/101 đạt |
| `npm run test:cskh:extended` — phân quyền, dữ liệu biên, query và xóa đồng thời | 188/188 đạt |
| `npm run test:cskh:ui` — luồng trình duyệt và tích hợp | 16/16 nhóm tình huống đạt |

Tổng: **416 kiểm tra backend/API** và **16 nhóm tình huống trên trình duyệt**. Không ghi nhận lỗi JavaScript trong lượt UI đạt.

## Vấn đề phát hiện và xử lý

1. **Tham số scope có thể vượt phạm vi danh sách.** Trước khi sửa, `scope=__proto__` trả cả khiếu nại nhân viên khác phụ trách; `scope=constructor` và `scope=toString` gây lỗi 500. Đã kiểm tra query bằng Zod trước khi lập bộ lọc: chỉ nhận `pool`, `mine`, `history`; object/toán tử MongoDB và tham số sai trả 400. Có test hồi quy cho tất cả các giá trị này.
2. **Bảo vệ xóa cùng một đánh giá đồng thời.** Đã dùng cập nhật nguyên tử với điều kiện `isDeleted=false`, bảo đảm chỉ một thao tác thành công và không ghi đè người thực sự xóa. Bộ test cũng xóa đồng thời nhiều review khác nhau, so sánh số lượng/điểm sản phẩm và gian hàng với dữ liệu còn tồn tại trong 15 vòng.
3. **Phản hồi thành công kéo người dùng về trang cũ.** Đã tái hiện trường hợp đang gửi phản hồi rồi chuyển sang Khách hàng nhưng bị điều hướng trở lại khiếu nại khi yêu cầu hoàn tất. Đã chỉ điều hướng sau khi gửi nếu người dùng vẫn ở URL gốc; yêu cầu chạy nền vẫn được lưu và số liệu được cập nhật.

## Phạm vi kiểm tra trình duyệt

- Đăng nhập đúng/sai mật khẩu, ghi nhớ phiên, mở tab mới, phiên hết hạn, tài khoản bị khóa, đăng xuất và truy cập lại.
- Tra cứu khách theo tên tiếng Việt không phân biệt hoa thường, email, SĐT; xem địa chỉ và mở đơn liên quan.
- Tra cứu đơn theo mã đơn, mã nhóm, thông tin khách; lọc trạng thái và kết quả rỗng.
- Phân trang khiếu nại, giữ bộ lọc khi tải lại URL, quay lại từ chi tiết.
- Chặn phản hồi chỉ có khoảng trắng, giới hạn 2000 ký tự, hiển thị HTML như văn bản, bấm lặp không gửi hai lần.
- Hộp xác nhận: khóa focus, Escape/hủy giữ nháp; hoàn tất lưu vào lịch sử và không cho sửa tiếp.
- Khách gửi khiếu nại qua giao diện → CSKH nhận/phản hồi → khách thấy phản hồi → CSKH chuyển admin → admin quyết định hoàn tiền → trạng thái thanh toán và kết quả hiển thị đúng cho khách/CSKH.
- Hai nhân viên cùng mở đơn: người đến sau bị chặn, nội dung nháp được giữ lại, tải lại không lộ chi tiết ngoài quyền.
- Tìm/lọc đánh giá theo tên, sản phẩm, số sao; hủy/xác nhận xóa; xóa bản ghi cuối trang tự về trang hợp lệ; tính lại điểm.
- Lỗi mạng/HTTP 500 có thông báo và thử lại được; lỗi gửi không mất nháp; đổi trang trong lúc gửi được tôn trọng.
- ID sai và ID không tồn tại có thông báo lỗi và đường quay lại.
- Kiểm tra màn hình 375, 390, 768, 1024 và 1440 px; menu tài khoản trên điện thoại; không tràn ngang toàn trang.

## Tái chạy

Chạy bốn lệnh ở bảng kết quả trong thư mục `server/`. Chi tiết thiết lập trình duyệt và thư mục ảnh/báo cáo: [CSKH.md](CSKH.md).

Đây là kiểm thử tích hợp trên dữ liệu tạm; không phải kiểm thử tải hoặc kiểm thử triển khai production/Atlas.
