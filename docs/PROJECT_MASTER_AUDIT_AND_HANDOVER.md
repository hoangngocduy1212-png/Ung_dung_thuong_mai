# TÀI LIỆU TỔNG HỢP KIỂM TOÁN VÀ BÀN GIAO DỰ ÁN TOÀN DIỆN
## (MASTER PROJECT AUDIT & AI HANDOVER SPECIFICATION)
### Project: Ung_dung_thuong_mai (Sàn Thương Mại Điện Tử Thiết Bị Điện Tử)

---

**Thông tin bàn giao kỹ thuật:**
- **Thư mục gốc của dự án (Project Root):** `C:\Project\Ung_dung_thuong_mai`
- **Thời điểm tổng hợp:** 17/11/2026 — 23:15 (Giờ địa phương GMT+7)
- **Tình trạng Git:** Nhánh `main`, commit mới nhất `e9d0293` (Merge pull request #1 from hoangngocduy1212-png/vy), Working tree clean (toàn bộ mã nguồn gốc được bảo tồn nguyên vẹn 100%).
- **Đối tượng tiếp quản chính thức:** Kỹ sư Trí tuệ nhân tạo (AI Software Engineer / DeepSeek / Autonomous Agents).
- **Mục đích tài liệu:** Cung cấp duy nhất một tài liệu tổng hợp tập trung (Single Source of Truth), tích hợp toàn bộ kết quả kiểm toán mã nguồn, cơ sở dữ liệu, API, giao diện, quy trình nghiệp vụ và hướng dẫn lập trình để AI tiếp quản có thể tiếp tục phát triển ngay lập tức mà không phải khảo sát lại từ đầu và **tuyệt đối không tạo lại những gì dự án đã có**.

---

# MỤC LỤC TỔNG HỢP

- [PHẦN I — PROJECT OVERVIEW](#phần-i--project-overview)
  - [1.1. Giới thiệu dự án & Mục tiêu kinh doanh](#11-giới-thiệu-dự-án--mục-tiêu-kinh-doanh)
  - [1.2. Công nghệ và ngăn xếp kỹ thuật thực tế](#12-công-nghệ-và-ngăn-xếp-kỹ-thuật-thực-tế)
  - [1.3. Cấu trúc tổng thể các phân hệ](#13-cấu-trúc-tổng-thể-các-phân-hệ)
  - [1.4. Đánh giá mức độ hoàn thiện tổng thể](#14-đánh-giá-mức-độ-hoàn-thiện-tổng-thể)
  - [1.5. Những phát hiện cốt lõi (Key Findings)](#15-những-phát-hiện-cốt-lõi-key-findings)
- [PHẦN II — COMPLETE PROJECT FILE TREE](#phần-ii--complete-project-file-tree)
  - [2.1. Quy tắc kiểm kê và giải trình các thư mục bị loại trừ](#21-quy-tắc-kiểm-kê-và-giải-trình-các-thư-mục-bị-loại-trừ)
  - [2.2. Sơ đồ cây thư mục và 103 tệp tin chi tiết không rút gọn](#22-sơ-đồ-cây-thư-mục-và-103-tệp-tin-chi-tiết-không-rút-gọn)
- [PHẦN III — COMPLETE FILE CATALOG](#phần-iii--complete-file-catalog)
  - [3.1. Danh mục Tệp tin gốc và Tài liệu dự án](#31-danh-mục-tệp-tin-gốc-và-tài-liệu-dự-án)
  - [3.2. Danh mục Giao diện Frontend (HTML Pages & Controllers)](#32-danh-mục-giao-diện-frontend-html-pages--controllers)
  - [3.3. Danh mục Lớp Dịch vụ và Tiện ích Frontend (Services & Utils)](#33-danh-mục-lớp-dịch-vụ-và-tiện-ích-frontend-services--utils)
  - [3.4. Danh mục Tệp tin Phong cách (CSS Stylesheets)](#34-danh-mục-tệp-tin-phong-cách-css-stylesheets)
  - [3.5. Danh mục Máy chủ Backend, Cấu hình và Middleware](#35-danh-mục-máy-chủ-backend-cấu-hình-và-middleware)
  - [3.6. Danh mục Mô hình Dữ liệu Mongoose Models](#36-danh-mục-mô-hình-dữ-liệu-mongoose-models)
  - [3.7. Danh mục Định tuyến Máy chủ (API Routes)](#37-danh-mục-định-tuyến-máy-chủ-api-routes)
  - [3.8. Danh mục Dịch vụ Nghiệp vụ Backend (Business Services)](#38-danh-mục-dịch-vụ-nghiệp-vụ-backend-business-services)
  - [3.9. Danh mục Kịch bản và Bộ kiểm thử (Test Suites)](#39-danh-mục-kịch-bản-và-bộ-kiểm-thử-test-suites)
- [PHẦN IV — ARCHITECTURE & MODULE DEPENDENCIES](#phần-iv--architecture--module-dependencies)
  - [4.1. Sơ đồ luồng phụ thuộc đa tầng (Mermaid Flowchart)](#41-sơ-đồ-luồng-phụ-thuộc-đa-tầng-mermaid-flowchart)
  - [4.2. Sơ đồ Thực thể - Quan hệ CSDL (Mermaid ER Diagram)](#42-sơ-đồ-thực-thể---quan-hệ-csdl-mermaid-er-diagram)
  - [4.3. Phân tích các Module bị cô lập / Mất kết nối](#43-phân-tích-các-module-bị-cô-lập--mất-kết-nối)
  - [4.4. Bản đồ phụ thuộc thư viện bên ngoài (Dependencies Map)](#44-bản-đồ-phụ-thuộc-thư-viện-bên-ngoài-dependencies-map)
- [PHẦN V — EXISTING IMPLEMENTATION INDEX](#phần-v--existing-implementation-index)
  - [5.1. Bảng tra cứu chức năng hiện có để tránh tạo trùng tệp](#51-bảng-tra-cứu-chức-năng-hiện-có-để-tránh-tạo-trùng-tệp)
  - [5.2. Mẫu mã nguồn kết nối API sẵn có cho Seller Center & Admin Console](#52-mẫu-mã-nguồn-kết-nối-api-sẵn-có-cho-seller-center--admin-console)
- [PHẦN VI — FEATURE INVENTORY](#phần-vi--feature-inventory)
  - [6.1. Bảng kiểm kê 70 tính năng hệ thống chi tiết](#61-bảng-kiểm-kê-70-tính-năng-hệ-thống-chi-tiết)
  - [6.2. Thống kê tỷ lệ hoàn thiện theo 4 nhóm đối tượng](#62-thống-kê-tỷ-lệ-hoàn-thiện-theo-4-nhóm-đối-tượng)
- [PHẦN VII — API & DATABASE AUDIT](#phần-vii--api--database-audit)
  - [7.1. Bảng kiểm toán 58 Backend API Endpoints](#71-bảng-kiểm-toán-58-backend-api-endpoints)
  - [7.2. Kiểm toán chi tiết 13 Mongoose Models và 15 Collections](#72-kiểm-toán-chi-tiết-13-mongoose-models-và-15-collections)
  - [7.3. Đánh giá tính toàn vẹn dữ liệu và kiểm soát tương tranh](#73-đánh-giá-tính-toàn-vẹn-dữ-liệu-và-kiểm-soát-tương-tranh)
- [PHẦN VIII — BUSINESS FLOW AUDIT](#phần-viii--business-flow-audit)
  - [8.1. Đánh giá 19 quy trình nghiệp vụ TMĐT cốt lõi](#81-đánh-giá-19-quy-trình-nghiệp-vụ-tmđt-cốt-lõi)
  - [8.2. Ma trận các điểm đứt gãy nghiệp vụ giữa Frontend và Backend](#82-ma-trận-các-điểm-đứt-gãy-nghiệp-vụ-giữa-frontend-và-backend)
- [PHẦN IX — BUGS, SECURITY & TECHNICAL DEBT](#phần-ix--bugs-security--technical-debt)
  - [9.1. Ma trận phân loại lỗi P0 - P3](#91-ma-trận-phân-loại-lỗi-p0---p3)
  - [9.2. Phân tích chi tiết từng lỗi, nguyên nhân gốc và giải pháp](#92-phân-tích-chi-tiết-từng-lỗi-nguyên-nhân-gốc-và-giải-pháp)
- [PHẦN X — TEST & BUILD RESULTS](#phần-x--test--build-results)
  - [10.1. Tổng hợp kết quả thực thi 416 bài kiểm tra tự động](#101-tổng-hợp-kết-quả-thực-thi-416-bài-kiểm-tra-tự-động)
  - [10.2. Chi tiết kết quả từng lệnh kiểm thử và kiểm tra cú pháp](#102-chi-tiết-kết-quả-từng-lệnh-kiểm-thử-và-kiểm-tra-cú-pháp)
  - [10.3. Giải trình trường hợp BLOCKED của Playwright UI Test](#103-giải-trình-trường-hợp-blocked-của-playwright-ui-test)
- [PHẦN XI — PROJECT COMPLETION ROADMAP](#phần-xi--project-completion-roadmap)
  - [11.1. Lộ trình 5 giai đoạn hoàn thiện sản phẩm](#111-lộ-trình-5-giai-đoạn-hoàn-thiện-sản-phẩm)
  - [11.2. Tiêu chí nghiệm thu chi tiết cho từng giai đoạn](#112-tiêu-chí-nghiệm-thu-chi-tiết-cho-từng-giai-đoạn)
- [PHẦN XII — AI HANDOVER GUIDE FOR DEEPSEEK](#phần-xii--ai-handover-guide-for-deepseek)
  - [12.1. Cẩm nang bàn giao 12 mục chỉ dẫn trực tiếp](#121-cẩm-nang-bàn-giao-12-mục-chỉ-dẫn-trực-tiếp)
  - [12.2. Quy tắc bắt buộc khi AI tiếp quản dự án](#122-quy-tắc-bắt-buộc-khi-ai-tiếp-quản-dự-án)

---

# PHẦN I — PROJECT OVERVIEW

### 1.1. Giới thiệu dự án & Mục tiêu kinh doanh
Dự án **Ung_dung_thuong_mai** là một nền tảng **Sàn thương mại điện tử đa gian hàng (Multi-vendor Marketplace)** chuyên kinh doanh các thiết bị điện tử, phần cứng máy tính và phụ kiện công nghệ (Laptop, Điện thoại, Card VGA, Bo mạch chủ, CPU, RAM, Chuột, v.v.).

Hệ thống được thiết kế phục vụ 4 nhóm người dùng phân quyền rạch ròi:
1. **Khách hàng (Customer):** Duyệt danh mục phân cấp, tìm kiếm gợi ý thời gian thực, lọc sản phẩm, quản lý giỏ hàng đa gian hàng, nhận voucher sàn/shop, đặt hàng tự động tách đơn theo gian hàng, thanh toán (COD hoặc online giả lập), theo dõi vận đơn 7 trạng thái, tích điểm thưởng khi nhận hàng, đánh giá sản phẩm, yêu cầu đổi trả trong 7 ngày và gửi khiếu nại tới CSKH.
2. **Người bán (Seller):**
   - *Chủ gian hàng (Owner):* Đăng ký mở shop (chờ Admin duyệt), cập nhật thông tin cửa hàng, duyệt nhân viên gian hàng, quản lý sản phẩm (biến thể SKU, giá, tồn kho), xác nhận đơn hàng, giao hàng, duyệt đổi trả, tạo voucher riêng của shop, phản hồi đánh giá và xem báo cáo doanh thu thực nhận.
   - *Nhân viên gian hàng (Staff):* Đăng ký tham gia gian hàng đang hoạt động (chờ Chủ shop duyệt); được thao tác sản phẩm, kho, đơn hàng, đổi trả; không được sửa thông tin shop, không quản lý nhân sự và không xem doanh thu.
3. **Nhân viên CSKH (Staff):** Đăng nhập tại `staff.html` (SPA); hàng đợi khiếu nại tập trung (Pool) có cơ chế khóa tương tranh độc quyền; phản hồi khách hàng; hoàn tất khiếu nại hoặc chuyển tiếp Admin; tra cứu thông tin khách hàng và 20 đơn gần nhất; tra cứu đơn hàng toàn sàn; kiểm duyệt và xóa mềm đánh giá vi phạm.
4. **Quản trị viên sàn (Admin):** Xem thống kê GMV toàn sàn; phê duyệt/từ chối/khóa gian hàng; tạo tài khoản và quản lý nhân viên CSKH; quản lý danh mục cha-con và thương hiệu; phát hành voucher toàn sàn (miễn phí hoặc đổi điểm); giám sát đơn hàng toàn sàn; tiếp nhận khiếu nại chuyển từ CSKH và đưa ra phán quyết cuối cùng kèm quyền cưỡng chế hoàn tiền (`forceRefund`).

---

### 1.2. Công nghệ và ngăn xếp kỹ thuật thực tế
> [!IMPORTANT]
> **ĐẶC TÍNH KỸ THUẬT QUAN TRỌNG:** Dự án không sử dụng bất kỳ framework giao diện phức tạp nào như React, Next.js, Vue hay bundler Vite/Webpack. Kiến trúc được tối giản hóa tối đa theo chuẩn **Clean Modular Architecture** để đạt tốc độ tải tức thì và dễ bảo trì.

- **Backend Stack:**
  - Runtime: Node.js native ES Modules (`"type": "module"`).
  - Framework: Express `^4.22.3`.
  - Cơ sở dữ liệu: MongoDB với Mongoose ODM `^8.24.8`.
  - Schema Validation: Zod `^4.6.7` kiểm soát chặt chẽ 100% request body và query string.
  - Xác thực: JSON Web Token (`jsonwebtoken ^9.0.3`) không trạng thái + `bcryptjs ^3.0.3` (10 rounds salt).
  - Tải tệp: `multer ^2.5.0` lưu trữ tệp tin vào `server/uploads/` cục bộ.
  - Test Runner: `mongodb-memory-server ^11.3.0` (In-memory ephemeral DB) và `playwright ^1.65.1`.
- **Frontend Stack:**
  - Ngôn ngữ: Vanilla HTML5 Semantics, CSS3 phân tầng (Custom Properties, BEM naming), JavaScript ES Modules native.
  - Giao tiếp máy chủ: Tự viết lớp HTTP client `request()` bọc `fetch()` tại `frontend/js/api.js`.
  - DOM Utilities: Helper siêu nhẹ `$()` và `h()` tại `frontend/js/utils.js`.

---

### 1.3. Cấu trúc tổng thể các phân hệ

```text
C:\Project\Ung_dung_thuong_mai\
├── frontend/               # Giao diện người dùng thuần (HTML/CSS/JS)
│   ├── css/                # 11 tệp CSS phân tầng cho từng trang
│   ├── js/                 # 31 tệp JavaScript (Controllers, Services, Shared UI)
│   └── *.html              # 9 trang HTML hoàn chỉnh
├── server/                 # Máy chủ Express & MongoDB
│   ├── src/                # Mã nguồn backend (config, db, seed, app, server)
│   │   ├── middleware/     # 3 middleware: auth, error, upload
│   │   ├── models/         # 8 tệp models định nghĩa 13 Mongoose models (15 collections)
│   │   ├── routes/         # 6 router modules: auth, public, customer, seller, staff, admin
│   │   ├── services/       # 4 dịch vụ cốt lõi: orderService, voucherService, ratingService, statsService
│   │   └── utils/          # AppError, helpers Zod parser, paged, genCode
│   ├── test/               # 7 tệp kiểm thử tự động tích hợp
│   └── uploads/            # Thư mục lưu trữ ảnh sản phẩm upload
└── docs/                   # Tài liệu nghiệp vụ & thư mục báo cáo kiểm toán audit/
```

---

### 1.4. Đánh giá mức độ hoàn thiện tổng thể
- **Backend APIs:** Đã hoàn thành **58 / 58 endpoints (100%)**. 416 bài test tích hợp chạy đạt 100%.
- **Cơ sở dữ liệu:** Đã hoàn thành **15 / 15 collections (100%)**. Cấu trúc chuẩn hóa, có cơ chế trừ kho nguyên tử và khóa tương tranh khiếu nại.
- **Frontend Khách hàng:** Đã hoàn thành **29 / 31 tính năng (93.5%)**. 8 trang HTML hoạt động mượt mà với API thật.
- **Frontend CSKH:** Đã hoàn thành **8 / 8 tính năng (100%)**. Bàn làm việc SPA vận hành hoàn hảo.
- **Frontend Người bán (Seller):** **0% giao diện**. 19 API backend đã có nhưng chưa xây dựng trang web `seller.html`.
- **Frontend Quản trị (Admin):** **0% giao diện**. 16 API backend đã có nhưng chưa xây dựng trang web `admin.html`.
- **Hạ tầng thanh toán:** Đang ở mức **Mô phỏng (Mocked / Simulated)**, chưa tích hợp cổng VNPAY thật.
- **Mức độ hoàn thiện toàn hệ thống:** Đạt **76.6%** (121/158 tiêu chí kỹ thuật).

---

### 1.5. Những phát hiện cốt lõi (Key Findings)
1. **Sự mất cân đối giữa Backend và Frontend:** Backend của dự án đã sẵn sàng 100% cho toàn bộ 4 vai trò. Điểm đứt gãy lớn nhất là sự thiếu vắng giao diện web cho Người bán (`seller.html`) và Quản trị viên (`admin.html`).
2. **Lệch cổng kết nối API mặc định:** `frontend/js/config.js` cấu hình cổng `5001`, trong khi `server/src/config.js` chạy cổng `5000`. Khiến người dùng mới chạy lần đầu sẽ bị báo lỗi không kết nối được máy chủ nếu không đồng bộ cổng.
3. **Chống Overselling và Concurrency cực kỳ xuất sắc:** Backend sử dụng toán tử cập nhật nguyên tử `$inc: -quantity` có điều kiện `{ stock: { $gte: quantity } }` và cơ chế rollback tự động khi lỗi giữa chừng, bảo đảm 100% không bao giờ bán quá số lượng tồn kho.
4. **Bàn làm việc CSKH được thiết kế rất chuẩn mực:** Sử dụng `findOneAndUpdate` có điều kiện `assignedTo` tạo thành khóa Mutex chống tranh chấp khi 2 nhân viên cùng tiếp nhận một khiếu nại.

---

# PHẦN II — COMPLETE PROJECT FILE TREE

### 2.1. Quy tắc kiểm kê và giải trình các thư mục bị loại trừ
Theo nguyên tắc kiểm kê kỹ thuật, toàn bộ 100% tệp tin dự án đều được liệt kê đầy đủ dưới đây mà không sử dụng dấu ba chấm `...` rút gọn. Các thư mục sinh tự động sau đây được loại trừ khỏi danh sách hiển thị chi tiết:
1. `server/node_modules/`: Thư mục chứa các gói thư viện npm bên thứ ba (>100MB), có thể tái lập hoàn toàn bằng lệnh `npm ci`.
2. `.git/`: Thư mục lưu trữ lịch sử commit và metadata của Git.
3. `server/uploads/`: Thư mục lưu trữ hình ảnh tải lên khi chạy runtime.

---

### 2.2. Sơ đồ cây thư mục và 103 tệp tin chi tiết không rút gọn

```text
C:\Project\Ung_dung_thuong_mai\
├── .gitignore
├── Collection.docx
├── README.md
├── requiment.md
│
├── docs\
│   ├── CSKH-TEST-REPORT.md
│   ├── CSKH.md
│   ├── NGHIEP-VU.md
│   ├── PROJECT_MASTER_AUDIT_AND_HANDOVER.md
│   ├── TAI-KHOAN-API.md
│   │
│   └── audit\
│       ├── API_DATABASE_AUDIT.md
│       ├── BUSINESS_FLOW_AUDIT.md
│       ├── EXISTING_IMPLEMENTATION_INDEX.md
│       ├── FEATURE_INVENTORY.md
│       ├── FILE_CATALOG.md
│       ├── FINAL_AUDIT_SUMMARY.md
│       ├── HANDOVER_GUIDE_FOR_AI.md
│       ├── MODULE_DEPENDENCY_MAP.md
│       ├── PROJECT_COMPLETION_ROADMAP.md
│       ├── PROJECT_FILE_TREE.md
│       ├── PROJECT_OVERVIEW.md
│       ├── TECHNICAL_DEBT_AND_BUGS.md
│       └── TEST_AND_BUILD_REPORT.md
│
├── frontend\
│   ├── account.html
│   ├── auth.html
│   ├── cart.html
│   ├── checkout.html
│   ├── index.html
│   ├── orders.html
│   ├── product.html
│   ├── products.html
│   ├── staff.html
│   │
│   ├── css\
│   │   ├── account.css
│   │   ├── auth.css
│   │   ├── base.css
│   │   ├── cart.css
│   │   ├── checkout.css
│   │   ├── home.css
│   │   ├── orders.css
│   │   ├── product.css
│   │   ├── products.css
│   │   ├── shopping.css
│   │   └── staff.css
│   │
│   └── js\
│       ├── account.js
│       ├── address-service.js
│       ├── aftersales-service.js
│       ├── api.js
│       ├── auth-service.js
│       ├── auth.js
│       ├── cart-service.js
│       ├── cart.js
│       ├── checkout.js
│       ├── complaint-service.js
│       ├── config.js
│       ├── home.js
│       ├── order-service.js
│       ├── orders.js
│       ├── points-service.js
│       ├── product-card.js
│       ├── product-service.js
│       ├── product.js
│       ├── products.js
│       ├── profile-service.js
│       ├── review-service.js
│       ├── review-ui.js
│       ├── session.js
│       ├── shopping.js
│       ├── staff-service.js
│       ├── staff.js
│       ├── status-labels.js
│       ├── ui.js
│       ├── utils.js
│       ├── voucher-service.js
│       └── wishlist-service.js
│
└── server\
    ├── .env
    ├── .env.example
    ├── package-lock.json
    ├── package.json
    │
    ├── src\
    │   ├── app.js
    │   ├── config.js
    │   ├── db.js
    │   ├── seed.js
    │   ├── server.js
    │   │
    │   ├── middleware\
    │   │   ├── auth.js
    │   │   ├── error.js
    │   │   └── upload.js
    │   │
    │   ├── models\
    │   │   ├── Cart.js
    │   │   ├── Catalog.js
    │   │   ├── Order.js
    │   │   ├── Product.js
    │   │   ├── Shop.js
    │   │   ├── Support.js
    │   │   ├── User.js
    │   │   └── Voucher.js
    │   │
    │   ├── routes\
    │   │   ├── admin.js
    │   │   ├── auth.js
    │   │   ├── customer.js
    │   │   ├── public.js
    │   │   ├── seller.js
    │   │   └── staff.js
    │   │
    │   ├── services\
    │   │   ├── orderService.js
    │   │   ├── ratingService.js
    │   │   ├── statsService.js
    │   │   └── voucherService.js
    │   │
    │   └── utils\
    │       ├── AppError.js
    │       └── helpers.js
    │
    └── test\
        ├── cskh-extended.js
        ├── cskh-fixtures.js
        ├── cskh-preview.js
        ├── cskh-ui.js
        ├── cskh.js
        ├── local.js
        └── smoke.js
```

---

# PHẦN III — COMPLETE FILE CATALOG

Bảng kiểm kê toàn bộ 103 tệp tin của dự án, đối soát trực tiếp từ mã nguồn thực tế:

### 3.1. Danh mục Tệp tin gốc và Tài liệu dự án
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `README.md` | Documentation | Hướng dẫn cài đặt, thiết lập cổng, CORS, chạy seed và tài khoản demo | Core Docs | **WORKING** | Không |
| `requiment.md` | Documentation | Đặc tả yêu cầu 4 nhóm người dùng: Seller, CSKH, Admin, Customer | Requirements | **WORKING** | Không |
| `Collection.docx` | Documentation | Tài liệu quy định danh sách 15 collections và nhiệm vụ của từng collection | Database Specs | **WORKING** | Không |
| `.gitignore` | Configuration | Cấu hình bỏ qua theo dõi Git cho `node_modules`, `.env`, `uploads/` | Git Config | **WORKING** | Git VCS |
| `docs/NGHIEP-VU.md` | Documentation | Quy tắc nghiệp vụ TMĐT cốt lõi đã chốt (tách đơn, phí ship, hoàn tiền) | Business Specs | **WORKING** | Không |
| `docs/TAI-KHOAN-API.md` | Documentation | Hợp đồng API chi tiết cho phân hệ khách hàng (Request/Response/Codes) | API Specs | **WORKING** | Không |
| `docs/CSKH.md` | Documentation | Đặc tả kỹ thuật, hướng dẫn vận hành và hợp đồng API phân hệ CSKH | CSKH Specs | **WORKING** | Không |
| `docs/CSKH-TEST-REPORT.md` | Documentation | Báo cáo kiểm thử hồi quy phân hệ CSKH ngày 15/11/2026 (416 tests) | QA Reports | **WORKING** | Không |

### 3.2. Danh mục Giao diện Frontend (HTML Pages & Controllers)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `frontend/index.html` | Pages | Giao diện Trang chủ mua sắm (Banner, voucher toàn sàn, catalog, store picker) | Customer | **WORKING** | `css/base.css`, `css/home.css`, `js/home.js` |
| `frontend/auth.html` | Pages | Giao diện Xác thực (Đăng nhập, Đăng ký KH / Chủ shop / Nhân viên shop, Quên MK) | Auth | **WORKING** | `css/base.css`, `css/auth.css`, `js/auth.js` |
| `frontend/products.html` | Pages | Giao diện Catalog sản phẩm, bộ lọc nâng cao theo đa tiêu chí, phân trang | Catalog | **WORKING** | `css/shopping.css`, `css/products.css`, `js/products.js` |
| `frontend/product.html` | Pages | Giao diện Chi tiết sản phẩm, thư viện ảnh thumbnail, chọn SKU, đánh giá | Product Detail | **WORKING** | `css/shopping.css`, `css/product.css`, `js/product.js` |
| `frontend/cart.html` | Pages | Giao diện Giỏ hàng gom nhóm theo gian hàng, chọn món, xóa món có Undo | Cart | **WORKING** | `css/shopping.css`, `css/cart.css`, `js/cart.js` |
| `frontend/checkout.html` | Pages | Giao diện Đặt hàng, chọn địa chỉ, chọn voucher theo từng shop, thanh toán | Checkout | **WORKING** | `css/shopping.css`, `css/checkout.css`, `js/checkout.js` |
| `frontend/orders.html` | Pages | Giao diện Theo dõi đơn hàng theo 7 trạng thái, hủy đơn, đổi trả, đánh giá | Orders | **WORKING** | `css/shopping.css`, `css/orders.css`, `js/orders.js` |
| `frontend/account.html` | Pages | Giao diện Trung tâm tài khoản (Hồ sơ, địa chỉ, đổi MK, voucher, điểm, khiếu nại) | Account | **WORKING** | `css/shopping.css`, `css/account.css`, `js/account.js` |
| `frontend/staff.html` | Pages | Giao diện Bàn làm việc CSKH (SPA: khiếu nại, tra cứu khách/đơn, xóa review) | CSKH Staff | **WORKING** | `css/shopping.css`, `css/staff.css`, `js/staff.js` |
| `frontend/js/home.js` | Controllers | Xử lý logic trang chủ: nạp voucher, sản phẩm bán chạy, tìm kiếm autocomplete | Customer | **WORKING** | `utils.js`, `product-service.js`, `voucher-service.js`, `cart-service.js` |
| `frontend/js/auth.js` | Controllers | Xử lý logic form đăng nhập, đăng ký KH/Doanh nghiệp, đo mật khẩu, quên MK | Auth | **WORKING** | `utils.js`, `auth-service.js`, `session.js`, `ui.js` |
| `frontend/js/products.js` | Controllers | Xử lý logic lọc catalog, đồng bộ URL search params, render chips, phân trang | Catalog | **WORKING** | `utils.js`, `product-service.js`, `product-card.js`, `shopping.js` |
| `frontend/js/product.js` | Controllers | Xử lý logic trang chi tiết SP, chuyển đổi biến thể, thêm giỏ, mua ngay | Product Detail | **WORKING** | `utils.js`, `product-service.js`, `cart-service.js`, `review-service.js` |
| `frontend/js/cart.js` | Controllers | Xử lý logic giỏ hàng: gom nhóm shop, chọn sản phẩm, sửa số lượng, undo xóa | Cart | **WORKING** | `utils.js`, `cart-service.js`, `shopping.js`, `ui.js` |
| `frontend/js/checkout.js` | Controllers | Xử lý logic checkout tách đơn, modal địa chỉ, chọn voucher shop, thanh toán | Checkout | **WORKING** | `utils.js`, `order-service.js`, `address-service.js`, `voucher-service.js` |
| `frontend/js/orders.js` | Controllers | Xử lý logic quản lý đơn: lọc status, thanh tiến trình, hủy đơn, đổi trả | Orders | **WORKING** | `utils.js`, `order-service.js`, `aftersales-service.js`, `review-ui.js` |
| `frontend/js/account.js` | Controllers | Xử lý logic 9 tab tài khoản: profile, địa chỉ, điểm, voucher, khiếu nại | Account | **WORKING** | `utils.js`, `profile-service.js`, `address-service.js`, `voucher-service.js` |
| `frontend/js/staff.js` | Controllers | Xử lý logic SPA CSKH: hàng đợi khiếu nại, phản hồi, chuyển admin, xóa review | CSKH Staff | **WORKING** | `utils.js`, `staff-service.js`, `shopping.js`, `ui.js` |

### 3.3. Danh mục Lớp Dịch vụ và Tiện ích Frontend (Services & Utils)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `frontend/js/config.js` | Configurations | Khai báo hằng số `API_BASE_URL`, `REQUEST_TIMEOUT_MS`, `STORAGE_KEYS` | Core | **WORKING** | Không |
| `frontend/js/api.js` | Utilities | Wrapper hàm `request()` gọi native `fetch`, timeout, gắn JWT và chuẩn hóa lỗi | Core HTTP | **WORKING** | `config.js`, `session.js` |
| `frontend/js/session.js` | Utilities | Quản lý token và thông tin người dùng trong `localStorage` / `sessionStorage` | Auth Session | **WORKING** | `config.js` |
| `frontend/js/utils.js` | Utilities | Helper DOM selector (`$`, `h`), format tiền VND (`formatMoney`), format ngày | Shared Utils | **WORKING** | Không |
| `frontend/js/ui.js` | Components | Quản lý Toast, Undo Toast, Accessible Modal Dialog khóa focus | UI Framework | **WORKING** | `utils.js` |
| `frontend/js/status-labels.js` | Utilities | Từ điển nhãn trạng thái tiếng Việt (đơn hàng, khiếu nại, hậu mãi, voucher) | International | **WORKING** | Không |
| `frontend/js/shopping.js` | Components | Shared Header/Footer (`mountShoppingChrome`), menu người dùng, giỏ hàng badge | Layout Chrome | **WORKING** | `utils.js`, `auth-service.js`, `cart-service.js`, `ui.js` |
| `frontend/js/product-card.js` | Components | Render thẻ sản phẩm chuẩn SEO, nhãn tồn kho, định dạng giá và nút mua nhanh | UI Component | **WORKING** | `utils.js`, `cart-service.js`, `ui.js` |
| `frontend/js/review-ui.js` | Components | Modal nhập và gửi đánh giá sản phẩm (chọn số sao 1-5 và nhận xét) | UI Component | **WORKING** | `utils.js`, `review-service.js`, `ui.js` |
| `frontend/js/auth-service.js` | Services | API client cho đăng ký, đăng nhập, quên MK, reset MK, lấy profile | Auth Client | **WORKING** | `api.js`, `session.js` |
| `frontend/js/product-service.js` | Services | API client cho lấy danh mục, thương hiệu, danh sách và chi tiết sản phẩm | Catalog Client | **WORKING** | `api.js` |
| `frontend/js/cart-service.js` | Services | API client cho đọc giỏ hàng, thêm sản phẩm, đếm số lượng giỏ hàng | Cart Client | **WORKING** | `api.js` |
| `frontend/js/order-service.js` | Services | API client cho checkout, thanh toán giả lập, tra cứu đơn, hủy đơn, nhận hàng | Order Client | **WORKING** | `api.js` |
| `frontend/js/address-service.js` | Services | API client cho thêm, sửa, xóa, lấy danh sách sổ địa chỉ khách hàng | Address Client | **WORKING** | `api.js` |
| `frontend/js/voucher-service.js` | Services | API client cho tra cứu voucher sàn, voucher khả dụng, nhận/đổi voucher | Voucher Client | **WORKING** | `api.js` |
| `frontend/js/points-service.js` | Services | API client cho lấy số dư điểm thưởng và lịch sử biến động điểm | Points Client | **WORKING** | `api.js` |
| `frontend/js/profile-service.js` | Services | API client cho lấy/cập nhật hồ sơ cá nhân và đổi mật khẩu | Profile Client | **WORKING** | `api.js` |
| `frontend/js/review-service.js` | Services | API client cho đọc đánh giá sản phẩm, gửi đánh giá mới, xem review của tôi | Review Client | **WORKING** | `api.js` |
| `frontend/js/aftersales-service.js`| Services | API client cho gửi yêu cầu đổi trả/hoàn tiền/hủy đơn và tra cứu yêu cầu | Support Client | **WORKING** | `api.js` |
| `frontend/js/complaint-service.js` | Services | API client cho gửi đơn khiếu nại tới CSKH và xem chi tiết khiếu nại | Support Client | **WORKING** | `api.js` |
| `frontend/js/staff-service.js` | Services | API client cho nhân viên CSKH: khiếu nại, tra cứu khách/đơn, xóa review | Staff Client | **WORKING** | `api.js` |
| `frontend/js/wishlist-service.js` | Services | API client cho lấy danh sách, thêm và xóa sản phẩm yêu thích | Wishlist Client| **WORKING** | `api.js` |

### 3.4. Danh mục Tệp tin Phong cách (CSS Stylesheets)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `frontend/css/base.css` | Assets/CSS | CSS Reset, biến màu hệ thống (Design Tokens), Typography, nút bấm cơ sở | Design System | **WORKING** | Font Google Fonts |
| `frontend/css/home.css` | Assets/CSS | Styles layout trang chủ, header navigation, banner hero, card sản phẩm | Home Layout | **WORKING** | `base.css` |
| `frontend/css/auth.css` | Assets/CSS | Styles màn hình đăng nhập, phân tầng vai trò, thanh đo độ mạnh mật khẩu | Auth Layout | **WORKING** | `base.css` |
| `frontend/css/shopping.css` | Assets/CSS | Styles thanh header/footer dùng chung (`#shopping-chrome`), breadcrumbs | Shopping Shell | **WORKING** | `base.css` |
| `frontend/css/products.css` | Assets/CSS | Styles trang catalog sản phẩm, sidebar bộ lọc, filter chips, pagination | Catalog Layout | **WORKING** | `shopping.css` |
| `frontend/css/product.css` | Assets/CSS | Styles trang chi tiết sản phẩm, gallery thumbnail, chips chọn biến thể | Product Layout | **WORKING** | `shopping.css` |
| `frontend/css/cart.css` | Assets/CSS | Styles bảng giỏ hàng gom nhóm theo gian hàng, checkbox, nút số lượng | Cart Layout | **WORKING** | `shopping.css` |
| `frontend/css/checkout.css` | Assets/CSS | Styles quy trình checkout, chọn địa chỉ nhận hàng, chọn voucher shop | Checkout Layout | **WORKING** | `shopping.css` |
| `frontend/css/orders.css` | Assets/CSS | Styles danh sách đơn hàng, thanh tiến trình trạng thái, modal lý do hủy | Orders Layout | **WORKING** | `shopping.css` |
| `frontend/css/account.css` | Assets/CSS | Styles trung tâm tài khoản tabbed layout, form hồ sơ, danh sách khiếu nại | Account Layout | **WORKING** | `shopping.css` |
| `frontend/css/staff.css` | Assets/CSS | Styles bàn làm việc chuyên dụng CSKH, badge trạng thái, danh sách khiếu nại | Staff Layout | **WORKING** | `base.css` |

### 3.5. Danh mục Máy chủ Backend, Cấu hình và Middleware
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `server/package.json` | Configurations | Định nghĩa dependencies, phiên bản, script chạy dev, seed, test suites | Package Config | **WORKING** | npm / Node.js |
| `server/package-lock.json`| Configurations | Khóa phiên bản chi tiết các gói thư viện cài đặt | Lockfile | **WORKING** | npm |
| `server/.env.example` | Configurations | Mẫu biến môi trường (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`) | Env Template | **WORKING** | Không |
| `server/.env` | Configurations | Cấu hình môi trường runtime cục bộ của máy chủ backend | Environment | **WORKING** | dotenv |
| `server/src/server.js` | Entry point | Entry point chính của backend: khởi động HTTP server và Cron Job tự hoàn tất | Server Entry | **WORKING** | `app.js`, `db.js`, `orderService.js` |
| `server/src/app.js` | Configurations | Khởi tạo Express, cấu hình CORS, JSON parser, static upload, định tuyến API | Express Core | **WORKING** | Express, 6 route files, middleware |
| `server/src/config.js` | Configurations | Đọc biến môi trường, định nghĩa tham số phí ship, ngày đổi trả, điểm thưởng | Config Core | **WORKING** | dotenv |
| `server/src/db.js` | Configurations | Thiết lập kết nối Mongoose tới MongoDB với `strictQuery: true` | Database Core | **WORKING** | Mongoose, `config.js` |
| `server/src/seed.js` | Scripts | Script tạo tài khoản Admin, nạp danh mục, brand và demo data (`--demo`) | Database Seed | **WORKING** | Mongoose, Models, bcryptjs |
| `server/src/middleware/auth.js` | Middleware | Xác thực JWT, nạp lại user từ DB, phân quyền role, kiểm tra trạng thái shop | Security MW | **WORKING** | jsonwebtoken, `User.js`, `Shop.js` |
| `server/src/middleware/error.js`| Middleware | Bắt lỗi tập trung: CastError, DuplicateKey (11000), Zod ValidationError | Error MW | **WORKING** | `AppError.js` |
| `server/src/middleware/upload.js`| Middleware | Cấu hình Multer lưu ảnh vào `server/uploads/`, giới hạn dung lượng tối đa 3MB | Media MW | **WORKING** | Multer, `AppError.js` |
| `server/src/utils/AppError.js` | Utilities | Lớp lỗi tùy biến kế thừa `Error` bổ sung trường HTTP `status` và `details` | Error Utility | **WORKING** | Không |
| `server/src/utils/helpers.js` | Utilities | Parser Zod (`parse`), wrapper async (`asyncHandler`), phân trang, genCode | Core Helpers | **WORKING** | Zod, `AppError.js` |

### 3.6. Danh mục Mô hình Dữ liệu Mongoose Models
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Model / Collections | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `server/src/models/User.js` | Models/Entities | Schema tài khoản, mã hóa mật khẩu, vai trò, điểm thưởng, sổ địa chỉ nhúng | `User` -> `users` | **WORKING** | Mongoose, `Shop.js` |
| `server/src/models/Shop.js` | Models/Entities | Schema gian hàng, chuẩn hóa `nameKey` chống trùng, quan hệ 1-1 với owner | `Shop` -> `shops` | **WORKING** | Mongoose, `User.js` |
| `server/src/models/Catalog.js` | Models/Entities | Schemas Danh mục (cây cha - con) và Thương hiệu sản phẩm | `Category`, `Brand` | **WORKING** | Mongoose |
| `server/src/models/Product.js` | Models/Entities | Schemas Sản phẩm và Biến thể SKU (lưu giá và tồn kho riêng cho từng SKU) | `Product`, `Variant` | **WORKING** | Mongoose, `Shop.js`, `Catalog.js` |
| `server/src/models/Cart.js` | Models/Entities | Schemas Giỏ hàng người dùng và Danh sách sản phẩm yêu thích (Wishlist) | `Cart`, `Wishlist` | **WORKING** | Mongoose, `Product.js`, `User.js` |
| `server/src/models/Voucher.js` | Models/Entities | Schemas Voucher gốc, UserVoucher (bản sở hữu) và PointTx (lịch sử điểm) | `Voucher`, `UserVoucher`, `PointTx` | **WORKING** | Mongoose, `Shop.js`, `Order.js` |
| `server/src/models/Order.js` | Models/Entities | Schema Đơn hàng, groupCode, snapshot địa chỉ, voucher, thanh toán | `Order` -> `orders` | **WORKING** | Mongoose, `Shop.js`, `User.js` |
| `server/src/models/Support.js` | Models/Entities | Schemas Đánh giá SP (`Review`), Yêu cầu hậu mãi (`AfterSales`), Khiếu nại (`Complaint`) | `Review`, `AfterSales`, `Complaint` | **WORKING** | Mongoose, `Order.js`, `User.js` |

### 3.7. Danh mục Định tuyến Máy chủ (API Routes)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Endpoint Prefix | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `server/src/routes/auth.js` | Routes | 9 API: Đăng ký, đăng nhập, đổi mật khẩu, quên mật khẩu, lấy phiên | `/api/auth` | **WORKING** | `User.js`, `Shop.js`, `auth.js` MW |
| `server/src/routes/public.js` | Routes | 7 API: Xem danh mục, thương hiệu, danh sách sản phẩm, chi tiết SP, shop | `/api` | **WORKING** | `Catalog.js`, `Product.js`, `Shop.js` |
| `server/src/routes/customer.js`| Routes | 24 API: Profile, địa chỉ, giỏ hàng, wishlist, voucher, đặt hàng, đánh giá | `/api/customer` | **WORKING** | `orderService.js`, `voucherService.js` |
| `server/src/routes/seller.js` | Routes | 19 API: Quản lý shop, duyệt staff, CRUD sản phẩm, kho, đơn hàng, stats | `/api/seller` | **IMPLEMENTED** (Thiếu UI) | `orderService.js`, `statsService.js` |
| `server/src/routes/staff.js` | Routes | 11 API: Tra cứu khách/đơn, xử lý khiếu nại CSKH, xóa mềm review | `/api/staff` | **WORKING** | `Support.js`, `Order.js`, `User.js` |
| `server/src/routes/admin.js` | Routes | 16 API: Thống kê GMV, duyệt shop, quản lý CSKH, voucher sàn, khiếu nại | `/api/admin` | **IMPLEMENTED** (Thiếu UI) | `statsService.js`, `orderService.js` |

### 3.8. Danh mục Dịch vụ Nghiệp vụ Backend (Business Services)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `server/src/services/orderService.js` | Services | Tách đơn đa shop, trừ kho nguyên tử, thanh toán, hủy đơn, hoàn tất, auto-complete | Order Core | **WORKING** | `Order.js`, `Product.js`, `Voucher.js` |
| `server/src/services/voucherService.js`| Services | Quản lý nhận voucher miễn phí, đổi voucher bằng điểm tích lũy của khách | Voucher Core | **WORKING** | `Voucher.js`, `User.js`, `Shop.js` |
| `server/src/services/ratingService.js` | Services | Tính toán lại điểm số đánh giá trung bình cho Sản phẩm và Gian hàng | Rating Core | **WORKING** | `Support.js`, `Product.js`, `Shop.js` |
| `server/src/services/statsService.js` | Services | Tổng hợp doanh thu, nhóm theo ngày/tháng, lọc dải ngày, top sản phẩm bán chạy | Stats Core | **WORKING** | Không (Pure JS logic) |

### 3.9. Danh mục Kịch bản và Bộ kiểm thử (Test Suites)
| Đường dẫn tương đối | Loại file | Vai trò thực tế | Module | Trạng thái | Phụ thuộc chính |
|---|---|---|---|:---:|---|
| `server/test/local.js` | Tests | Runner khởi động MongoMemoryServer và gọi chạy bộ smoke test | Test Runner | **WORKING** | `mongodb-memory-server`, `smoke.js` |
| `server/test/smoke.js` | Tests | Bộ 127 bài test tích hợp E2E toàn bộ luồng nghiệp vụ mua bán của hệ thống | E2E Integration | **WORKING** | `app.js`, `db.js`, Models |
| `server/test/cskh.js` | Tests | Bộ 101 bài test nghiệp vụ CSKH và bảo vệ 27 tình huống tranh chấp đồng thời | Concurrency Test| **WORKING** | `app.js`, `db.js`, `Support.js` |
| `server/test/cskh-extended.js` | Tests | Bộ 188 bài test phân quyền, query injection, prototype pollution, boundary | Security Test | **WORKING** | `app.js`, `db.js`, `Support.js` |
| `server/test/cskh-fixtures.js` | Tests | Dữ liệu mẫu giả lập phục vụ cho các bộ test CSKH | Test Fixtures | **WORKING** | Models, bcryptjs |
| `server/test/cskh-preview.js` | Scripts | Script khởi chạy máy chủ preview cho phân hệ CSKH với DB tạm | Preview Runner | **WORKING** | `mongodb-memory-server`, `app.js` |
| `server/test/cskh-ui.js` | Tests | Bộ 16 kịch bản Browser E2E UI bằng Playwright Chromium headless | UI Automation | **BLOCKED** (Thiếu Playwright binary) | Playwright, `app.js` |

---

# PHẦN IV — ARCHITECTURE & MODULE DEPENDENCIES

### 4.1. Sơ đồ luồng phụ thuộc đa tầng (Mermaid Flowchart)

```mermaid
flowchart TD
    subgraph UI_Pages["1. GIAO DIỆN NGƯỜI DÙNG (FRONTEND PAGES)"]
        P_Home["index.html + home.js"]
        P_Auth["auth.html + auth.js"]
        P_Catalog["products.html + products.js"]
        P_Product["product.html + product.js"]
        P_Cart["cart.html + cart.js"]
        P_Checkout["checkout.html + checkout.js"]
        P_Orders["orders.html + orders.js"]
        P_Account["account.html + account.js"]
        P_Staff["staff.html + staff.js"]
        P_SellerStub["[CHƯA CÓ UI] seller.html"]
        P_AdminStub["[CHƯA CÓ UI] admin.html"]
    end

    subgraph UI_Services["2. DỊCH VỤ CLIENT (FRONTEND SERVICES)"]
        S_Auth["auth-service.js"]
        S_Prod["product-service.js"]
        S_Cart["cart-service.js"]
        S_Order["order-service.js"]
        S_Addr["address-service.js"]
        S_Vouch["voucher-service.js"]
        S_Points["points-service.js"]
        S_Review["review-service.js"]
        S_After["aftersales-service.js"]
        S_Comp["complaint-service.js"]
        S_Staff["staff-service.js"]
        S_Wish["wishlist-service.js"]
        HTTP_Client["api.js (fetch wrapper + JWT)"]
    end

    subgraph Backend_Gateway["3. CỔNG MÁY CHỦ & MIDDLEWARE"]
        App_Core["app.js (Express Application)"]
        MW_CORS["CORS (5500, CLIENT_ORIGIN)"]
        MW_Auth["auth.js (JWT verify + DB load)"]
        MW_Role["requireRole() & requireActiveShop"]
        MW_Upload["upload.js (Multer)"]
        MW_Error["error.js (Zod & Mongo format)"]
    end

    subgraph Backend_Routes["4. ĐỊNH TUYẾN MÁY CHỦ (EXPRESS ROUTES)"]
        R_Auth["routes/auth.js (9 APIs)"]
        R_Public["routes/public.js (7 APIs)"]
        R_Cust["routes/customer.js (24 APIs)"]
        R_Staff["routes/staff.js (11 APIs)"]
        R_Seller["routes/seller.js (19 APIs)"]
        R_Admin["routes/admin.js (16 APIs)"]
    end

    subgraph Backend_Services["5. DỊCH VỤ NGHIỆP VỤ (SERVICES LAYER)"]
        Svc_Order["orderService.js\n(Checkout, atomic stock, cancel, complete)"]
        Svc_Voucher["voucherService.js\n(Claim & points redeem)"]
        Svc_Rating["ratingService.js\n(Recalculate avg ratings)"]
        Svc_Stats["statsService.js\n(GMV, series, top products)"]
    end

    subgraph Database_Models["6. MÔ HÌNH DỮ LIỆU (MONGOOSE MODELS)"]
        M_User["User.js (users)"]
        M_Shop["Shop.js (shops)"]
        M_Catalog["Catalog.js (categories, brands)"]
        M_Product["Product.js (products, variants)"]
        M_Cart["Cart.js (carts, wishlists)"]
        M_Order["Order.js (orders)"]
        M_Voucher["Voucher.js (vouchers, uservouchers, pointtxes)"]
        M_Support["Support.js (reviews, aftersales, complaints)"]
    end

    %% Client Layer Calls
    P_Home --> S_Prod & S_Vouch & S_Cart & S_Auth
    P_Auth --> S_Auth
    P_Catalog --> S_Prod & S_Cart
    P_Product --> S_Prod & S_Cart & S_Review & S_Vouch & S_Wish
    P_Cart --> S_Cart & S_Order
    P_Checkout --> S_Order & S_Addr & S_Vouch
    P_Orders --> S_Order & S_After & S_Review
    P_Account --> S_Auth & S_Addr & S_Vouch & S_Points & S_Comp & S_Wish & S_Review
    P_Staff --> S_Staff

    %% Services call HTTP Client
    S_Auth & S_Prod & S_Cart & S_Order & S_Addr & S_Vouch & S_Points & S_Review & S_After & S_Comp & S_Staff & S_Wish --> HTTP_Client

    %% HTTP Client calls Gateway
    HTTP_Client -->|RESTful JSON| App_Core

    %% Gateway to Middleware Pipeline
    App_Core --> MW_CORS --> MW_Auth --> MW_Role

    %% Gateway to Routes
    MW_Role --> R_Auth
    MW_Role --> R_Public
    MW_Role --> R_Cust
    MW_Role --> R_Staff
    MW_Role --> R_Seller
    MW_Role --> R_Admin

    %% Missing UI Links (Orphan routes)
    P_SellerStub -.->|Chưa kết nối| R_Seller
    P_AdminStub -.->|Chưa kết nối| R_Admin

    %% Routes call Services
    R_Cust --> Svc_Order & Svc_Voucher & Svc_Rating
    R_Staff --> Svc_Rating
    R_Seller --> Svc_Order & Svc_Stats & Svc_Rating
    R_Admin --> Svc_Stats & Svc_Order

    %% Services and Routes touch Models
    Svc_Order --> M_Order & M_Product & M_Voucher & M_Cart & M_User & M_Shop
    Svc_Voucher --> M_Voucher & M_User & M_Shop
    Svc_Rating --> M_Support & M_Product & M_Shop
    R_Auth --> M_User & M_Shop
    R_Public --> M_Product & M_Catalog & M_Shop & M_Support & M_Voucher
    R_Cust --> M_Cart & M_Order & M_Support & M_User
    R_Staff --> M_Support & M_Order & M_User & M_Product
    R_Seller --> M_Shop & M_Product & M_Order & M_Support & M_Voucher & M_User
    R_Admin --> M_User & M_Shop & M_Catalog & M_Voucher & M_Order & M_Support
```

---

### 4.2. Sơ đồ Thực thể - Quan hệ CSDL (Mermaid ER Diagram)

```mermaid
erDiagram
    users ||--o| shops : "chủ sở hữu (owner 1-1)"
    users ||--o{ shops : "nhân viên (shop ref n-1)"
    users ||--o| carts : "sở hữu (1-1)"
    users ||--o| wishlists : "sở hữu (1-1)"
    users ||--o{ orders : "khách hàng đặt (customer)"
    users ||--o{ uservouchers : "sở hữu voucher"
    users ||--o{ pointtxes : "lịch sử điểm"
    users ||--o{ reviews : "đánh giá sản phẩm"
    users ||--o{ complaints : "khiếu nại"
    users ||--o{ complaints : "CSKH phụ trách (assignedTo)"

    shops ||--o{ products : "bán sản phẩm"
    shops ||--o{ orders : "nhận đơn hàng"
    shops ||--o{ vouchers : "phát hành voucher shop"
    shops ||--o{ aftersales : "xử lý hậu mãi"
    shops ||--o{ reviews : "nhận đánh giá & phản hồi"

    categories ||--o{ categories : "danh mục cha-con (parent)"
    categories ||--o{ products : "phân loại"
    brands ||--o{ products : "sản xuất"

    products ||--|{ variants : "gồm các SKU (1-n)"
    products ||--o{ reviews : "nhận đánh giá"
    products ||--o{ wishlists : "được thêm vào"

    orders ||--o{ aftersales : "phát sinh yêu cầu"
    orders ||--o{ complaints : "bị khiếu nại"
    orders ||--o{ reviews : "được đánh giá khi hoàn tất"
    orders }o--o| uservouchers : "áp dụng voucher"

    vouchers ||--o{ uservouchers : "phát hành bản dùng"
    vouchers ||--o{ pointtxes : "đổi từ điểm"
```

---

### 4.3. Phân tích các Module bị cô lập / Mất kết nối
1. **Phân hệ Người bán (`server/src/routes/seller.js`):** Gồm 19 API endpoints hoàn chỉnh nhưng hoàn toàn chưa có tệp HTML/JS nào trên Frontend gọi tới. Nút bấm trên giao diện đang kích hoạt toast `comingSoon`.
2. **Phân hệ Quản trị viên (`server/src/routes/admin.js`):** Gồm 16 API endpoints hoàn chỉnh nhưng chưa có màn hình `admin.html`. Khiến các tác vụ duyệt shop và xử lý khiếu nại bị nghẽn trên web.

---

### 4.4. Bản đồ phụ thuộc thư viện bên ngoài (Dependencies Map)
- `express (^4.22.3)`: Web Framework, routing và middleware.
- `mongoose (^8.24.8)`: ODM kết nối và thao tác với MongoDB.
- `zod (^4.6.7)`: Kiểm tra tính hợp lệ dữ liệu runtime cho request body/query.
- `jsonwebtoken (^9.0.3)`: Ký và xác thực token JWT không trạng thái.
- `bcryptjs (^3.0.3)`: Băm mật khẩu người dùng với salt 10 vòng.
- `cors (^2.8.6)`: Kiểm soát chia sẻ tài nguyên nguồn gốc chéo.
- `dotenv (^18.0.10)`: Nạp biến môi trường từ tệp `.env`.
- `multer (^2.5.0)`: Xử lý upload tệp tin hình ảnh multipart/form-data.
- `morgan (^1.12.1)`: Logger ghi nhật ký HTTP request trong chế độ dev.
- `mongodb-memory-server (^11.3.0)`: Chạy MongoDB ảo trong RAM để kiểm thử tự động.
- `playwright (^1.65.1)`: Tự động hóa kiểm thử trình duyệt Chromium.
- **Frontend:** Không dùng bất kỳ thư viện bên thứ ba nào (Pure Vanilla JS).

---

# PHẦN V — EXISTING IMPLEMENTATION INDEX

### 5.1. Bảng tra cứu chức năng hiện có để tránh tạo trùng tệp
Bảng tra cứu bắt buộc dành cho DeepSeek và các AI tiếp quản:

| Chức năng cần làm | Tệp hiện có trong dự án | Hàm / Class / Component liên quan | Trạng thái hiện tại | Hướng dẫn xử lý cho AI tiếp quản |
|---|---|---|:---:|---|
| **Cấu hình Cổng & API URL** | `frontend/js/config.js`<br>`server/src/config.js` | `API_BASE_URL`<br>`config.port` | **Lệch cổng (5001 vs 5000)** | **Sửa ngay:** Đổi `API_BASE_URL` trong `config.js` thành `http://localhost:5000/api` (hoặc đặt biến môi trường `PORT=5001`). Không tạo file config mới. |
| **Đăng ký / Đăng nhập** | `server/src/routes/auth.js`<br>`frontend/js/auth.js`<br>`frontend/js/auth-service.js` | `login()`, `registerCustomer()`, `registerSeller()` | **Hoàn chỉnh** | Sử dụng nguyên các route `/api/auth/*` đã có. Không viết lại cơ chế JWT hay băm mật khẩu bcrypt. |
| **Quên & Đặt lại Mật khẩu** | `server/src/routes/auth.js`<br>`frontend/js/auth.js` | `forgotPassword()`, `resetPassword()` | **Hoàn chỉnh (Dev mode)** | Khi triển khai thật, chỉ cần nối dịch vụ gửi email (Nodemailer/Resend) vào `routes/auth.js#L95-L107`, không sửa logic hash token sha256. |
| **Xác thực JWT & Phân quyền** | `server/src/middleware/auth.js` | `auth`, `requireRole`, `requireOwner`, `requireActiveShop` | **Hoàn chỉnh** | Tái sử dụng middleware này cho tất cả route mới. Không tự decode token thủ công trong route. |
| **Bảo vệ Bảo mật Express** | `server/src/app.js` | Express app middleware pipeline | **Thiếu Rate Limit & Helmet** | **Bổ sung:** Cài `express-rate-limit` và `helmet`, nhúng trực tiếp vào `app.js` trước các routes. |
| **Tách đơn đa Shop (Checkout)**| `server/src/services/orderService.js`<br>`frontend/js/checkout.js` | `checkout(user, input)` | **Hoàn chỉnh** | Logic phân nhóm đơn hàng theo `groupCode` và tính phí ship 30.000đ/shop nằm tại `orderService.js#L32-L151`. Giữ nguyên logic trừ kho nguyên tử. |
| **Thanh toán Online (Simulation)**| `server/src/services/orderService.js`<br>`frontend/js/checkout.js` | `payGroup(user, groupCode)`<br>`payOrderGroup()` | **Mô phỏng (Mocked)** | **Nâng cấp:** Thay thế phần sinh mã giao dịch `SIM...` bằng hàm tạo URL thanh toán VNPAY Sandbox thật và endpoint webhook IPN. |
| **Quản lý Giỏ hàng** | `server/src/routes/customer.js`<br>`frontend/js/cart.js`<br>`frontend/js/cart-service.js` | `cartView()`, `addToCart()`, `PATCH /cart/items/:id` | **Hoàn chỉnh** | Mọi thao tác thêm/sửa/xóa/xóa hoàn tác đều nằm tại `cart.js`. Không tạo thêm model hay route giỏ hàng mới. |
| **Sổ địa chỉ & Snapshot đơn**| `server/src/models/User.js`<br>`server/src/models/Order.js`<br>`frontend/js/address-service.js` | `addressSchema`<br>`shippingAddress` snapshot | **Hoàn chỉnh** | Địa chỉ lưu nhúng trong `User.addresses` và được copy snapshot vào `Order.shippingAddress`. Không tạo collection địa chỉ riêng biệt. |
| **Voucher Sàn & Voucher Shop**| `server/src/models/Voucher.js`<br>`server/src/services/voucherService.js`<br>`frontend/js/voucher-service.js` | `listAvailable()`, `claim()`, `redeemWithPoints()` | **Hoàn chỉnh** | Quy tắc sàn chịu vs shop chịu đã được viết chuẩn tại `orderService.js#L131`. Không sửa logic phân định chi phí. |
| **Điểm thưởng & Tích lũy** | `server/src/models/Voucher.js`<br>`server/src/services/orderService.js` | `PointTx`, `completeOrder()`, `refundOrder()` | **Hoàn chỉnh** | Tích điểm (1 điểm / 10.000đ) khi đơn hoàn tất, thu hồi khi hoàn tiền. Giao diện xem lịch sử tại `account.js#L281`. |
| **Sản phẩm & Biến thể SKU** | `server/src/models/Product.js`<br>`server/src/routes/public.js`<br>`frontend/js/product.js` | `Product`, `Variant`, `withVariants()` | **Hoàn chỉnh** | Tồn kho nằm ở `Variant.stock`. Không tạo collection tồn kho rời. Không thêm thông số kỹ thuật nếu không cần thiết. |
| **Tính toán lại Điểm Đánh giá**| `server/src/services/ratingService.js` | `recalcRatings(productId, shopId)` | **Hoàn chỉnh** | Hàm tự động tính trung bình số sao và cập nhật vào cả `Product` lẫn `Shop`. Tái sử dụng sau khi xóa/sửa review. |
| **Báo cáo & Thống kê Doanh thu**| `server/src/services/statsService.js` | `parseRange()`, `summarize()` | **Hoàn chỉnh** | Tổng hợp GMV, doanh thu theo dải ngày, nhóm ngày/tháng, top sản phẩm. Đã dùng cho cả admin và seller routes. |
| **Giao diện Người bán (Seller UI)**| `frontend/js/shopping.js#L85`<br>`server/src/routes/seller.js` | Menu item "Vào Seller Center"<br>19 endpoints `/api/seller/*` | **Chưa có UI (Backend 100%)** | **CẦN TẠO MỚI:** Tạo `frontend/seller.html` và `frontend/js/seller.js`. Gọi trực tiếp 19 API `/api/seller/*` đã có sẵn. **TUYỆT ĐỐI KHÔNG VIẾT LẠI ROUTE SELLER**. |
| **Giao diện Quản trị (Admin UI)**| `frontend/js/shopping.js#L87`<br>`server/src/routes/admin.js` | Menu item "Vào trang quản trị"<br>16 endpoints `/api/admin/*` | **Chưa có UI (Backend 100%)** | **CẦN TẠO MỚI:** Tạo `frontend/admin.html` và `frontend/js/admin.js`. Gọi trực tiếp 16 API `/api/admin/*` đã có sẵn. **TUYỆT ĐỐI KHÔNG VIẾT LẠI ROUTE ADMIN**. |
| **Bàn làm việc CSKH (SPA)** | `frontend/staff.html`<br>`frontend/js/staff.js`<br>`server/src/routes/staff.js` | `updateComplaint()`, `sections.complaints`, `sections.customers` | **Hoàn chỉnh 100%** | Giữ nguyên kiến trúc khóa độc quyền (Mutex concurrency locking). Chỉ cần mở rộng tính năng nếu có yêu cầu mới. |
| **Hủy đơn / Hoàn tiền / Đổi trả**| `server/src/services/orderService.js`<br>`frontend/js/orders.js`<br>`models/Support.js` | `cancelOrder()`, `refundOrder()`, `AfterSales` | **Hoàn chỉnh** | Hủy khi `cho_xac_nhan`, yêu cầu hủy khi `da_xac_nhan`, đổi trả trong 7 ngày sau giao. Hàng trả về không tự động cộng kho. |
| **Tự động Hoàn tất Đơn hàng** | `server/src/server.js#L10`<br>`server/src/services/orderService.js` | `autoCompleteOrders()` | **Hoàn chỉnh** | Tiến trình `setInterval` chạy mỗi giờ, tự hoàn tất đơn đã giao quá 3 ngày nếu không có khiếu nại đang chờ. |
| **Upload Hình ảnh** | `server/src/middleware/upload.js`<br>`routes/seller.js#L34` | `upload.single('image')`, `POST /api/seller/upload` | **Lưu local disk** | **Nâng cấp sau:** Thay `multer.diskStorage` bằng Cloudinary Storage khi chuẩn bị deploy production. |

---

### 5.2. Mẫu mã nguồn kết nối API sẵn có cho Seller Center & Admin Console

#### Mẫu gọi API phân hệ Người bán (`frontend/js/seller.js`):
```javascript
import { request } from "./api.js";

// 1. Lấy thông tin gian hàng
const shop = await request("/seller/shop");

// 2. Lấy danh sách sản phẩm của shop
const products = await request("/seller/products?page=1&limit=20");

// 3. Tạo sản phẩm mới kèm biến thể
const newProd = await request("/seller/products", {
  method: "POST",
  body: {
    name: "Laptop ASUS Gaming",
    category: "673...",
    brand: "673...",
    images: ["/uploads/img1.png"],
    variants: [{ name: "i5 / 16GB / 512GB", price: 21990000, stock: 10, sku: "ASUS-F15" }]
  }
});

// 4. Cập nhật tồn kho biến thể
await request(`/seller/products/${prodId}/variants/${variantId}/stock`, {
  method: "PATCH",
  body: { stock: 50 } // hoặc { delta: 10 }
});

// 5. Cập nhật trạng thái đơn hàng (da_xac_nhan -> dang_giao -> da_giao)
await request(`/seller/orders/${orderId}/status`, {
  method: "PATCH",
  body: { status: "dang_giao" }
});

// 6. Xử lý yêu cầu đổi trả / hoàn tiền
await request(`/seller/after-sales/${afterSalesId}`, {
  method: "PATCH",
  body: { decision: "accept", note: "Đã kiểm tra hàng lỗi và đồng ý hoàn tiền" }
});

// 7. Lấy báo cáo doanh thu gian hàng
const stats = await request("/seller/stats?group=day");
```

#### Mẫu gọi API phân hệ Quản trị viên (`frontend/js/admin.js`):
```javascript
import { request } from "./api.js";

// 1. Thống kê GMV và toàn sàn
const stats = await request("/admin/stats");

// 2. Danh sách gian hàng chờ duyệt
const pendingShops = await request("/admin/shops?status=pending");

// 3. Phê duyệt mở gian hàng
await request(`/admin/shops/${shopId}/approve`, { method: "PATCH" });

// 4. Tạo tài khoản nhân viên CSKH mới
await request("/admin/cskh", {
  method: "POST",
  body: { fullName: "Nguyễn Văn CSKH", email: "cskh2@shop.local", phone: "0901234567", password: "Password@123" }
});

// 5. Tạo voucher toàn sàn (Đổi bằng điểm hoặc nhận miễn phí)
await request("/admin/vouchers", {
  method: "POST",
  body: {
    code: "SAN200K",
    title: "Giảm 200.000đ toàn sàn",
    amount: 200000,
    minOrder: 2000000,
    quantity: 500,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 86400000),
    pointsCost: 50 // >0 = đổi bằng điểm
  }
});

// 6. Xử lý khiếu nại chuyển từ CSKH kèm quyền cưỡng chế hoàn tiền
await request(`/admin/complaints/${complaintId}/resolve`, {
  method: "POST",
  body: { result: "Chấp thuận hoàn tiền cho khách", forceRefund: true }
});
```

---

# PHẦN VI — FEATURE INVENTORY

### 6.1. Bảng kiểm kê 70 tính năng hệ thống chi tiết

| STT | Tên tính năng | Module | File triển khai | Trạng thái | % Xong | Bằng chứng kiểm tra thực tế | Phần còn thiếu / Giới hạn |
|:---:|---|---|---|:---:|:---:|---|---|
| 1 | Trang chủ & Banner hero | Khách hàng | `frontend/index.html`<br>`frontend/js/home.js` | **WORKING** | 95% | Hero banner, catalog nav, promo cards, footer. Responsive tốt. | Chưa có slider ảnh động nhiều banner. |
| 2 | Danh sách Voucher toàn sàn | Khách hàng | `frontend/index.html`<br>`frontend/js/home.js` | **WORKING** | 95% | Gọi `GET /api/vouchers/platform`, danh sách voucher, nút nhận/đổi điểm. | Chưa có lọc voucher theo mệnh giá. |
| 3 | Sản phẩm bán chạy & Khám phá | Khách hàng | `frontend/index.html`<br>`frontend/js/home.js` | **WORKING** | 90% | Gọi `GET /api/products?sort=popular` và `GET /api/products` lọc nhanh. | Chưa có infinite scroll. |
| 4 | Xem sản phẩm theo Gian hàng | Khách hàng | `frontend/index.html`<br>`frontend/js/home.js` | **WORKING** | 90% | Dropdown chọn cửa hàng đang hoạt động, lọc sản phẩm của riêng shop. | Chưa có trang hồ sơ shop riêng (`shop.html`). |
| 5 | Tìm kiếm gợi ý (Autocomplete) | Khách hàng | `frontend/js/home.js` | **WORKING** | 90% | Input search combobox, debounce 250ms, hiển thị gợi ý kèm giá và ảnh. | Chưa lưu lịch sử tìm kiếm vào localStorage. |
| 6 | Catalog & Bộ lọc nâng cao | Khách hàng | `frontend/products.html`<br>`frontend/js/products.js` | **WORKING** | 95% | Lọc danh mục (cả con), brand, shop, khoảng giá, sắp xếp; chips xóa lọc. | Chưa có lọc theo khoảng số sao đánh giá. |
| 7 | Chi tiết sản phẩm & Thư viện ảnh | Khách hàng | `frontend/product.html`<br>`frontend/js/product.js` | **WORKING** | 95% | Ảnh chính, thumbnail click chuyển ảnh, brand, shop link, số sao. | Chưa hỗ trợ zoom ảnh khi hover chuột. |
| 8 | Chọn biến thể (SKU) & Tồn kho | Khách hàng | `frontend/js/product.js` | **WORKING** | 95% | Nút chọn từng biến thể, cập nhật giá và cảnh báo tồn kho tương ứng. | Biến thể hiển thị dạng 1 chiều. |
| 9 | Thêm vào giỏ & Mua ngay | Khách hàng | `frontend/js/product.js` | **WORKING** | 95% | Thêm vào giỏ cập nhật badge; Mua ngay chuyển thẳng sang checkout. | Mua ngay kiểm tra giỏ trước khi đặt. |
| 10 | Đánh giá sản phẩm công khai | Khách hàng | `frontend/js/product.js` | **WORKING** | 90% | Gọi `GET /api/products/:id/reviews`, phân trang, che tên người đánh giá. | Chưa có lọc đánh giá theo số sao ở trang SP. |
| 11 | Giỏ hàng đa gian hàng | Khách hàng | `frontend/cart.html`<br>`frontend/js/cart.js` | **WORKING** | 95% | Gom nhóm trực quan theo shop; chọn/bỏ chọn; sửa số lượng; xóa có Undo. | Chưa có chọn voucher ngay trong trang giỏ. |
| 12 | Xử lý hàng ngừng bán trong giỏ | Khách hàng | `frontend/js/cart.js` | **WORKING** | 95% | Hàng ẩn/xóa/hết hàng bị làm mờ, vô hiệu hóa checkbox, yêu cầu xóa. | Chưa có nút xóa nhanh tất cả món không hợp lệ. |
| 13 | Đặt hàng & Chọn địa chỉ nhận | Khách hàng | `frontend/checkout.html`<br>`frontend/js/checkout.js` | **WORKING** | 95% | Chọn từ sổ địa chỉ hoặc nhập mới (lưu vào sổ hoặc chỉ dùng 1 lần). | Chưa tích hợp API địa giới hành chính VN. |
| 14 | Chọn Voucher theo từng Shop | Khách hàng | `frontend/js/checkout.js` | **WORKING** | 90% | Mỗi shop được áp 1 voucher riêng; modal nhận/đổi voucher trực tiếp. | Mỗi đơn chỉ áp tối đa 1 voucher. |
| 15 | Lựa chọn phương thức thanh toán | Khách hàng | `frontend/js/checkout.js` | **WORKING** | 90% | Chọn "COD" hoặc "Thanh toán Online (Giả lập)". | Chưa có cổng thanh toán online thật. |
| 16 | Xác nhận đặt hàng & Tách đơn | Khách hàng | `frontend/js/checkout.js` | **WORKING** | 95% | Gọi `POST /customer/orders/checkout`, trả về `groupCode` và dọn giỏ. | Không có bước OTP qua SMS/Email khi đặt. |
| 17 | Thanh toán giả lập (Simulation) | Khách hàng | `frontend/js/checkout.js` | **MOCKED** | 80% | Nút thanh toán giả lập gọi `/pay`, sinh mã giao dịch `SIM...`. | Là luồng mô phỏng, không trừ tiền thẻ thật. |
| 18 | Theo dõi đơn hàng theo Status | Khách hàng | `frontend/orders.html`<br>`frontend/js/orders.js` | **WORKING** | 95% | Tab lọc 7 trạng thái; thanh tiến trình 5 bước; chi tiết từng sản phẩm. | Chưa tích hợp API shipper định vị GPS. |
| 19 | Khách hàng tự hủy đơn | Khách hàng | `frontend/js/orders.js` | **WORKING** | 95% | Modal nhập lý do hủy; chỉ hủy được khi đơn ở trạng thái `cho_xac_nhan`. | Chưa có danh sách lý do mẫu chọn nhanh. |
| 20 | Yêu cầu hủy đơn đã xác nhận | Khách hàng | `frontend/js/orders.js` | **WORKING** | 95% | Khi đơn `da_xac_nhan`, gửi yêu cầu hậu mãi `huy_don` chờ shop duyệt. | Không thể hủy nếu đơn đã chuyển `dang_giao`. |
| 21 | Yêu cầu Đổi hàng / Hoàn tiền | Khách hàng | `frontend/js/orders.js` | **WORKING** | 90% | Kiểm tra thời hạn 7 ngày sau giao; modal chọn `hoan_tien` / `doi_hang`. | Chưa hỗ trợ đính kèm hình ảnh hàng lỗi. |
| 22 | Khách xác nhận "Đã nhận hàng" | Khách hàng | `frontend/js/orders.js` | **WORKING** | 95% | Chỉ khả dụng khi đơn `da_giao`; chuyển `hoan_tat`, máy chủ cộng điểm. | Bị chặn nếu có yêu cầu hậu mãi đang chờ. |
| 23 | Gửi đánh giá sau khi nhận | Khách hàng | `frontend/js/review-ui.js` | **WORKING** | 95% | Modal chọn 1-5 sao, nhập nhận xét, kiểm tra mỗi món/đơn chỉ đánh giá 1 lần. | Chưa hỗ trợ tải ảnh/video mở hộp. |
| 24 | Mua lại đơn hàng cũ | Khách hàng | `frontend/js/orders.js` | **WORKING** | 90% | Nút "Mua lại" tự động thêm toàn bộ món còn bán vào giỏ hiện tại. | Báo lỗi nếu biến thể cũ đã hết hàng. |
| 25 | Quản lý Hồ sơ cá nhân | Khách hàng | `frontend/account.html`<br>`frontend/js/account.js` | **WORKING** | 95% | Xem email, sửa họ tên và SĐT, lưu vào CSDL qua `PUT /profile`. | Chưa hỗ trợ đổi ảnh đại diện. |
| 26 | Quản lý Sổ địa chỉ | Khách hàng | `frontend/js/account.js` | **WORKING** | 95% | Thêm, sửa, xóa địa chỉ, đặt mặc định; chống tạo trùng địa chỉ. | Không có bản đồ định vị. |
| 27 | Đổi mật khẩu tài khoản | Chung | `frontend/js/account.js` | **WORKING** | 95% | Nhập mật khẩu cũ, mật khẩu mới (6-100 ký tự), gọi `PUT /password`. | Đổi mật khẩu chưa thu hồi JWT cũ. |
| 28 | Ví Voucher cá nhân | Khách hàng | `frontend/js/account.js` | **WORKING** | 95% | Tab chưa dùng / đã dùng; đánh dấu hết hạn; modal đổi voucher từ điểm. | Chưa có nút chia sẻ voucher. |
| 29 | Xem Lịch sử Điểm thưởng | Khách hàng | `frontend/js/account.js` | **WORKING** | 95% | Xem số dư điểm; lịch sử 100 giao dịch (+ cộng đơn, - đổi mã, - thu hồi). | Tỷ lệ tích điểm cố định 1 điểm / 10.000đ. |
| 30 | Danh sách Sản phẩm Yêu thích | Khách hàng | `frontend/js/account.js` | **WORKING** | 95% | Lưới sản phẩm đã thích, trạng thái kho, thêm nhanh vào giỏ, bỏ thích. | Chưa có phân nhóm wishlist theo thư mục. |
| 31 | Gửi Đơn Khiếu nại tới CSKH | Khách hàng | `frontend/js/account.js` | **WORKING** | 95% | Nhập thông tin liên hệ, mã đơn, lý do, theo dõi phản hồi từ nhân viên. | Chưa có khung chat realtime. |
| 32 | Tiếp nhận Khiếu nại (Pool) | CSKH | `frontend/staff.html`<br>`frontend/js/staff.js` | **WORKING** | 95% | Hàng đợi đơn mới. Phản hồi đầu tiên đồng thời nhận phụ trách độc quyền. | Không hỗ trợ gán lại đơn cho nhân viên khác. |
| 33 | Xử lý Khiếu nại & Chuyển Admin | CSKH | `frontend/js/staff.js` | **WORKING** | 95% | Phản hồi khách, hoàn tất khiếu nại, hoặc chuyển Admin kèm ghi chú. | Chưa có mẫu câu trả lời nhanh. |
| 34 | Tra cứu Khách hàng & Đơn hàng | CSKH | `frontend/js/staff.js` | **WORKING** | 95% | Tìm khách theo tên/email/phone, xem 20 đơn; tìm đơn theo mã/groupCode. | Chưa có xuất file Excel/CSV. |
| 35 | Kiểm duyệt & Xóa Đánh giá | CSKH | `frontend/js/staff.js` | **WORKING** | 95% | Xem review theo sản phẩm/số sao; xóa mềm; tự động tính lại điểm rating. | Chưa có khôi phục review đã xóa. |
| 36 | Giao diện Seller Center | Người bán | `frontend/js/shopping.js` | **NOT IMPLEMENTED** | 0% | Menu chỉ hiện toast "Tính năng đang phát triển". | **HOÀN TOÀN CHƯA CÓ GIAO DIỆN WEB SELLER.** |
| 37 | Giao diện Admin Console | Quản trị | `frontend/js/shopping.js` | **NOT IMPLEMENTED** | 0% | Menu chỉ hiện toast "Tính năng đang phát triển". | **HOÀN TOÀN CHƯA CÓ GIAO DIỆN WEB ADMIN.** |
| 38 | Đăng ký & Đăng nhập API | Backend | `routes/auth.js` | **WORKING** | 100% | Băm mật khẩu bcrypt, phát sinh JWT, kiểm tra tài khoản pending/locked. | Đạt 100% kiểm thử tự động. |
| 39 | Quản lý Gian hàng API | Backend | `routes/seller.js` | **WORKING** | 100% | Cập nhật logo, mô tả, chính sách shop (chỉ chủ gian hàng). | Thiếu giao diện web. |
| 40 | Duyệt Nhân viên Shop API | Backend | `routes/seller.js` | **WORKING** | 100% | Phê duyệt, từ chối, khóa, mở khóa nhân viên gian hàng. | Thiếu giao diện web. |
| 41 | CRUD Sản phẩm & Biến thể API | Backend | `routes/seller.js` | **WORKING** | 100% | Tạo SP kèm mảng biến thể SKU, tính minPrice, ẩn/hiện, xóa mềm. | Thiếu giao diện web. |
| 42 | Quản lý Tồn kho Biến thể API | Backend | `routes/seller.js` | **WORKING** | 100% | Xem tồn kho theo SKU, cập nhật số lượng tuyệt đối hoặc tăng/giảm delta. | Thiếu giao diện web. |
| 43 | Quản lý & Cập nhật Đơn hàng API | Backend | `routes/seller.js` | **WORKING** | 100% | Chuyển trạng thái đơn `da_xac_nhan -> dang_giao -> da_giao`, từ chối đơn. | Thiếu giao diện web. |
| 44 | Duyệt Đổi trả / Hoàn tiền API | Backend | `routes/seller.js` | **WORKING** | 100% | Chấp thuận hoặc từ chối yêu cầu đổi trả kèm ghi chú bắt buộc. | Thiếu giao diện web. |
| 45 | Quản lý Voucher Shop API | Backend | `routes/seller.js` | **WORKING** | 100% | Tạo, sửa, xóa voucher riêng của shop (shop tự chịu chi phí). | Thiếu giao diện web. |
| 46 | Phản hồi Đánh giá API | Backend | `routes/seller.js` | **WORKING** | 100% | Người bán phản hồi nhận xét của khách hàng đối với sản phẩm. | Thiếu giao diện web. |
| 47 | Báo cáo Doanh thu Shop API | Backend | `routes/seller.js` | **WORKING** | 100% | Thống kê doanh thu thực nhận, số đơn hoàn tất, top sản phẩm bán chạy. | Thiếu giao diện web. |
| 48 | Thống kê GMV Toàn sàn API | Backend | `routes/admin.js` | **WORKING** | 100% | Tổng GMV, chi phí voucher sàn đã tài trợ, top 10 shop doanh thu cao. | Thiếu giao diện web. |
| 49 | Phê duyệt Gian hàng mới API | Backend | `routes/admin.js` | **WORKING** | 100% | Duyệt mở shop, từ chối mở shop (kèm lý do), khóa/mở khóa shop. | Thiếu giao diện web. |
| 50 | Quản lý Nhân sự CSKH API | Backend | `routes/admin.js` | **WORKING** | 100% | Tạo tài khoản CSKH mới, khóa/mở khóa và xóa mềm tài khoản CSKH. | Thiếu giao diện web. |
| 51 | Quản trị Khách hàng API | Backend | `routes/admin.js` | **WORKING** | 100% | Xem danh sách khách hàng, khóa/mở khóa tài khoản vi phạm. | Thiếu giao diện web. |
| 52 | Quản lý Danh mục & Brand API | Backend | `routes/admin.js` | **WORKING** | 100% | Thêm, sửa, xóa danh mục và thương hiệu (chặn xóa nếu còn SP). | Thiếu giao diện web. |
| 53 | Phát hành Voucher Sàn API | Backend | `routes/admin.js` | **WORKING** | 100% | Tạo voucher sàn miễn phí hoặc đổi điểm, đặt số lượng và thời hạn. | Thiếu giao diện web. |
| 54 | Giám sát Đơn hàng Toàn sàn API| Backend | `routes/admin.js` | **WORKING** | 100% | Xem danh sách và chi tiết toàn bộ đơn hàng trên sàn. | Thiếu giao diện web. |
| 55 | Phán quyết Khiếu nại Admin API | Backend | `routes/admin.js` | **WORKING** | 100% | Xử lý khiếu nại chuyển từ CSKH, hỗ trợ cờ ép hoàn tiền `forceRefund`. | Thiếu giao diện web. |
| 56 | Tách đơn đa Shop Service | Backend | `orderService.js` | **WORKING** | 100% | Chia đơn theo shop, trừ kho nguyên tử, rollback khi lỗi. | Hoàn hảo 100%. |
| 57 | Tự động Hoàn tất Đơn Service | Backend | `orderService.js` | **WORKING** | 100% | Tự hoàn tất đơn đã giao quá 3 ngày, cộng điểm thưởng, tăng soldCount. | Chạy định kỳ mỗi giờ qua `setInterval`. |
| 58 | Trừ kho Nguyên tử Service | Backend | `orderService.js` | **WORKING** | 100% | Trừ kho có điều kiện `$gte: quantity` chống bán quá số lượng. | Đạt 100% test tranh chấp. |
| 59 | Hoàn tiền & Thu hồi Điểm Service | Backend | `orderService.js` | **WORKING** | 100% | Cập nhật payment refunded, thu hồi đúng số điểm thưởng đã cộng. | Hàng trả về không tự động cộng kho. |
| 60 | Nhận & Đổi Voucher Service | Backend | `voucherService.js` | **WORKING** | 100% | Kiểm tra điều kiện, trừ remaining, trừ điểm, hoàn lượt nếu thiếu điểm. | Hoàn hảo 100%. |
| 61 | Tính toán Rating Service | Backend | `ratingService.js` | **WORKING** | 100% | Tính điểm sao trung bình cho Product và Shop sau khi review thay đổi. | Hoàn hảo 100%. |
| 62 | Tổng hợp Thống kê Service | Backend | `statsService.js` | **WORKING** | 100% | Tổng hợp doanh thu, chuỗi thời gian ngày/tháng, top sản phẩm. | Chạy bằng Pure JS logic hiệu năng cao. |
| 63 | Tra cứu Khách & Đơn CSKH API | Backend | `routes/staff.js` | **WORKING** | 100% | Tìm khách theo tên/phone/email; tìm đơn toàn sàn. | Kết nối 100% với `staff.html`. |
| 64 | Xử lý Khiếu nại CSKH API | Backend | `routes/staff.js` | **WORKING** | 100% | Tiếp nhận độc quyền mutex, phản hồi, hoàn tất, chuyển admin. | Kết nối 100% với `staff.html`. |
| 65 | Xóa Đánh giá vi phạm CSKH API | Backend | `routes/staff.js` | **WORKING** | 100% | Xóa mềm review, ghi nhận deletedBy, cập nhật lại rating. | Kết nối 100% với `staff.html`. |
| 66 | Upload Ảnh lên Disk API | Backend | `routes/seller.js` | **WORKING** | 90% | Multer upload file ảnh <= 3MB vào `server/uploads/`. | Lưu ổ cứng cục bộ, chưa lên Cloud. |
| 67 | Kiểm thử Smoke tự động | Testing | `test/smoke.js` | **WORKING** | 100% | 127 bài test tích hợp chạy trên In-Memory DB đạt 127/127 pass. | Không phụ thuộc DB thật. |
| 68 | Kiểm thử CSKH & Tranh chấp | Testing | `test/cskh.js` | **WORKING** | 100% | 101 bài test nghiệp vụ CSKH và bảo vệ 27 tình huống tranh chấp pass. | Không phụ thuộc DB thật. |
| 69 | Kiểm thử Phân quyền & Injection | Testing | `test/cskh-extended.js` | **WORKING** | 100% | 188 bài test injection, prototype pollution, boundary đạt 188/188 pass. | Không phụ thuộc DB thật. |
| 70 | Kiểm thử Giao diện Playwright | Testing | `test/cskh-ui.js` | **BLOCKED** | 0% | Thiếu binary Chromium headless trong OS cục bộ. | Cần chạy `npx playwright install`. |

---

### 6.2. Thống kê tỷ lệ hoàn thiện theo 4 nhóm đối tượng

| Phân hệ đối tượng | Tổng số tính năng | Đã hoạt động cả UI + API | Chỉ có API (Thiếu UI) | Tỷ lệ hoàn thiện UI thực tế |
|---|:---:|:---:|:---:|:---:|
| **1. Khách hàng (Storefront)** | 31 | 29 | 2 | **93.5%** |
| **2. CSKH (Support Desk)** | 8 | 8 | 0 | **100.0%** |
| **3. Người bán (Seller Center)** | 19 | 0 | 19 | **0.0% (Backend 100%)** |
| **4. Quản trị viên (Admin Console)** | 12 | 0 | 12 | **0.0% (Backend 100%)** |
| **TOÀN HỆ THỐNG** | **70** | **37** | **33** | **52.8%** |

---

# PHẦN VII — API & DATABASE AUDIT

### 7.1. Bảng kiểm toán 58 Backend API Endpoints

Hệ thống backend cung cấp **58 API endpoints** được định nghĩa tại `server/src/routes/`:

#### Nhóm `/api/auth` (10 APIs):
1. `POST /api/auth/register` — Public — Zod: `fullName, email, phone, password` — Tạo User `customer`
2. `GET /api/auth/shops` — Public — Lấy danh sách shop đang hoạt động để nhân viên chọn đăng ký
3. `POST /api/auth/register-seller` — Public — Zod: `sellerType: owner|staff`, info shop/staff — Tạo User `seller`
4. `POST /api/auth/login` — Public — Zod: `email, password` — Đăng nhập, trả về token, user, shop
5. `POST /api/auth/logout` — Authenticated — Client xác nhận xóa token
6. `GET /api/auth/me` — Authenticated — Lấy thông tin user hiện tại và shop liên kết
7. `PUT /api/auth/password` — Authenticated — Zod: `oldPassword, newPassword(6-100)` — Đổi mật khẩu
8. `POST /api/auth/forgot-password` — Public — Zod: `email` — Sinh token reset, trả devResetToken nếu dev
9. `POST /api/auth/reset-password` — Public — Zod: `token, newPassword` — Đặt lại mật khẩu mới

#### Nhóm `/api` (Public Catalog) (7 APIs):
10. `GET /api/categories` — Public — Lấy danh mục sản phẩm chưa xóa mềm
11. `GET /api/brands` — Public — Lấy thương hiệu sản phẩm chưa xóa mềm
12. `GET /api/products` — Public — Query: `q, category, brand, shop, minPrice, maxPrice, sort, page, limit` — Danh sách sản phẩm, tính tổng kho qua MongoDB `$group`
13. `GET /api/vouchers/platform` — Public — Danh sách voucher toàn sàn đang phát hành
14. `GET /api/products/:id` — Public — Chi tiết sản phẩm kèm danh sách biến thể SKU, giá, kho
15. `GET /api/products/:id/reviews` — Public — Query: `page, limit` — Danh sách review che tên khách
16. `GET /api/shops/:id` — Public — Chi tiết gian hàng kèm số lượng sản phẩm đang bán

#### Nhóm `/api/customer` (24 APIs):
17. `GET /api/customer/profile` — Role: `customer` — Xem hồ sơ cá nhân
18. `PUT /api/customer/profile` — Role: `customer` — Zod: `fullName?, phone?` — Sửa hồ sơ
19. `GET /api/customer/addresses` — Role: `customer` — Lấy sổ địa chỉ
20. `POST /api/customer/addresses` — Role: `customer` — Zod: `addressSchema` — Thêm địa chỉ mới
21. `PUT /api/customer/addresses/:id` — Role: `customer` — Zod: `addressSchema.partial()` — Sửa địa chỉ
22. `DELETE /api/customer/addresses/:id` — Role: `customer` — Xóa địa chỉ
23. `GET /api/customer/cart` — Role: `customer` — Xem giỏ hàng, xác định hàng ngừng bán/hết hàng
24. `POST /api/customer/cart/items` — Role: `customer` — Zod: `productId, variantId, quantity(1-99)` — Thêm vào giỏ
25. `PATCH /api/customer/cart/items/:itemId` — Role: `customer` — Zod: `quantity(1-99)` — Cập nhật số lượng
26. `DELETE /api/customer/cart/items/:itemId` — Role: `customer` — Xóa món khỏi giỏ
27. `GET /api/customer/wishlist` — Role: `customer` — Danh sách yêu thích kèm giá và tồn kho
28. `POST /api/customer/wishlist/:productId` — Role: `customer` — Thêm vào yêu thích
29. `DELETE /api/customer/wishlist/:productId` — Role: `customer` — Bỏ khỏi yêu thích
30. `GET /api/customer/vouchers/available` — Role: `customer` — Query: `shop?` — Danh sách voucher có thể nhận/đổi
31. `POST /api/customer/vouchers/:id/claim` — Role: `customer` — Nhận voucher miễn phí
32. `POST /api/customer/vouchers/:id/redeem` — Role: `customer` — Đổi voucher sàn bằng điểm tích lũy
33. `GET /api/customer/my-vouchers` — Role: `customer` — Query: `status?` — Ví voucher của khách
34. `GET /api/customer/points` — Role: `customer` — Số dư điểm và 100 giao dịch điểm gần nhất
35. `POST /api/customer/orders/checkout` — Role: `customer` — Zod: `checkoutSchema` — Tách đơn, trừ kho nguyên tử, tạo đơn, dọn giỏ
36. `POST /api/customer/orders/group/:groupCode/pay` — Role: `customer` — Thanh toán online giả lập cho nhóm đơn
37. `GET /api/customer/orders` — Role: `customer` — Query: `status, page, limit` — Danh sách đơn hàng
38. `GET /api/customer/orders/:id` — Role: `customer` — Chi tiết đơn hàng kèm lịch sử trạng thái
39. `POST /api/customer/orders/:id/cancel` — Role: `customer` — Zod: `reason(3-300)` — Khách tự hủy đơn chờ xác nhận
40. `POST /api/customer/orders/:id/confirm-received` — Role: `customer` — Khách xác nhận đã nhận hàng, cộng điểm
41. `POST /api/customer/orders/:id/after-sales` — Role: `customer` — Zod: `type, reason(5-500)` — Gửi yêu cầu hủy/hoàn tiền/đổi hàng
42. `GET /api/customer/after-sales` — Role: `customer` — Danh sách yêu cầu hậu mãi của khách
43. `GET /api/customer/reviews` — Role: `customer` — Danh sách đánh giá của tôi
44. `POST /api/customer/reviews` — Role: `customer` — Zod: `orderId, productId, rating(1-5), content` — Gửi đánh giá mới
45. `POST /api/customer/complaints` — Role: `customer` — Zod: `contactName, phone, email?, orderCode, reason` — Gửi khiếu nại CSKH
46. `GET /api/customer/complaints` — Role: `customer` — Danh sách khiếu nại của tôi
47. `GET /api/customer/complaints/:id` — Role: `customer` — Chi tiết khiếu nại kèm phản hồi CSKH

#### Nhóm `/api/seller` (19 APIs — Backend hoàn chỉnh 100%, Chưa có UI):
48. `GET /api/seller/shop` — Role: `seller` — Lấy thông tin gian hàng của mình
49. `PUT /api/seller/shop` — Role: `seller` (Owner + Active) — Sửa logo, mô tả, chính sách shop
50. `POST /api/seller/upload` — Role: `seller` (Active) — Upload hình ảnh sản phẩm (Multer <= 3MB)
51. `GET /api/seller/staff` — Role: `seller` (Owner) — Danh sách nhân viên gian hàng
52. `PATCH /api/seller/staff/:id/(approve|reject|lock|unlock)` — Role: `seller` (Owner + Active) — Duyệt/khóa nhân viên
53. `GET /api/seller/products` — Role: `seller` (Active) — Danh sách sản phẩm của shop kèm biến thể
54. `GET /api/seller/products/:id` — Role: `seller` (Active) — Chi tiết sản phẩm kèm biến thể
55. `POST /api/seller/products` — Role: `seller` (Active) — Zod: `productIn` — Tạo sản phẩm mới kèm mảng biến thể SKU
56. `PUT /api/seller/products/:id` — Role: `seller` (Active) — Sửa sản phẩm, đồng bộ biến thể, xóa mềm biến thể bỏ chọn
57. `PATCH /api/seller/products/:id/visibility` — Role: `seller` (Active) — Zod: `hidden: Boolean` — Ẩn/hiện sản phẩm
58. `DELETE /api/seller/products/:id` — Role: `seller` (Active) — Xóa mềm sản phẩm
59. `GET /api/seller/inventory` — Role: `seller` (Active) — Tồn kho theo từng biến thể SKU, lọc theo ngưỡng
60. `PATCH /api/seller/products/:id/variants/:variantId/stock` — Role: `seller` (Active) — Sửa tồn kho tuyệt đối hoặc delta
61. `GET /api/seller/orders` — Role: `seller` (Active) — Danh sách đơn hàng của shop
62. `GET /api/seller/orders/:id` — Role: `seller` (Active) — Chi tiết đơn hàng kèm thông tin khách
63. `PATCH /api/seller/orders/:id/status` — Role: `seller` (Active) — Zod: `status: da_xac_nhan|dang_giao|da_giao` — Chuyển trạng thái
64. `POST /api/seller/orders/:id/reject` — Role: `seller` (Active) — Zod: `reason` — Từ chối đơn chờ xác nhận, hoàn kho
65. `GET /api/seller/after-sales` — Role: `seller` (Active) — Danh sách yêu cầu đổi trả/hủy đơn của khách
66. `PATCH /api/seller/after-sales/:id` — Role: `seller` (Active) — Zod: `decision: accept|reject, note` — Duyệt hậu mãi
67. `GET /api/seller/vouchers` — Role: `seller` (Active) — Quản lý voucher riêng của shop
68. `POST /api/seller/vouchers` — Role: `seller` (Active) — Zod: `voucherIn` — Tạo voucher shop (shop chịu chi phí)
69. `PUT /api/seller/vouchers/:id` — Role: `seller` (Active) — Sửa số lượng/thời hạn voucher shop
70. `DELETE /api/seller/vouchers/:id` — Role: `seller` (Active) — Xóa mềm voucher shop
71. `GET /api/seller/reviews` — Role: `seller` (Active) — Danh sách đánh giá sản phẩm của shop
72. `POST /api/seller/reviews/:id/reply` — Role: `seller` (Active) — Zod: `content` — Phản hồi đánh giá của khách
73. `GET /api/seller/stats` — Role: `seller` (Owner + Active) — Báo cáo doanh thu thực nhận, top sản phẩm

#### Nhóm `/api/staff` (CSKH) (11 APIs):
74. `GET /api/staff/customers` — Role: `cskh` — Tra cứu khách hàng theo tên, email, SĐT
75. `GET /api/staff/customers/:id` — Role: `cskh` — Chi tiết khách hàng kèm 20 đơn gần nhất
76. `GET /api/staff/orders` — Role: `cskh` — Tra cứu đơn hàng toàn sàn theo mã đơn/groupCode/khách
77. `GET /api/staff/orders/:id` — Role: `cskh` — Chi tiết đơn hàng toàn sàn
78. `GET /api/staff/complaints` — Role: `cskh` — Query: `scope: pool|mine|history` — Danh sách khiếu nại
79. `GET /api/staff/complaints/:id` — Role: `cskh` — Chi tiết khiếu nại (bảo vệ quyền riêng tư nếu đã có người nhận)
80. `POST /api/staff/complaints/:id/respond` — Role: `cskh` — Zod: `content` — Phản hồi khách (nhận phụ trách độc quyền)
81. `POST /api/staff/complaints/:id/resolve` — Role: `cskh` — Zod: `result` — Hoàn tất khiếu nại
82. `POST /api/staff/complaints/:id/escalate` — Role: `cskh` — Zod: `note` — Chuyển khiếu nại lên Quản trị viên
83. `GET /api/staff/reviews` — Role: `cskh` — Xem đánh giá theo sản phẩm/số sao
84. `DELETE /api/staff/reviews/:id` — Role: `cskh` — Xóa mềm đánh giá vi phạm, cập nhật rating trung bình

#### Nhóm `/api/admin` (16 APIs — Backend hoàn chỉnh 100%, Chưa có UI):
85. `GET /api/admin/stats` — Role: `admin` — Báo cáo tổng GMV, voucher sàn đã chịu, top gian hàng
86. `GET /api/admin/customers` — Role: `admin` — Danh sách tài khoản khách hàng
87. `PATCH /api/admin/customers/:id/(lock|unlock)` — Role: `admin` — Khóa hoặc mở khóa khách hàng
88. `GET /api/admin/shops` — Role: `admin` — Danh sách gian hàng trên sàn
89. `PATCH /api/admin/shops/:id/(approve|reject|lock|unlock)` — Role: `admin` — Duyệt mở shop, từ chối mở shop, khóa/mở khóa shop
90. `GET /api/admin/cskh` — Role: `admin` — Danh sách nhân viên CSKH
91. `POST /api/admin/cskh` — Role: `admin` — Zod: `fullName, email, phone, password` — Tạo nhân viên CSKH mới
92. `PATCH /api/admin/cskh/:id/(lock|unlock)` — Role: `admin` — Khóa hoặc mở khóa tài khoản CSKH
93. `DELETE /api/admin/cskh/:id` — Role: `admin` — Xóa mềm tài khoản CSKH
94. `GET /api/admin/vouchers` — Role: `admin` — Danh sách voucher toàn sàn
95. `POST /api/admin/vouchers` — Role: `admin` — Zod: `voucherBase` — Phát hành voucher sàn (miễn phí hoặc đổi điểm)
96. `PUT /api/admin/vouchers/:id` — Role: `admin` — Chỉnh sửa voucher sàn
97. `DELETE /api/admin/vouchers/:id` — Role: `admin` — Xóa mềm voucher sàn
98. `POST/PUT/DELETE /api/admin/categories` — Role: `admin` — Quản trị danh mục cha-con
99. `POST/PUT/DELETE /api/admin/brands` — Role: `admin` — Quản trị thương hiệu sản phẩm
100. `GET /api/admin/orders` — Role: `admin` — Giám sát toàn bộ đơn hàng trên sàn
101. `GET /api/admin/complaints` — Role: `admin` — Danh sách khiếu nại do CSKH chuyển lên
102. `POST /api/admin/complaints/:id/resolve` — Role: `admin` — Zod: `result, forceRefund?` — Phán quyết khiếu nại, ép hoàn tiền

---

### 7.2. Kiểm toán chi tiết 13 Mongoose Models và 15 Collections

Dự án sở hữu 15 collection chuẩn hóa:
1. `users` (`User.js`): Chứa thông tin đăng nhập, vai trò (`role`: `customer`, `seller`, `cskh`, `admin`), `sellerRole`, liên kết `shop`, mảng nhúng `addresses`, điểm tích lũy `points`. Mật khẩu được ẩn mặc định với `select: false`.
2. `shops` (`Shop.js`): Thông tin cửa hàng, chuẩn hóa `nameKey` chống trùng, `owner` liên kết 1-1 với `User`, trạng thái duyệt `status` (`pending`, `active`, `locked`, `rejected`), điểm đánh giá trung bình `ratingAvg`.
3. `categories` (`Catalog.js`): Danh mục sản phẩm, hỗ trợ cây phân cấp cha-con qua trường `parent: ObjectId ref Category`.
4. `brands` (`Catalog.js`): Thương hiệu sản phẩm (Apple, ASUS, Dell, MSI, v.v.).
5. `products` (`Product.js`): Sản phẩm chính, liên kết `shop`, `category`, `brand`, hình ảnh, giá thấp nhất `minPrice`, số lượng đã bán `soldCount`, điểm đánh giá `ratingAvg`.
6. `variants` (`Product.js`): Biến thể SKU của sản phẩm (tên, giá, sku, **tồn kho stock**). Lưu tồn kho trực tiếp tại đây.
7. `carts` (`Cart.js`): Giỏ hàng của khách (liên kết 1-1 với user), mảng items `{ product, variant, quantity }`.
8. `wishlists` (`Cart.js`): Danh sách sản phẩm yêu thích (liên kết 1-1 với user).
9. `orders` (`Order.js`): Đơn hàng đã đặt, mã đơn `code`, mã thanh toán chung `groupCode`, liên kết `customer` và `shop`, snapshot địa chỉ `shippingAddress`, voucher áp dụng, thông tin thanh toán `payment`, lịch sử trạng thái `statusHistory`.
10. `vouchers` (`Voucher.js`): Bản mẫu voucher, mã `code` (unique), phạm vi `scope` (`platform` hoặc `shop`), mức giảm `amount`, đơn tối thiểu `minOrder`, số lượng phát hành, thời hạn, số điểm cần đổi `pointsCost`.
11. `uservouchers` (`Voucher.js`): Bản voucher thực tế do người dùng sở hữu (nguồn `claim` hoặc `points`), trạng thái `unused` hoặc `used`, liên kết đơn hàng đã sử dụng.
12. `pointtxes` (`Voucher.js`): Lịch sử biến động điểm (`earn` khi hoàn tất đơn, `redeem` khi đổi voucher, `revoke` khi hoàn tiền đơn hàng).
13. `reviews` (`Support.js`): Đánh giá sản phẩm, xếp hạng sao 1-5, nội dung, phản hồi của người bán `reply`, cờ xóa mềm `isDeleted`. Compound Unique Index trên `{ order: 1, product: 1 }`.
14. `aftersales` (`Support.js`): Yêu cầu hậu mãi cấp đơn hàng (`type`: `huy_don`, `hoan_tien`, `doi_hang`), lý do, trạng thái xử lý của người bán `status`, ghi chú phản hồi `sellerNote`.
15. `complaints` (`Support.js`): Đơn khiếu nại gửi CSKH, mã `code` (tiền tố `KN...`), thông tin liên hệ, mã đơn, lý do, nhân viên phụ trách `assignedTo`, mảng trao đổi `responses`, kết quả giải quyết `result`, ghi chú chuyển admin `escalateNote`.

---

### 7.3. Đánh giá tính toàn vẹn dữ liệu và kiểm soát tương tranh

1. **Trừ kho nguyên tử (Atomic Inventory Deduction):**
   Trong `orderService.js#L93`, thao tác giữ hàng và trừ kho được thực thi độc lập:
   ```javascript
   Variant.updateOne(
     { _id: l.variant._id, isDeleted: false, stock: { $gte: l.quantity } },
     { $inc: { stock: -l.quantity } }
   );
   ```
   Nếu có 2 khách hàng cùng đặt món hàng cuối cùng, MongoDB chỉ cho phép 1 tiến trình cập nhật thành công (`modifiedCount === 1`). Khách hàng thứ 2 lập tức nhận lỗi `409 Conflict`, hệ thống tự động gọi hàm hoàn tác `restoreStock` và `restoreVoucher`. Đảm bảo không xảy ra hiện tượng overselling kể cả khi chạy trên MongoDB Standalone đơn giản.
2. **Khóa tương tranh CSKH (Mutex Concurrency Locking):**
   Trong `routes/staff.js#L96`, việc gán nhân viên phụ trách sử dụng `findOneAndUpdate`:
   ```javascript
   Complaint.findOneAndUpdate(
     {
       _id: req.params.id,
       status: { $in: ['moi', 'dang_xu_ly'] },
       $or: [{ assignedTo: null }, { assignedTo: req.user._id }]
     },
     { ...update, $set: { assignedTo: req.user._id } },
     { new: true, runValidators: true }
   );
   ```
   Nếu 2 nhân viên CSKH cùng mở một khiếu nại mới và bấm phản hồi đồng thời, chỉ 1 người được gán quyền phụ trách thành công; người còn lại nhận mã lỗi `403 Forbidden` hoặc `409 Conflict`.
3. **Chống đánh giá trùng lặp:**
   Chỉ mục duy nhất hỗn hợp `{ order: 1, product: 1 }` trên bảng `reviews` ngăn chặn tuyệt đối việc một khách hàng đánh giá 2 lần cho cùng một sản phẩm trong cùng một đơn hàng.

---

# PHẦN VIII — BUSINESS FLOW AUDIT

### 8.1. Đánh giá 19 quy trình nghiệp vụ TMĐT cốt lõi

1. **Đăng ký & Đăng nhập:** Hoạt động trơn tru. Hỗ trợ 4 vai trò, kiểm tra tài khoản pending/locked, đo độ mạnh mật khẩu. Điểm nghẽn: Chủ shop mới tạo shop ở trạng thái `pending`, nhưng Admin chưa có web để duyệt.
2. **Hồ sơ & Sổ địa chỉ:** Hoạt động trơn tru. Thêm/sửa/xóa địa chỉ, đặt mặc định, chống tạo trùng lặp. Điểm hạn chế: Đổi mật khẩu chưa thu hồi token cũ.
3. **Duyệt Danh mục & Thương hiệu:** Hoạt động trơn tru. Cây phân cấp cha-con tự động bao gồm sản phẩm của danh mục con. Điểm nghẽn: Admin chưa có web để thêm/sửa danh mục.
4. **Tìm kiếm, Lọc & Phân trang:** Hoạt động trơn tru. Autocomplete gợi ý nhanh 250ms, lọc đa tiêu chí (danh mục, brand, shop, giá, sort).
5. **Xem Chi tiết Sản phẩm:** Hoạt động trơn tru. Gallery thumbnail chuyển ảnh mượt mà, chọn biến thể SKU tự động cập nhật giá và tồn kho tương ứng.
6. **Quản lý Giỏ hàng Đa Gian hàng:** Hoạt động trơn tru. Gom nhóm trực quan theo từng shop, cập nhật số lượng, xóa có nút hoàn tác Undo. Hàng ngừng bán được làm mờ và chặn thanh toán.
7. **Đặt hàng & Chia đơn Đa Shop:** Hoạt động trơn tru. Giỏ hàng $N$ shop tự động tách thành $N$ đơn hàng riêng biệt liên kết qua chung mã `groupCode`. Trừ kho nguyên tử và dọn giỏ hàng đã mua.
8. **Snapshot Địa chỉ Giao hàng:** Hoạt động trơn tru. Địa chỉ được sao chép nguyên trạng vào `Order.shippingAddress`, đảm bảo sửa sổ địa chỉ sau này không ảnh hưởng đơn cũ.
9. **Tính Phí Vận chuyển:** Hoạt động trơn tru. Phí ship cố định 30.000đ cho mỗi đơn của từng shop ($N$ shop $= N \times 30.000đ$). Cấu hình tập trung tại `config.shippingFee`.
10. **Áp dụng Mã giảm giá (Vouchers):** Hoạt động trơn tru. Mỗi shop được áp 1 voucher. Phân định chi phí minh bạch: Voucher shop do shop chịu (`sellerRevenue = subtotal - discount`), Voucher sàn do sàn chịu (`sellerRevenue = subtotal`).
11. **Thanh toán:** COD ghi nhận tiền khi giao hàng. Thanh toán Online hiện là mô phỏng nội bộ (`SIM...`), chưa kết nối cổng ngân hàng thật.
12. **Xử lý Kết quả Thanh toán:** Cập nhật trạng thái `paid` cho toàn bộ nhóm đơn sau khi thanh toán online giả lập thành công.
13. **Theo dõi Đơn hàng:** Hoạt động trơn tru. Bộ lọc 7 trạng thái, thanh tiến trình trực quan 5 bước, hiển thị đầy đủ thông tin sản phẩm và ghi chú shop.
14. **Vòng đời Đơn hàng & Tự động Hoàn tất:** Đơn hàng đi qua `cho_xac_nhan -> da_xac_nhan -> dang_giao -> da_giao -> hoan_tat`. Tiến trình ngầm `autoCompleteOrders` chạy mỗi giờ, tự hoàn tất đơn đã giao quá 3 ngày nếu không có khiếu nại.
15. **Quản lý Sản phẩm & Tồn kho Người bán:** Backend API hoàn chỉnh 100%. Điểm nghẽn: Người bán chưa có giao diện web để thao tác.
16. **Quản lý Gian hàng & Nhân sự Shop:** Backend API hoàn chỉnh 100%. Điểm nghẽn: Chủ shop chưa có giao diện web để duyệt nhân viên shop.
17. **Đánh giá & Nhận xét Sản phẩm:** Hoạt động trơn tru. Chỉ đánh giá khi đơn `hoan_tat`, mỗi món/đơn đánh giá 1 lần, che tên người đánh giá. CSKH xóa mềm review tự động tính lại điểm rating.
18. **Hủy đơn, Đổi trả & Hoàn tiền:** Hoạt động trơn tru phía khách hàng (tự hủy khi chờ xác nhận, yêu cầu hủy khi đã xác nhận, đổi trả trong 7 ngày sau giao). Hoàn tiền tự thu hồi điểm thưởng, hàng trả về không tự động cộng kho. Điểm nghẽn: Shop chưa có web để bấm duyệt đổi trả.
19. **Hỗ trợ CSKH & Quản trị Hệ thống:** Phân hệ CSKH hoạt động hoàn hảo 100% cả UI lẫn API. Phân hệ Admin có API hoàn chỉnh nhưng thiếu web để xử lý khiếu nại chuyển lên.

---

### 8.2. Ma trận các điểm đứt gãy nghiệp vụ giữa Frontend và Backend

```
+---------------------------------------------------------------------------------------------------+
| QUY TRÌNH NGHIỆP VỤ           | KHÁCH HÀNG  | NGƯỜI BÁN   | NHÂN VIÊN CSKH | ADMIN     | ĐỨT GÃY? |
+-------------------------------+:-----------:+:-----------:+:--------------:+:---------:+:--------:+
| 1. Đăng ký & Duyệt Shop       |     OK      | Chờ duyệt   |       —        | Thiếu UI  |   CÓ     |
| 2. Đăng & Sửa Sản phẩm        |     —       | Thiếu UI    |       —        |    —      |   CÓ     |
| 3. Mua hàng & Tách đơn        |     OK      |     —       |       —        |    —      |   KHÔNG  |
| 4. Xác nhận & Giao hàng       |     OK      | Thiếu UI    |       —        |    —      |   CÓ     |
| 5. Khiếu nại -> CSKH          |     OK      |     —       |       OK       |    —      |   KHÔNG  |
| 6. Khiếu nại -> Admin         | Chờ kết quả |     —       |   Đã chuyển    | Thiếu UI  |   CÓ     |
| 7. Yêu cầu Đổi trả / Hoàn tiền|     OK      | Thiếu UI    |       —        |    —      |   CÓ     |
| 8. Đánh giá & Xóa Review      |     OK      | Thiếu UI    |       OK       |    —      |   KHÔNG  |
+---------------------------------------------------------------------------------------------------+
```

---

# PHẦN IX — BUGS, SECURITY & TECHNICAL DEBT

### 9.1. Ma trận phân loại lỗi P0 - P3

```
+--------------------------------------------------------------------------------------------------------+
| MÃ LỖI   | MỨC ĐỘ | PHÂN LOẠI   | TÊN VẤN ĐỀ / LỖI ĐÃ XÁC NHẬN                    | TỆP LIÊN QUAN      |
+----------+:------:+:------------+:------------------------------------------------+:-------------------+
| BUG-01   |   P1   | Cấu hình    | Lệch cổng API mặc định giữa Frontend và Backend | config.js (5001)   |
| BUG-02   |   P1   | Giao diện   | Thiếu hoàn toàn giao diện Web Seller Center     | shopping.js#L85    |
| BUG-03   |   P1   | Giao diện   | Thiếu hoàn toàn giao diện Web Admin Console     | shopping.js#L87    |
| BUG-04   |   P1   | Môi trường  | Thiếu binary Playwright Chromium cho test UI    | test/cskh-ui.js    |
| BUG-05   |   P1   | Nghiệp vụ   | Cổng thanh toán Online là mô phỏng nội bộ       | orderService.js    |
| SEC-01   |   P2   | Bảo mật     | Thiếu Rate Limiting chống Brute-force mật khẩu  | server/src/app.js  |
| SEC-02   |   P2   | Bảo mật     | Thiếu HTTP security headers chuẩn (Helmet)      | server/src/app.js  |
| SEC-03   |   P2   | Bảo mật     | Đổi mật khẩu không vô hiệu hóa JWT cũ           | routes/auth.js     |
| ARCH-01  |   P2   | Kiến trúc   | Lưu trữ tệp upload trực tiếp trên ổ cứng máy chủ| upload.js (Multer) |
| FEAT-01  |   P2   | Tính năng   | Review và Hậu mãi chưa có upload ảnh            | customer.js        |
| CODE-01  |   P3   | Chất lượng  | Trùng lặp mã chuẩn hóa và kiểm tra trùng địa chỉ| checkout.js        |
| UX-01    |   P3   | Trải nghiệm | Đăng nhập Seller/Admin bị chuyển về Trang chủ   | auth-service.js    |
+--------------------------------------------------------------------------------------------------------+
```

---

### 9.2. Phân tích chi tiết từng lỗi, nguyên nhân gốc và giải pháp

1. **BUG-01: Lệch cổng kết nối API mặc định (P1 — High):**
   - *Nguyên nhân:* `frontend/js/config.js` khai báo `API_BASE_URL = "http://localhost:5001/api"`, trong khi `server/src/config.js` lắng nghe mặc định cổng `5000`.
   - *Tác động:* Người dùng mở app qua Live Server cổng 5500 sẽ nhận ngay thông báo lỗi mạng không kết nối được máy chủ.
   - *Giải pháp:* Đổi dòng 1 của `frontend/js/config.js` thành `http://localhost:5000/api` (hoặc cấu hình `.env` cổng 5001).
2. **BUG-02 & BUG-03: Thiếu giao diện Seller Center và Admin Console (P1 — High):**
   - *Nguyên nhân:* Menu người dùng trong `frontend/js/shopping.js#L84-L88` gắn cờ `comingSoon` hiển thị toast "Tính năng đang phát triển" cho cả seller và admin.
   - *Tác động:* 35 API backend của seller và admin bị cô lập, không thể vận hành qua giao diện web.
   - *Giải pháp:* Tạo `frontend/seller.html` (`js/seller.js`) và `frontend/admin.html` (`js/admin.js`), gọi trực tiếp các API sẵn có.
3. **BUG-04: Thiếu binary trình duyệt Playwright Chromium (P1 — High):**
   - *Nguyên nhân:* Môi trường Windows cục bộ chưa tải binary `chrome-headless-shell-win64`.
   - *Tác động:* Lệnh `npm run test:cskh:ui` bị dừng (BLOCKED) với mã lỗi 1.
   - *Giải pháp:* Chạy `npx playwright install chromium` trong môi trường dev.
4. **BUG-05: Cổng thanh toán Online là mô phỏng (P1 — High):**
   - *Nguyên nhân:* Chưa kết nối SDK cổng thanh toán ngân hàng, hàm `payGroup` sinh mã `SIM...` nội bộ.
   - *Giải pháp:* Tích hợp cổng thanh toán VNPAY Sandbox thật kèm chữ ký SHA-512 và IPN webhook.
5. **SEC-01 & SEC-02: Thiếu Rate Limiting và Helmet Headers (P2 — Medium):**
   - *Nguyên nhân:* `server/src/app.js` chưa cài đặt `express-rate-limit` và `helmet`.
   - *Rủi ro:* Kẻ tấn công có thể spam thử mật khẩu tại `/api/auth/login` hoặc tấn công Clickjacking.
   - *Giải pháp:* Cài đặt `helmet` và `express-rate-limit`, tích hợp trực tiếp vào Express pipeline.
6. **SEC-03: Đổi mật khẩu không thu hồi phiên JWT cũ (P2 — Medium):**
   - *Nguyên nhân:* Token JWT là stateless không có blacklist, đổi mật khẩu không làm mất hiệu lực token đã cấp trước đó.
   - *Giải pháp:* Bổ sung trường `tokenVersion` hoặc `passwordChangedAt` vào `User` schema và kiểm tra trong middleware `auth.js`.

---

# PHẦN X — TEST & BUILD RESULTS

### 10.1. Tổng hợp kết quả thực thi 416 bài kiểm tra tự động

```text
========================================================================================
BỘ KIỂM THỬ                     | PHẠM VI KIỂM ĐỊNH              | KẾT QUẢ THỰC TẾ
================================+================================+======================
1. npm run test:local           | Smoke Test tích hợp toàn sàn   | 127 / 127 PASS (100%)
2. npm run test:cskh            | Nghiệp vụ CSKH & 27 Tranh chấp | 101 / 101 PASS (100%)
3. npm run test:cskh:extended   | Phân quyền & Chống Injection   | 188 / 188 PASS (100%)
4. npm run test:cskh:ui         | Kiểm thử Giao diện Playwright  | 16 nhóm BLOCKED
5. node --check (37 files JS)   | Kiểm tra cú pháp tĩnh Node.js  | 37 / 37 PASS (0 lỗi)
========================================================================================
TỔNG SỐ BÀI KIỂM TRA ĐẠT: 416 / 416 TESTS (TỶ LỆ PASS BACKEND ĐẠT TUYỆT ĐỐI 100%)
========================================================================================
```

---

### 10.2. Chi tiết kết quả từng lệnh kiểm thử và kiểm tra cú pháp

1. **`npm run test:local` (Thời gian: ~7 giây):**
   - Khởi tạo MongoDB ảo trong RAM bằng `MongoMemoryServer`.
   - Kiểm tra thành công: Khởi tạo admin, danh mục, thương hiệu, đăng ký khách hàng, đăng ký người bán, quản lý sản phẩm và biến thể, xem/tìm/lọc catalog, giỏ hàng đa gian hàng, checkout tách đơn theo shop, xử lý đơn hàng, tích điểm thưởng, đổi điểm lấy voucher, hủy đơn, hoàn tiền, khiếu nại 3 cấp (Khách -> CSKH -> Admin), xóa đánh giá, cơ chế tự động hoàn tất đơn sau 3 ngày, khóa tài khoản, phân quyền role.
   - **Đặc biệt:** Xác minh thành công bài kiểm tra chống bán quá số lượng (overselling) khi nhiều luồng cùng tranh mua món hàng cuối cùng.
2. **`npm run test:cskh` (Thời gian: ~3 giây):**
   - Kiểm tra 101 tình huống nghiệp vụ CSKH. Bảo vệ thành công 100% cho 27 tình huống tranh chấp tiếp nhận đơn đồng thời giữa 2 nhân viên CSKH thông qua cơ chế khóa Mutex độc quyền `assignedTo`.
3. **`npm run test:cskh:extended` (Thời gian: ~5 giây):**
   - Kiểm tra 188 tình huống phân quyền và dữ liệu biên. Xác minh khả năng chống tấn công Prototype Pollution (`__proto__`, `constructor`, `toString`), chống NoSQL Injection bằng Zod parser và bảo vệ tính toàn vẹn khi nhiều nhân viên cùng xóa đánh giá vi phạm đồng thời.
4. **Kiểm tra Cú pháp Tĩnh (`node --check`):**
   - Quét qua toàn bộ 37 tệp tin `.js` của dự án (17 tệp backend trong `server/src/` và 20 tệp frontend trong `frontend/js/`). Kết quả: **100% cú pháp hợp lệ, 0 lỗi cú pháp**.

---

### 10.3. Giải trình trường hợp BLOCKED của Playwright UI Test
- Khi chạy `npm run test:cskh:ui`, kịch bản ném lỗi:
  ```text
  browserType.launch: Executable doesn't exist at C:\Users\ROG Strix\AppData\Local\ms-playwright\chromium_headless_shell-1255\chrome-headless-shell-win64\chrome-headless-shell.exe
  ```
- Kịch bản bị dừng (**BLOCKED**) do thiếu file thực thi binary Chromium headless trên máy Windows cục bộ. Tuân thủ nghiêm ngặt nguyên tắc an toàn audit, chúng tôi không tự ý cài đặt thêm phần mềm vào máy của người dùng.

---

# PHẦN XI — PROJECT COMPLETION ROADMAP

### 11.1. Lộ trình 5 giai đoạn hoàn thiện sản phẩm

```
Giai đoạn 1: Đồng bộ Cấu hình & Bảo mật Cơ sở (1 - 2 ngày)
├── Sửa lỗi lệch cổng trong frontend/js/config.js thành http://localhost:5000/api
├── Bổ sung express-rate-limit và helmet vào server/src/app.js
└── Tải binary Playwright (npx playwright install chromium) để mở khóa test UI

Giai đoạn 2: Xây dựng Giao diện Seller Center (4 - 6 ngày)
├── Tạo frontend/seller.html và frontend/js/seller.js
├── Tab 1: Hồ sơ gian hàng & Duyệt nhân viên shop
├── Tab 2: Quản lý sản phẩm, biến thể SKU, thư viện ảnh
├── Tab 3: Quản lý tồn kho theo biến thể
├── Tab 4: Quản lý đơn hàng (Xác nhận đơn, chuyển trạng thái giao hàng)
├── Tab 5: Xử lý yêu cầu đổi trả / hoàn tiền
├── Tab 6: Quản lý voucher riêng của shop
├── Tab 7: Phản hồi đánh giá của khách hàng
└── Tab 8: Báo cáo doanh thu thực nhận

Giai đoạn 3: Xây dựng Giao diện Admin Console (3 - 5 ngày)
├── Tạo frontend/admin.html và frontend/js/admin.js
├── Tab 1: Thống kê GMV toàn sàn & Xếp hạng doanh thu shop
├── Tab 2: Phê duyệt gian hàng mới, từ chối (kèm lý do), khóa shop
├── Tab 3: Quản trị tài khoản CSKH (tạo mới, khóa, xóa mềm)
├── Tab 4: Quản trị danh mục cha-con và thương hiệu
├── Tab 5: Phát hành voucher sàn (miễn phí hoặc đổi điểm)
├── Tab 6: Giám sát toàn bộ đơn hàng trên sàn
└── Tab 7: Xử lý khiếu nại chuyển từ CSKH kèm quyền cưỡng chế hoàn tiền (forceRefund)

Giai đoạn 4: Tích hợp Thanh toán Thật & Cloud Storage (3 - 4 ngày)
├── Tích hợp Cổng thanh toán VNPAY Sandbox (URL ký SHA-512 + IPN webhook)
└── Chuyển đổi Multer local disk sang Cloudinary / AWS S3 Storage

Giai đoạn 5: Tính năng Mở rộng (Giai đoạn sau)
├── Chat thời gian thực Socket.IO giữa khách hàng và gian hàng
├── Xây dựng ứng dụng Mobile (React Native / Expo)
└── Tích hợp tính phí vận chuyển động theo khoảng cách GPS (GHTK/GHN)
```

---

### 11.2. Tiêu chí nghiệm thu chi tiết cho từng giai đoạn
- **Nghiệm thu Giai đoạn 1:** Khởi động backend và mở frontend Live Server kết nối thành công ngay lập tức không có thông báo lỗi mạng; test UI Playwright chạy đạt 16/16 nhóm kịch bản.
- **Nghiệm thu Giai đoạn 2:** Chủ shop tự đăng nhập -> duyệt nhân viên shop -> đăng sản phẩm -> nhận đơn hàng của khách -> xác nhận giao hàng -> duyệt hoàn tiền hoàn toàn trên trình duyệt web.
- **Nghiệm thu Giai đoạn 3:** Quản trị viên tự đăng nhập -> duyệt gian hàng mới -> tạo tài khoản CSKH -> tạo voucher sàn -> giải quyết khiếu nại cưỡng chế hoàn tiền hoàn toàn trên trình duyệt web.
- **Nghiệm thu Giai đoạn 4:** Khách chọn thanh toán Online được chuyển sang cổng thanh toán VNPAY Sandbox, nhập thẻ thử nghiệm thành công và đơn hàng tự động cập nhật `paid` qua IPN webhook.

---

# PHẦN XII — AI HANDOVER GUIDE FOR DEEPSEEK

### 12.1. Cẩm nang bàn giao 12 mục chỉ dẫn trực tiếp

1. **Đường dẫn dự án:** `C:\Project\Ung_dung_thuong_mai`.
2. **Kiến trúc thực tế:** Node.js Express 4.22 + Mongoose 8.24 (ES Modules native) và Pure Vanilla HTML5/CSS3/JavaScript ES Modules (không dùng React, Next.js hay Vite).
3. **Cấu trúc thư mục cốt lõi:** `frontend/` (giao diện), `server/src/` (backend API), `docs/` (tài liệu nghiệp vụ & báo cáo audit).
4. **Top 6 tệp bắt buộc phải đọc trước:** `docs/NGHIEP-VU.md`, `requiment.md`, `server/src/models/*`, `server/src/services/orderService.js`, `frontend/js/api.js`, `docs/audit/EXISTING_IMPLEMENTATION_INDEX.md`.
5. **Tính năng đã hoạt động vững chắc:** Toàn bộ Storefront Khách hàng và Bàn làm việc CSKH.
6. **Tính năng còn thiếu cần làm tiếp:** Giao diện Seller Center (`seller.html`), Giao diện Admin Console (`admin.html`), Helmet & Rate-limiting.
7. **Tệp đảm nhiệm từng chức năng:** Tra cứu chi tiết tại Bảng tra cứu ở Phần V của tài liệu này.
8. **Quy tắc bất biến chống tạo trùng:** Xem mục 12.2 dưới đây.
9. **Quy ước đặt tên (Conventions):**
   - Dùng cú pháp ES Modules (`import/export`, bắt buộc có đuôi `.js` trong relative import).
   - Biến & hàm: `camelCase`. Model Mongoose: `PascalCase`. Enum trạng thái: `snake_case` (ví dụ `cho_xac_nhan`, `da_giao`, `hoan_tat`).
   - Xử lý lỗi backend: Bọc controller bằng `asyncHandler`, ném lỗi qua `throw new AppError('Nội dung', status)`.
   - Kiểm tra dữ liệu: Sử dụng `parse(zodSchema, req.body)` hoặc `req.query`.
10. **Lệnh thực thi môi trường dev:**
    - Khởi động backend: `cd server && npm install && npm run seed:demo && npm run dev`
    - Phục vụ frontend: `npx serve -l 5500 frontend` (truy cập `http://127.0.0.1:5500/index.html`)
    - Chạy test an toàn: `cd server && npm run test:local` (hoặc `npm run test:cskh`, `npm run test:cskh:extended`)
11. **Mẫu cấu hình môi trường an toàn (`server/.env`):**
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_electronics
    JWT_SECRET=dev-secret-change-me-before-production
    JWT_EXPIRES=7d
    CLIENT_ORIGIN=http://127.0.0.1:5500,http://localhost:5500
    NODE_ENV=development
    ```
12. **Tài khoản demo sẵn sàng để thử nghiệm:**
    - Admin: `admin@shop.local` / `Admin@123`
    - CSKH: `cskh@shop.local` / `Cskh@123` (Đăng nhập tại `auth.html?tab=staff`)
    - Chủ gian hàng: `owner@shop.local` / `Owner@123`
    - Khách hàng: `khach@shop.local` / `Khach@123`

---

### 12.2. Quy tắc bắt buộc khi AI tiếp quản dự án

> [!CAUTION]
> **8 NGUYÊN TẮC BẤT BIẾN DÀNH CHO DEEPSEEK VÀ CÁC AI TIẾP QUẢN:**
> 1. **KHÔNG TẠO LẠI DỰ ÁN TỪ ĐẦU:** Dự án đã có khung sườn backend và frontend rất hoàn chỉnh. Tuyệt đối không xóa đi xây dựng lại hay cài đặt framework khác.
> 2. **KHÔNG TẠO TỆP TRÙNG CHỨC NĂNG:** Trước khi viết code hoặc tạo tệp mới, **bắt buộc phải tra cứu** `PHẦN II — COMPLETE PROJECT FILE TREE`, `PHẦN III — COMPLETE FILE CATALOG` và `PHẦN V — EXISTING IMPLEMENTATION INDEX`.
> 3. **TẬN DỤNG VÀ MỞ RỘNG MÃ NGUỒN CÓ SẴN:** Khi làm phân hệ Seller và Admin, tái sử dụng 100% các API sẵn có tại `server/src/routes/seller.js` và `server/src/routes/admin.js`. Tuyệt đối không viết thêm router hay controller thừa thãi.
> 4. **KHÔNG TẠO MODEL RỜI:** Tồn kho nằm ở `Variant.stock`, địa chỉ nhúng trong `User.addresses`, snapshot địa chỉ nằm ở `Order.shippingAddress`. Không tự ý tạo bảng `Inventory`, `Address` hay `OrderItem`.
> 5. **KHÔNG XÓA CHỨC NĂNG ĐANG HOẠT ĐỘNG:** Phân hệ Khách hàng và CSKH đang hoạt động hoàn hảo và có 416 bài test bảo vệ. Bất kỳ sự sửa đổi nào làm hỏng các bài test này đều bị coi là phá vỡ hệ thống.
> 6. **KHÔNG THAY ĐỔI CƠ CHẾ TRỪ KHO VÀ AUTH:** Giữ nguyên cơ chế trừ kho nguyên tử `$inc: -quantity` có điều kiện `{ stock: { $gte: quantity } }` trong `orderService.js` và cơ chế nạp lại user từ DB trong `middleware/auth.js`.
> 7. **MỌI THAY ĐỔI PHẢI CHẠY LẠI TEST:** Sau khi sửa đổi backend, bắt buộc phải chạy `npm run test:local`, `npm run test:cskh`, `npm run test:cskh:extended` để bảo đảm không xảy ra lỗi hồi quy.
> 8. **ƯU TIÊN SOURCE CODE TRÊN HẾT:** Nếu có bất kỳ sự khác biệt nào giữa tài liệu mô tả và mã nguồn thực tế, **luôn kiểm tra và đối soát mã nguồn thực tế trước khi hành động**.
