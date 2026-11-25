import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PRODUCTS = [
  // =========================================================================
  // NHÓM A: ĐIỆN THOẠI THÔNG MINH – SMARTPHONES (28 SẢN PHẨM)
  // =========================================================================
  {
    name: 'iPhone 16 Pro Max 256GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'iPhone 16 Pro Max trang bị chip Apple A18 Pro mạnh mẽ vượt trội trên tiến trình 3nm, nút Điều khiển Camera (Camera Control) hoàn toàn mới, khung viền Titan cấp 5 siêu bền và màn hình Super Retina XDR 6.9 inch viền mỏng kỷ lục.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1450,
    ratingAvg: 4.9,
    ratingCount: 382,
    variants: [
      ['Titan Sa Mạc / 256GB', 34490000, 45, 'IP16PM-256-DES'],
      ['Titan Tự Nhiên / 256GB', 34490000, 38, 'IP16PM-256-NAT'],
      ['Titan Đen / 512GB', 39990000, 20, 'IP16PM-512-BLK'],
      ['Titan Trắng / 1TB', 45990000, 12, 'IP16PM-1TB-WHT']
    ]
  },
  {
    name: 'iPhone 16 Pro 128GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'iPhone 16 Pro sở hữu màn hình ProMotion 120Hz 6.3 inch, chip A18 Pro hỗ trợ Apple Intelligence toàn diện, cụm 3 camera 48MP Fusion cùng khả năng quay video 4K 120 fps chuẩn điện ảnh.',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 920,
    ratingAvg: 4.8,
    ratingCount: 215,
    variants: [
      ['Titan Tự Nhiên / 128GB', 27990000, 30, 'IP16P-128-NAT'],
      ['Titan Sa Mạc / 256GB', 30990000, 25, 'IP16P-256-DES'],
      ['Titan Đen / 256GB', 30990000, 20, 'IP16P-256-BLK']
    ]
  },
  {
    name: 'iPhone 16 128GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'iPhone 16 với nút Tác Vụ (Action Button) và Camera Control mới mẻ, chip A18 tốc độ cao, camera kép xếp dọc hỗ trợ quay Video Không Gian (Spatial Video) tương thích kính Apple Vision Pro.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1100,
    ratingAvg: 4.8,
    ratingCount: 260,
    variants: [
      ['Xanh Lưu Ly / 128GB', 21990000, 50, 'IP16-128-BLU'],
      ['Hồng / 128GB', 21990000, 40, 'IP16-128-PNK'],
      ['Đen / 256GB', 24990000, 30, 'IP16-256-BLK']
    ]
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Flagship Titan đẳng cấp của Apple với cổng sạc Type-C USB 3.0 tốc độ cao, chip A17 Pro chơi game Ray Tracing đỉnh chóp, ống kính tele tiềm vọng zoom quang học 5x sắc nét.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2850,
    ratingAvg: 4.9,
    ratingCount: 640,
    variants: [
      ['Titan Tự Nhiên / 256GB', 28990000, 25, 'IP15PM-256-NAT'],
      ['Titan Xanh / 256GB', 28490000, 18, 'IP15PM-256-BLU'],
      ['Titan Đen / 512GB', 33990000, 15, 'IP15PM-512-BLK']
    ]
  },
  {
    name: 'iPhone 15 128GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế mặt lưng kính pha màu mờ sang trọng, màn hình Dynamic Island tiện ích thông minh, camera chính 48MP chụp ảnh chân dung thế hệ mới siêu rõ nét.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 3200,
    ratingAvg: 4.8,
    ratingCount: 710,
    variants: [
      ['Đen / 128GB', 19490000, 30, 'IP15-128-BLK'],
      ['Xanh Lá / 128GB', 19490000, 22, 'IP15-128-GRN'],
      ['Đen / 256GB', 22490000, 15, 'IP15-256-BLK']
    ]
  },
  {
    name: 'iPhone 14 128GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Sở hữu chip A15 Bionic 5 nhân GPU mạnh mẽ, camera kép nâng cấp chụp đêm thiếu sáng ấn tượng, thời lượng pin cả ngày dài và hỗ trợ sạc MagSafe tiện lợi.',
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1890,
    ratingAvg: 4.7,
    ratingCount: 420,
    variants: [
      ['Đen Midnight / 128GB', 16290000, 35, 'IP14-128-MID'],
      ['Trắng Starlight / 128GB', 16290000, 28, 'IP14-128-STA']
    ]
  },
  {
    name: 'iPhone 13 128GB',
    category: 'Điện thoại',
    brand: 'Apple',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Mẫu iPhone quốc dân phân khúc cận cao cấp với camera chéo đặc trưng, màn hình OLED Super Retina XDR sắc nét, chip A15 mượt mà cân tốt mọi tác vụ.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 4100,
    ratingAvg: 4.8,
    ratingCount: 950,
    variants: [
      ['Đen / 128GB', 13290000, 60, 'IP13-128-BLK'],
      ['Hồng / 128GB', 13490000, 45, 'IP13-128-PNK'],
      ['Xanh Dương / 128GB', 13290000, 30, 'IP13-128-BLU']
    ]
  },
  {
    name: 'Samsung Galaxy S25 Ultra 256GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Đỉnh cao trí tuệ nhân tạo Galaxy AI thế hệ mới với vi xử lý Snapdragon 8 Elite for Galaxy, bút S-Pen tích hợp, khung viền Titan bo cong nhẹ tay và cảm biến 200MP dẫn đầu thị trường.',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 880,
    ratingAvg: 4.9,
    ratingCount: 198,
    variants: [
      ['Xám Titan / 256GB', 31990000, 40, 'SS-S25U-256-GRY'],
      ['Đen Titan / 256GB', 31990000, 35, 'SS-S25U-256-BLK'],
      ['Bạc Titan / 512GB', 36990000, 20, 'SS-S25U-512-SLV']
    ]
  },
  {
    name: 'Samsung Galaxy S25+ 256GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Màn hình Dynamic AMOLED 2X 6.7 inch Quad HD+ siêu sáng, thiết kế tinh tế vuông vức, pin 4900mAh hỗ trợ sạc nhanh 45W và hỗ trợ nâng cấp phần mềm 7 năm.',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 540,
    ratingAvg: 4.8,
    ratingCount: 112,
    variants: [
      ['Xanh Lam / 256GB', 25490000, 25, 'SS-S25P-256-BLU'],
      ['Đen Midnight / 256GB', 25490000, 30, 'SS-S25P-256-BLK']
    ]
  },
  {
    name: 'Samsung Galaxy S25 128GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế nhỏ gọn 6.2 inch hoàn hảo trong lòng bàn tay, sức mạnh phần cứng Snapdragon 8 Elite đỉnh cao, công nghệ tản nhiệt buồng hơi cải tiến vượt bậc.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 680,
    ratingAvg: 4.7,
    ratingCount: 145,
    variants: [
      ['Xanh Lục Bảo / 128GB', 20990000, 35, 'SS-S25-128-GRN'],
      ['Vàng Ánh Dương / 256GB', 23490000, 20, 'SS-S25-256-GLD']
    ]
  },
  {
    name: 'Galaxy S24 Ultra 256GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Quyền năng Galaxy AI đỉnh cao với tính năng Khoanh vùng tìm kiếm (Circle to Search), dịch trực tiếp cuộc gọi hai chiều, camera mắt thần bóng đêm 200MP và màn hình Corning Gorilla Armor chống lóa số 1.',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 2200,
    ratingAvg: 4.9,
    ratingCount: 520,
    variants: [
      ['Xám titan / 256GB', 26990000, 30, 'SS-S24U-256-GRY'],
      ['Vàng titan / 512GB', 30990000, 15, 'SS-S24U-512-GLD']
    ]
  },
  {
    name: 'Samsung Galaxy S24 FE 128GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Phiên bản Fan Edition chuẩn mực mang trọn vẹn trải nghiệm Galaxy AI cao cấp đến mức giá dễ tiếp cận, màn hình 6.7 inch 120Hz mượt mà và camera chuẩn flagship.',
    images: [
      'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 790,
    ratingAvg: 4.7,
    ratingCount: 165,
    variants: [
      ['Xanh Mint / 128GB', 14990000, 40, 'SS-S24FE-128-MNT'],
      ['Xám Graphite / 256GB', 16990000, 25, 'SS-S24FE-256-GRP']
    ]
  },
  {
    name: 'Samsung Galaxy Z Fold6 256GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Tuyệt tác điện thoại gập mỏng nhẹ nhất dòng Fold, bản lề rãnh kép bền bỉ, tích hợp trợ lý Note AI tóm tắt văn bản và phác họa thông minh (Sketch to Image).',
    images: [
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 610,
    ratingAvg: 4.8,
    ratingCount: 130,
    variants: [
      ['Xám Metal / 256GB', 39990000, 15, 'SS-ZFOLD6-256-SLV'],
      ['Xanh Navy / 512GB', 44990000, 10, 'SS-ZFOLD6-512-NVY']
    ]
  },
  {
    name: 'Samsung Galaxy Z Flip6 256GB',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Biểu tượng thời trang gập vỏ sò với camera 50MP nâng cấp, FlexWindow thông minh cá nhân hóa cao, tản nhiệt buồng hơi Vapor Chamber lần đầu tiên xuất hiện trên Z Flip.',
    images: [
      'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 950,
    ratingAvg: 4.8,
    ratingCount: 210,
    variants: [
      ['Xanh Maya / 256GB', 23990000, 25, 'SS-ZFLIP6-256-BLU'],
      ['Vàng Solar / 256GB', 23990000, 20, 'SS-ZFLIP6-256-YEL']
    ]
  },
  {
    name: 'Samsung Galaxy A56 5G',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Vua phân khúc tầm trung với mặt lưng kính Gorilla Glass Victus+, camera OIS 50MP chống rung quang học, kháng nước chuẩn IP67 và pin 5000mAh bền bỉ 2 ngày.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1800,
    ratingAvg: 4.7,
    ratingCount: 390,
    variants: [
      ['Xanh Iceblue / 8GB-128GB', 9490000, 60, 'SS-A56-128-BLU'],
      ['Đen Awesome / 8GB-256GB', 10490000, 45, 'SS-A56-256-BLK']
    ]
  },
  {
    name: 'Samsung Galaxy A35 5G',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Thiết kế viền nổi Key Island hiện đại, màn hình Super AMOLED 120Hz rực rỡ, trang bị bảo mật phần cứng Samsung Knox Vault chuẩn quốc tế.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2100,
    ratingAvg: 4.6,
    ratingCount: 450,
    variants: [
      ['Xanh Navy / 8GB-128GB', 7490000, 70, 'SS-A35-128-NVY'],
      ['Vàng Lemon / 8GB-128GB', 7490000, 50, 'SS-A35-128-YEL']
    ]
  },
  {
    name: 'Samsung Galaxy A16 4G',
    category: 'Điện thoại',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Smartphone giá mềm hỗ trợ tới 6 phiên bản cập nhật hệ điều hành, màn hình lớn 6.7 inch FHD+ Super AMOLED 90Hz và pin trâu 5000mAh.',
    images: [
      'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2600,
    ratingAvg: 4.6,
    ratingCount: 510,
    variants: [
      ['Đen / 4GB-128GB', 3890000, 80, 'SS-A16-128-BLK'],
      ['Xanh Dương / 6GB-128GB', 4390000, 60, 'SS-A16-6GB-BLU']
    ]
  },
  {
    name: 'Xiaomi 15 Pro 512GB',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Hệ thống ống kính quang học Leica Summilux đỉnh cao, chip Snapdragon 8 Elite tiến trình 3nm, pin khủng 6100mAh công nghệ Silicon-Carbon và sạc siêu nhanh 90W.',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 420,
    ratingAvg: 4.9,
    ratingCount: 95,
    variants: [
      ['Xám Đá / 16GB-512GB', 21990000, 20, 'MI-15P-512-GRY'],
      ['Bạc Titan / 16GB-512GB', 22490000, 15, 'MI-15P-512-SLV']
    ]
  },
  {
    name: 'Xiaomi 14T Pro 256GB',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Chụp đêm điện ảnh cùng ống kính Leica 50MP Light Fusion 900, vi xử lý Dimensity 9300+ xung nhịp 3.4GHz, sạc không dây 50W và sạc có dây HyperCharge 120W.',
    images: [
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.8,
    ratingCount: 205,
    variants: [
      ['Xám Titan / 12GB-256GB', 14990000, 35, 'MI-14TP-256-GRY'],
      ['Đen Titan / 12GB-512GB', 16490000, 25, 'MI-14TP-512-BLK']
    ]
  },
  {
    name: 'Redmi Note 14 Pro+ 5G',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Màn hình cong 1.5K AMOLED 120Hz độ sáng 3000 nits, camera chính 200MP chống rung OIS, chuẩn kháng nước IP68/IP69K và viên pin siêu bền 6200mAh.',
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.8,
    ratingCount: 370,
    variants: [
      ['Tím Khói / 12GB-256GB', 8990000, 50, 'RD-N14P-256-PUR'],
      ['Xanh Rừng Trúc / 12GB-512GB', 9990000, 35, 'RD-N14P-512-GRN']
    ]
  },
  {
    name: 'Redmi Note 13 128GB',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Chiếc smartphone bán chạy nhất phân khúc dưới 5 triệu đồng, màn hình viền siêu mỏng AMOLED 120Hz, camera 108MP sắc nét và sạc nhanh 33W.',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3800,
    ratingAvg: 4.7,
    ratingCount: 840,
    variants: [
      ['Đen Midnight / 6GB-128GB', 4390000, 80, 'RD-N13-128-BLK'],
      ['Xanh Băng Tuyết / 8GB-128GB', 4790000, 65, 'RD-N13-8GB-BLU']
    ]
  },
  {
    name: 'POCO X7 Pro 5G',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'GearVN Pro Gaming',
    description: 'Quái vật hiệu năng gaming tầm trung với chip Dimensity 8400 Ultra, công nghệ tản nhiệt LiquidCool 4.0 buồng hơi kép, màn hình 144Hz siêu nhạy cảm ứng.',
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1200,
    ratingAvg: 4.8,
    ratingCount: 290,
    variants: [
      ['Vàng POCO / 8GB-256GB', 8490000, 45, 'POCO-X7P-256-YEL'],
      ['Đen / 12GB-256GB', 9290000, 35, 'POCO-X7P-256-BLK']
    ]
  },
  {
    name: 'POCO F6 Pro 512GB',
    category: 'Điện thoại',
    brand: 'Xiaomi',
    shopName: 'GearVN Pro Gaming',
    description: 'Flagship Killer trang bị chip Snapdragon 8 Gen 2, màn hình 2K WQHD+ 120Hz 4000 nits, công nghệ sạc thần tốc 120W nạp đầy pin chỉ trong 19 phút.',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 950,
    ratingAvg: 4.8,
    ratingCount: 230,
    variants: [
      ['Trắng Ngọc / 12GB-512GB', 12990000, 30, 'POCO-F6P-512-WHT'],
      ['Đen Nhám / 16GB-1TB', 14990000, 15, 'POCO-F6P-1TB-BLK']
    ]
  },
  {
    name: 'OPPO Find X8 Pro 5G',
    category: 'Điện thoại',
    brand: 'OPPO',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Hệ thống camera chân dung kép tiềm vọng Hasselblad huyền thoại, chip Dimensity 9400 tiến trình 3nm, nút bấm chụp ảnh Quick Button và pin Glacier Battery 5910mAh.',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 410,
    ratingAvg: 4.9,
    ratingCount: 88,
    variants: [
      ['Trắng Ngọc Trai / 16GB-512GB', 27990000, 20, 'OP-FX8P-512-WHT'],
      ['Đen Không Gian / 16GB-512GB', 27990000, 18, 'OP-FX8P-512-BLK']
    ]
  },
  {
    name: 'OPPO Reno13 Pro 5G',
    category: 'Điện thoại',
    brand: 'OPPO',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Thiết kế cánh bướm siêu thực mỏng nhẹ, camera tele tiềm vọng 50MP chuyên trị chân dung, hỗ trợ Live Photo mượt mà như iPhone và pin 5800mAh bền bỉ 5 năm.',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 760,
    ratingAvg: 4.7,
    ratingCount: 175,
    variants: [
      ['Tím Bướm Đêm / 12GB-256GB', 14990000, 35, 'OP-R13P-256-PUR'],
      ['Hồng Pastel / 12GB-512GB', 16490000, 25, 'OP-R13P-512-PNK']
    ]
  },
  {
    name: 'vivo X200 Pro 5G',
    category: 'Điện thoại',
    brand: 'vivo',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Camera tele ZEISS APO 200MP định nghĩa lại nhiếp ảnh di động, cảm biến Sony LYT-818 1/1.28 inch thế hệ mới, chip MediaTek Dimensity 9400 và chip hình ảnh V3+.',
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 380,
    ratingAvg: 4.9,
    ratingCount: 82,
    variants: [
      ['Xanh Titan Tự Nhiên / 16GB-512GB', 24990000, 20, 'VIVO-X200P-512-BLU'],
      ['Đen Carbon / 16GB-1TB', 28990000, 10, 'VIVO-X200P-1TB-BLK']
    ]
  },
  {
    name: 'realme GT 7 Pro',
    category: 'Điện thoại',
    brand: 'realme',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Sức mạnh quái thú Snapdragon 8 Elite với mức giá cực kỳ cạnh tranh, màn hình Eco² OLED Plus siêu tiết kiệm điện, pin Titan khủng 6500mAh và sạc nhanh 120W.',
    images: [
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 520,
    ratingAvg: 4.8,
    ratingCount: 110,
    variants: [
      ['Cam Sao Hỏa / 12GB-256GB', 14990000, 25, 'RM-GT7P-256-ORG'],
      ['Xám Thiên Thạch / 16GB-512GB', 16990000, 20, 'RM-GT7P-512-GRY']
    ]
  },
  {
    name: 'Google Pixel 9 Pro XL 128GB',
    category: 'Điện thoại',
    brand: 'Google',
    shopName: 'TechZone Flagship Store',
    description: 'Nhiếp ảnh chân thực số 1 thế giới với chip Google Tensor G4 tối ưu riêng cho AI, tính năng Add Me thần kỳ, màn hình Super Actua Display 3000 nits sáng nhất hiện nay.',
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 390,
    ratingAvg: 4.8,
    ratingCount: 92,
    variants: [
      ['Trắng Sứ (Porcelain) / 128GB', 26990000, 15, 'PIX9PXL-128-WHT'],
      ['Đen Thạch Anh (Obsidian) / 256GB', 29490000, 18, 'PIX9PXL-256-BLK']
    ]
  },

  // =========================================================================
  // NHÓM B: LAPTOP VÀ MÁY TÍNH – COMPUTERS (28 SẢN PHẨM)
  // =========================================================================
  {
    name: 'MacBook Pro 16 inch M4 Pro',
    category: 'Laptop',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Máy trạm di động tối thượng dành cho lập trình viên và sáng tạo chuyên nghiệp. Chip Apple M4 Pro 14 nhân CPU, 20 nhân GPU, màn hình Liquid Retina XDR độ sáng 1600 nits kèm tùy chọn phủ Nano-texture chống chói.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 310,
    ratingAvg: 5.0,
    ratingCount: 84,
    variants: [
      ['Đen Không Gian / 24GB-512GB', 64990000, 15, 'MBP16-M4P-24-512'],
      ['Bạc / 48GB-1TB', 84990000, 8, 'MBP16-M4P-48-1TB']
    ]
  },
  {
    name: 'MacBook Pro 14 inch M4',
    category: 'Laptop',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Hiệu năng bứt phá trong thân máy 14 inch gọn nhẹ. Chip M4 thế hệ mới với RAM mặc định nâng lên 16GB, 3 cổng Thunderbolt 4 kết nối 2 màn hình ngoài cùng thời lượng pin kỷ lục 24 giờ.',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 520,
    ratingAvg: 4.9,
    ratingCount: 135,
    variants: [
      ['Đen Không Gian / 16GB-512GB', 39990000, 25, 'MBP14-M4-16-512'],
      ['Bạc / 24GB-1TB', 49990000, 15, 'MBP14-M4-24-1TB']
    ]
  },
  {
    name: 'MacBook Air 15 inch M3',
    category: 'Laptop',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Mỏng chỉ 11.5mm với màn hình lớn 15.3 inch Liquid Retina sống động. Chip Apple M3 hỗ trợ đồ họa dò tia Ray Tracing tốc độ cao, hoạt động êm ái hoàn toàn không cần quạt tản nhiệt.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 840,
    ratingAvg: 4.8,
    ratingCount: 210,
    variants: [
      ['Midnight / 16GB-256GB', 32990000, 30, 'MBA15-M3-16-256'],
      ['Starlight / 16GB-512GB', 37990000, 20, 'MBA15-M3-16-512']
    ]
  },
  {
    name: 'MacBook Air 13 inch M3',
    category: 'Laptop',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Laptop siêu mỏng nhẹ phổ biến nhất thế giới. Trọng lượng chỉ 1.24kg, cấu hình nâng cấp RAM tiêu chuẩn 16GB, tốc độ Wi-Fi 6E nhanh gấp đôi và pin 18 tiếng liên tục.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1420,
    ratingAvg: 4.9,
    ratingCount: 360,
    variants: [
      ['Bạc Silver / 16GB-256GB', 26990000, 40, 'MBA13-M3-16-256'],
      ['Xám Space Gray / 16GB-512GB', 31990000, 25, 'MBA13-M3-16-512']
    ]
  },
  {
    name: 'MacBook Air 13 inch M2',
    category: 'Laptop',
    brand: 'Apple',
    shopName: 'An Phát Computer',
    description: 'Thiết kế vuông vức thời thượng với cổng sạc MagSafe 3 tiện lợi, chip Apple M2 mượt mà cân tốt chỉnh sửa ảnh Photoshop, dựng video 4K và học tập văn phòng.',
    images: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2300,
    ratingAvg: 4.8,
    ratingCount: 580,
    variants: [
      ['Xám / 16GB-256GB', 22990000, 45, 'MBA13-M2-16-256'],
      ['Ánh Vàng / 16GB-512GB', 27990000, 20, 'MBA13-M2-16-512']
    ]
  },
  {
    name: 'ASUS ROG Strix SCAR 16',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Cỗ máy chiến game eSports chuyên nghiệp đầu bảng. Trang bị CPU Intel Core i9-14900HX, GPU NVIDIA GeForce RTX 4080 12GB, màn hình ROG Nebula HDR Mini LED 240Hz 2.5K rực rỡ.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 240,
    ratingAvg: 4.9,
    ratingCount: 65,
    variants: [
      ['i9-14900HX / RTX 4080 / 32GB / 1TB', 79990000, 8, 'ROG-SCAR16-4080'],
      ['i9-14900HX / RTX 4090 / 64GB / 2TB', 109990000, 5, 'ROG-SCAR16-4090']
    ]
  },
  {
    name: 'ASUS ROG Zephyrus G16',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Tuyệt phẩm laptop gaming mỏng nhẹ chế tác từ nhôm nguyên khối CNC. Màn hình ROG Nebula OLED 2.5K 240Hz đạt chuẩn VESA DisplayHDR True Black 500, vi xử lý Intel Core Ultra 9 tích hợp NPU AI.',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 390,
    ratingAvg: 4.9,
    ratingCount: 92,
    variants: [
      ['Xám Eclipse / Ultra 9 / RTX 4070 / 32GB / 1TB', 64990000, 12, 'ZEPH-G16-4070'],
      ['Trắng Platinum / Ultra 7 / RTX 4060 / 16GB / 1TB', 52990000, 15, 'ZEPH-G16-4060']
    ]
  },
  {
    name: 'Laptop ASUS TUF Gaming F15',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'TechZone Flagship Store',
    description: 'Độ bền chuẩn quân đội MIL-STD-810H, bàn phím tối ưu cụm phím WASD nổi bật, card đồ họa rời RTX 4050 hỗ trợ DLSS 3 mượt mà mọi tựa game AAA.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.7,
    ratingCount: 340,
    variants: [
      ['i5-12500H / 16GB / 512GB / RTX 3050', 18990000, 25, 'TUF-F15-3050'],
      ['i7-13620H / 16GB / 512GB / RTX 4050', 23990000, 18, 'TUF-F15-4050']
    ]
  },
  {
    name: 'ASUS TUF Gaming A15 R7',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Sức mạnh từ AMD Ryzen 7 7735HS 8 nhân 16 luồng, card đồ họa NVIDIA RTX 4060 8GB TGP 140W max công suất, màn hình 144Hz Adaptive-Sync chống xé hình.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 780,
    ratingAvg: 4.8,
    ratingCount: 175,
    variants: [
      ['R7-7735HS / RTX 4060 / 16GB / 512GB', 26490000, 22, 'TUF-A15-4060']
    ]
  },
  {
    name: 'ASUS ZenBook 14 OLED',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'An Phát Computer',
    description: 'Laptop doanh nhân cao cấp mỏng 14.9mm nặng 1.2kg, màn hình Lumina OLED 3K 120Hz chuẩn màu 100% DCI-P3, chip Intel Core Ultra 7 tích hợp trí tuệ nhân tạo AI Copilot.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 650,
    ratingAvg: 4.8,
    ratingCount: 140,
    variants: [
      ['Xanh Bàng Bạc / Ultra 7 / 32GB / 1TB', 32990000, 20, 'ZEN14-U7-32-1TB'],
      ['Xanh / Ultra 5 / 16GB / 512GB', 25990000, 25, 'ZEN14-U5-16-512']
    ]
  },
  {
    name: 'ASUS Vivobook 15 X1504',
    category: 'Laptop',
    brand: 'ASUS',
    shopName: 'An Phát Computer',
    description: 'Laptop học tập sinh viên giá mềm, màn hình 15.6 inch viền mỏng NanoEdge, bàn phím ErgoSense gõ êm ái, phủ lớp kháng khuẩn ASUS Antimicrobial Guard Plus độc quyền.',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1980,
    ratingAvg: 4.6,
    ratingCount: 410,
    variants: [
      ['i3-1215U / 8GB / 512GB', 10490000, 40, 'VIVO15-I3-8-512'],
      ['i5-1335U / 16GB / 512GB', 14490000, 30, 'VIVO15-I5-16-512']
    ]
  },
  {
    name: 'Lenovo Legion Pro 5 Gen 9',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'GearVN Pro Gaming',
    description: 'Chiến hạm gaming đẳng cấp với chip AMD Ryzen 7 7745HX, card đồ họa RTX 4070 8GB, chip AI Lenovo LA1 tối ưu hiệu năng theo thời gian thực và màn hình 240Hz 500 nits.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 450,
    ratingAvg: 4.9,
    ratingCount: 115,
    variants: [
      ['Xám Onyx / R7 / RTX 4070 / 32GB / 1TB', 46990000, 15, 'LEG-PRO5-4070'],
      ['Xám Onyx / i7 / RTX 4060 / 16GB / 512GB', 38990000, 20, 'LEG-PRO5-4060']
    ]
  },
  {
    name: 'Lenovo Legion Slim 5',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'GearVN Pro Gaming',
    description: 'Sự cân bằng lý tưởng giữa khả năng di động và sức mạnh đồ họa. Thiết kế mỏng chỉ 19.9mm, tản nhiệt ColdFront 5.0 êm ái, hỗ trợ sạc nhanh Super Rapid Charge 140W qua Type-C.',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 580,
    ratingAvg: 4.8,
    ratingCount: 130,
    variants: [
      ['Xám Bão / R7-8845HS / RTX 4060 / 16GB / 512GB', 34990000, 22, 'LEG-SLIM5-4060']
    ]
  },
  {
    name: 'Lenovo LOQ 15IAX9',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'An Phát Computer',
    description: 'Laptop gaming quốc dân thế hệ mới, trang bị card đồ họa RTX 4050 6GB TGP 105W, tản nhiệt buồng kín hút gió đáy thổi sau hiệu quả cao, bảo hành Lenovo Premier Support.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1780,
    ratingAvg: 4.7,
    ratingCount: 380,
    variants: [
      ['i5-12450HX / RTX 3050 / 16GB / 512GB', 17490000, 35, 'LOQ15-3050'],
      ['i5-13450HX / RTX 4050 / 16GB / 512GB', 21990000, 28, 'LOQ15-4050']
    ]
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'An Phát Computer',
    description: 'Biểu tượng laptop doanh nhân thượng lưu bằng sợi carbon siêu nhẹ chỉ 1.09kg, bàn phím gõ êm nhất thế giới, bảo mật vân tay Match-on-Chip và camera hồng ngoại IR nhận diện khuôn mặt.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 290,
    ratingAvg: 5.0,
    ratingCount: 74,
    variants: [
      ['Đen Nhung / Ultra 7 155H / 32GB / 1TB OLED', 56990000, 10, 'TP-X1C12-U7-32'],
      ['Đen Nhung / Ultra 5 125U / 16GB / 512GB IPS', 44990000, 14, 'TP-X1C12-U5-16']
    ]
  },
  {
    name: 'Lenovo ThinkPad T14 Gen 5',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'An Phát Computer',
    description: 'Dòng máy làm việc nồi đồng cối đá được các kỹ sư và chuyên gia IT tin dùng. Thiết kế mới nâng cấp khả năng sửa chữa, thay thế RAM và SSD cực kỳ dễ dàng.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 710,
    ratingAvg: 4.8,
    ratingCount: 160,
    variants: [
      ['i5-1335U / 16GB / 512GB', 26990000, 25, 'TP-T14-I5-16'],
      ['Ultra 7 / 32GB / 1TB', 35990000, 15, 'TP-T14-U7-32']
    ]
  },
  {
    name: 'Lenovo IdeaPad Slim 3 15',
    category: 'Laptop',
    brand: 'Lenovo',
    shopName: 'An Phát Computer',
    description: 'Laptop mỏng nhẹ thời trang cho học sinh, sinh viên và nhân viên văn phòng. Viền màn hình siêu mỏng, tích hợp cảm biến vân tay nút nguồn và sạc nhanh Rapid Charge Boost.',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2200,
    ratingAvg: 4.6,
    ratingCount: 460,
    variants: [
      ['Xám / i5-13420H / 16GB / 512GB', 13990000, 45, 'IDEA-SLIM3-I5']
    ]
  },
  {
    name: 'Dell XPS 16 9640',
    category: 'Laptop',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Kiệt tác công nghệ tương lai với hàng phím cảm ứng điện dung, touchpad tàng hình bằng kính liền mạch và màn hình 4K+ OLED InfinityEdge sắc nét đến từng micromet.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 180,
    ratingAvg: 4.9,
    ratingCount: 48,
    variants: [
      ['Bạc Platinum / Ultra 7 / RTX 4060 / 32GB / 1TB', 69990000, 8, 'DELL-XPS16-4060']
    ]
  },
  {
    name: 'Dell XPS 14 9440',
    category: 'Laptop',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Laptop 14 inch nhỏ gọn nhưng chứa đựng card đồ họa rời RTX 4050, thời lượng pin ấn tượng, khung nhôm phay xước kết hợp kính Gorilla Glass 3 nguyên khối.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 260,
    ratingAvg: 4.8,
    ratingCount: 65,
    variants: [
      ['Than Chì Graphite / Ultra 7 / 32GB / 1TB 3.2K OLED', 54990000, 10, 'DELL-XPS14-U7']
    ]
  },
  {
    name: 'Dell Inspiron 15 3520',
    category: 'Laptop',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Laptop văn phòng bền bỉ với tần số quét 120Hz mượt mà, bản lề nâng công thái học gõ phím thoải mái, hỗ trợ sạc nhanh ExpressCharge 80% trong 60 phút.',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2700,
    ratingAvg: 4.6,
    ratingCount: 590,
    variants: [
      ['Đen Carbon / i5-1235U / 16GB / 512GB', 13290000, 50, 'DELL-INS3520-I5']
    ]
  },
  {
    name: 'Dell Inspiron 14 5440',
    category: 'Laptop',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Vỏ kim loại sang trọng màu xanh Ice Blue, màn hình tỷ lệ 16:10 mở rộng không gian làm việc, loa stereo công nghệ Waves MaxxAudio Pro sống động.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.7,
    ratingCount: 190,
    variants: [
      ['Xanh Ice Blue / Core 5 120U / 16GB / 512GB', 17990000, 30, 'DELL-INS5440-C5']
    ]
  },
  {
    name: 'HP Omen 16 Gaming',
    category: 'Laptop',
    brand: 'HP',
    shopName: 'GearVN Pro Gaming',
    description: 'Hiệu năng đỉnh cao với tản nhiệt công nghệ OMEN Tempest Cooling, chip Intel Core i7-14700HX, card đồ họa RTX 4070 8GB và âm thanh tinh chỉnh bởi Bang & Olufsen.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 380,
    ratingAvg: 4.8,
    ratingCount: 89,
    variants: [
      ['Đen Bóng Đêm / i7-14700HX / RTX 4070 / 32GB / 1TB', 43990000, 15, 'HP-OMEN16-4070']
    ]
  },
  {
    name: 'HP Victus 15 Gaming',
    category: 'Laptop',
    brand: 'HP',
    shopName: 'GearVN Pro Gaming',
    description: 'Laptop gaming phong cách tối giản thanh lịch, vừa học tập làm việc vừa chiến game mượt mà với RTX 3050 6GB và màn hình IPS 144Hz sắc nét.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2100,
    ratingAvg: 4.7,
    ratingCount: 440,
    variants: [
      ['Xám Mica / i5-13420H / RTX 3050 / 16GB / 512GB', 18490000, 40, 'HP-VIC15-3050']
    ]
  },
  {
    name: 'HP Envy x360 2-in-1',
    category: 'Laptop',
    brand: 'HP',
    shopName: 'An Phát Computer',
    description: 'Linh hoạt xoay gập 360 độ biến hóa thành máy tính bảng vẽ đồ họa, màn hình cảm ứng OLED 2.8K kính cường lực Corning Gorilla Glass NBT và bút cảm ứng HP Pen đi kèm.',
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 520,
    ratingAvg: 4.8,
    ratingCount: 115,
    variants: [
      ['Bạc Tự Nhiên / Ultra 7 / 16GB / 1TB OLED', 28990000, 18, 'HP-ENVY-U7-16-1TB']
    ]
  },
  {
    name: 'HP Pavilion 15',
    category: 'Laptop',
    brand: 'HP',
    shopName: 'An Phát Computer',
    description: 'Dòng máy quốc dân văn phòng được yêu thích nhất của HP, mặt A nắp nhôm sang trọng, cấu hình Core i5 mạnh mẽ và bàn phím số phụ full-size tiện nhập liệu số liệu.',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2500,
    ratingAvg: 4.6,
    ratingCount: 520,
    variants: [
      ['Vàng Gold / i5-1335U / 16GB / 512GB', 15990000, 45, 'HP-PAV15-I5-16']
    ]
  },
  {
    name: 'MSI Raider GE78 HX',
    category: 'Laptop',
    brand: 'MSI',
    shopName: 'GearVN Pro Gaming',
    description: 'Quái vật máy trạm chơi game sở hữu dải đèn ma trận Mystic Light RGB rực rỡ, chip Intel Core i9-14900HX, card đồ họa khủng RTX 4090 16GB TGP 175W đẩy mọi thiết lập đồ họa lên mức tối đa.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 120,
    ratingAvg: 5.0,
    ratingCount: 35,
    variants: [
      ['Đen / i9-14900HX / RTX 4090 / 64GB / 2TB', 112990000, 4, 'MSI-GE78-4090']
    ]
  },
  {
    name: 'MSI Katana 15 B13V',
    category: 'Laptop',
    brand: 'MSI',
    shopName: 'GearVN Pro Gaming',
    description: 'Lấy cảm hứng từ thanh kiếm sắc bén Katana, trang bị card đồ họa RTX 4060 8GB GDDR6, bàn phím 4 vùng RGB rực rỡ và hệ thống tản nhiệt Cooler Boost 5 hai quạt 6 ống đồng.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1100,
    ratingAvg: 4.7,
    ratingCount: 260,
    variants: [
      ['Đen / i7-13620H / RTX 4060 / 16GB / 1TB', 26990000, 25, 'MSI-KATANA15-4060']
    ]
  },
  {
    name: 'Acer Nitro V 15',
    category: 'Laptop',
    brand: 'Acer',
    shopName: 'GearVN Pro Gaming',
    description: 'Chiếc laptop gaming giá tốt cấu hình cao với logo Nitro hologram phá cách, trang bị card đồ họa RTX 4050 6GB và hệ thống phần mềm NitroSense quản lý quạt thông minh.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1950,
    ratingAvg: 4.7,
    ratingCount: 410,
    variants: [
      ['Đen / i5-13420H / RTX 4050 / 16GB / 512GB', 19990000, 35, 'ACER-NITRO5-4050']
    ]
  },

  // =========================================================================
  // NHÓM C: LINH KIỆN MÁY TÍNH – PC COMPONENTS (25 SẢN PHẨM)
  // =========================================================================
  {
    name: 'CPU Intel Core i9-14900K',
    category: 'CPU',
    brand: 'Intel',
    shopName: 'GearVN Pro Gaming',
    description: 'Vi xử lý flagship 24 nhân 32 luồng với xung nhịp Turbo tối đa chạm ngưỡng 6.0 GHz, hỗ trợ ép xung mạnh mẽ và tương thích socket LGA1700 trên các bo mạch chủ Z790.',
    images: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 650,
    ratingAvg: 4.9,
    ratingCount: 145,
    variants: [
      ['Hộp Box Chính Hãng', 14990000, 25, 'CPU-I9-14900K']
    ]
  },
  {
    name: 'CPU Intel Core i7-14700K',
    category: 'CPU',
    brand: 'Intel',
    shopName: 'GearVN Pro Gaming',
    description: 'Nâng cấp lên 20 nhân 28 luồng (thêm 4 nhân E-core), xung nhịp 5.6 GHz, lựa chọn hàng đầu cho các nhà sáng tạo nội dung dựng phim 4K/8K và game thủ chuyên nghiệp.',
    images: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 920,
    ratingAvg: 4.8,
    ratingCount: 210,
    variants: [
      ['Hộp Box Chính Hãng', 10890000, 30, 'CPU-I7-14700K']
    ]
  },
  {
    name: 'CPU Intel Core i5-14600K',
    category: 'CPU',
    brand: 'Intel',
    shopName: 'GearVN Pro Gaming',
    description: '14 nhân 20 luồng xung nhịp boost 5.3 GHz, vua hiệu năng trên giá thành trong phân khúc gaming tầm trung cao cấp.',
    images: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1450,
    ratingAvg: 4.8,
    ratingCount: 310,
    variants: [
      ['Hộp Box Chính Hãng', 7790000, 45, 'CPU-I5-14600K']
    ]
  },
  {
    name: 'CPU Intel Core i5-13400F',
    category: 'CPU',
    brand: 'Intel',
    shopName: 'An Phát Computer',
    description: '10 nhân 16 luồng tiết kiệm điện mát mẻ, sự lựa chọn tối ưu cho các bộ case gaming phổ thông dưới 20 triệu đồng.',
    images: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3100,
    ratingAvg: 4.8,
    ratingCount: 620,
    variants: [
      ['Hộp Box Chính Hãng (Không iGPU)', 4790000, 60, 'CPU-I5-13400F']
    ]
  },
  {
    name: 'CPU AMD Ryzen 7 7800X3D',
    category: 'CPU',
    brand: 'AMD',
    shopName: 'GearVN Pro Gaming',
    description: 'CPU chơi game số 1 hành tinh với công nghệ bộ nhớ đệm 3D V-Cache dung lượng khổng lồ 96MB L3 Cache, tối ưu khung hình FPS mượt mà cho mọi tựa game bắn súng eSports.',
    images: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1850,
    ratingAvg: 5.0,
    ratingCount: 420,
    variants: [
      ['Hộp Box Chính Hãng Socket AM5', 11490000, 25, 'CPU-R7-7800X3D']
    ]
  },
  {
    name: 'CPU AMD Ryzen 9 7950X3D',
    category: 'CPU',
    brand: 'AMD',
    shopName: 'GearVN Pro Gaming',
    description: 'Đỉnh cao kết hợp giữa 16 nhân 32 luồng dựng hình 3D Render và bộ đệm 3D V-Cache chiến game, kiến trúc Zen 4 tiến trình 5nm hiệu quả năng lượng cao.',
    images: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 410,
    ratingAvg: 4.9,
    ratingCount: 95,
    variants: [
      ['Hộp Box Chính Hãng Socket AM5', 16990000, 15, 'CPU-R9-7950X3D']
    ]
  },
  {
    name: 'Card màn hình ASUS ROG Strix GeForce RTX 4090 24GB',
    category: 'Card đồ họa (VGA)',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Vua card đồ họa với khung kim loại đúc liền khối nguyên khối, tản nhiệt buồng hơi kết hợp quạt Axial-tech làm mát vượt trội, 24GB VRAM GDDR6X thoải mái huấn luyện mô hình AI và chơi game 4K Max Settings.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 220,
    ratingAvg: 5.0,
    ratingCount: 56,
    variants: [
      ['Bản OC 24GB GDDR6X', 58990000, 8, 'VGA-ROG-RTX4090-24G']
    ]
  },
  {
    name: 'Card màn hình MSI GeForce RTX 4070 Ti SUPER Gaming X Slim',
    category: 'Card đồ họa (VGA)',
    brand: 'MSI',
    shopName: 'GearVN Pro Gaming',
    description: 'Thiết kế mỏng gọn Slim nhưng trang bị 3 quạt làm mát Tri Frozr 3 và 16GB VRAM băng thông 256-bit, hoàn hảo để cân mọi tựa game 2K/4K kèm công nghệ DLSS 3.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 630,
    ratingAvg: 4.9,
    ratingCount: 140,
    variants: [
      ['16GB GDDR6X Gaming X Slim', 24990000, 18, 'VGA-MSI-4070TIS-SLIM']
    ]
  },
  {
    name: 'Card màn hình Gigabyte GeForce RTX 4070 Super Eagle OC',
    category: 'Card đồ họa (VGA)',
    brand: 'Gigabyte',
    shopName: 'GearVN Pro Gaming',
    description: 'Hệ thống tản nhiệt Windforce 3 quạt quay đảo chiều độc quyền, 12GB VRAM GDDR6X và độ tin cậy chuẩn Ultra Durable, hiệu năng mạnh hơn RTX 3090 thế hệ trước.',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.8,
    ratingCount: 195,
    variants: [
      ['12GB GDDR6X Eagle OC', 17890000, 25, 'VGA-GIGA-4070S-EAGLE']
    ]
  },
  {
    name: 'Card đồ họa MSI RTX 4060 Ventus 2X 8GB',
    category: 'Card đồ họa (VGA)',
    brand: 'MSI',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế 2 quạt Torx Fan 4.0 nhỏ gọn tương thích mọi vỏ case m-ATX, tiêu thụ điện chỉ 115W cực kỳ mát mẻ và hỗ trợ xuất hình 4K 120Hz qua HDMI 2.1.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 2900,
    ratingAvg: 4.8,
    ratingCount: 620,
    variants: [
      ['8GB GDDR6 Ventus 2X', 8490000, 50, 'VGA-MSI-4060-VEN2X']
    ]
  },
  {
    name: 'Card màn hình ASUS Dual GeForce RTX 4060 EVO 8GB',
    category: 'Card đồ họa (VGA)',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Tích hợp 2 quạt công nghệ Axial-tech với trục bi kép bền bỉ, công nghệ 0dB tĩnh lặng khi tải nhẹ và tấm ốp lưng nhôm bảo vệ mạch chống cong vênh.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1680,
    ratingAvg: 4.8,
    ratingCount: 340,
    variants: [
      ['8GB GDDR6 Dual EVO OC', 8690000, 40, 'VGA-ASUS-4060-DUAL']
    ]
  },
  {
    name: 'Card màn hình Gigabyte Radeon RX 7800 XT Gaming OC',
    category: 'Card đồ họa (VGA)',
    brand: 'Gigabyte',
    shopName: 'GearVN Pro Gaming',
    description: 'Đối thủ nặng ký phân khúc 2K với 16GB VRAM GDDR6 rộng rãi, kiến trúc AMD RDNA 3 tân tiến và công nghệ nội suy khung hình AMD FSR 3 Fluid Motion Frames.',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 510,
    ratingAvg: 4.8,
    ratingCount: 110,
    variants: [
      ['16GB GDDR6 Gaming OC', 14290000, 20, 'VGA-GIGA-RX7800XT']
    ]
  },
  {
    name: 'Bo mạch chủ ASUS ROG MAXIMUS Z790 HERO',
    category: 'Bo mạch chủ',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Mainboard cao cấp 20+1 pha nguồn 90A hỗ trợ ép xung cực hạn, tích hợp màn hình Polymo Lighting RGB độc đáo, 5 khe cắm M.2 PCIe 5.0 và kết nối Wi-Fi 7 thế hệ mới.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 190,
    ratingAvg: 5.0,
    ratingCount: 42,
    variants: [
      ['Socket LGA1700 / DDR5 / Wi-Fi 7', 16990000, 10, 'MB-ROG-Z790-HERO']
    ]
  },
  {
    name: 'Bo mạch chủ MSI MAG B760 TOMAHAWK WIFI',
    category: 'Bo mạch chủ',
    brand: 'MSI',
    shopName: 'GearVN Pro Gaming',
    description: 'Dòng bo mạch chủ gaming bán chạy nhất với dàn heatsink tản nhiệt kim loại dày dặn, cổng mạng 2.5G LAN, hỗ trợ RAM DDR5 bus cao tới 7200+ MHz.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1350,
    ratingAvg: 4.8,
    ratingCount: 290,
    variants: [
      ['Socket LGA1700 / DDR5 / Wi-Fi 6E', 5490000, 35, 'MB-MSI-B760-TOMA']
    ]
  },
  {
    name: 'Bo mạch chủ Gigabyte B650 AORUS ELITE AX',
    category: 'Bo mạch chủ',
    brand: 'Gigabyte',
    shopName: 'GearVN Pro Gaming',
    description: 'Nền tảng tối ưu cho các CPU AMD Ryzen 7000/8000/9000 Series socket AM5, dàn VRM 14+2+1 pha nguồn mạnh mẽ, nút EZ-Latch tháo lắp card màn hình nhanh chóng.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1100,
    ratingAvg: 4.8,
    ratingCount: 240,
    variants: [
      ['Socket AM5 / DDR5 / Wi-Fi 6E', 5890000, 30, 'MB-GIGA-B650-AORUS']
    ]
  },
  {
    name: 'RAM Corsair Dominator Titanium 32GB (2x16GB) DDR5 6000MHz',
    category: 'RAM',
    brand: 'Corsair',
    shopName: 'GearVN Pro Gaming',
    description: 'Đỉnh cao RAM cao cấp với dải đèn LED RGB có thể thay đổi thanh trang trí phía trên, chip nhớ IC chọn lọc thủ công và công nghệ tản nhiệt DHX độc quyền.',
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 480,
    ratingAvg: 4.9,
    ratingCount: 105,
    variants: [
      ['Đen / 32GB (2x16GB) 6000MHz CL30', 4490000, 25, 'RAM-COR-DOM-32G-BLK'],
      ['Trắng / 32GB (2x16GB) 6000MHz CL30', 4590000, 20, 'RAM-COR-DOM-32G-WHT']
    ]
  },
  {
    name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 5600MHz',
    category: 'RAM',
    brand: 'Corsair',
    shopName: 'GearVN Pro Gaming',
    description: 'Đèn LED RGB 10 vùng năng động đồng bộ qua phần mềm iCUE, hỗ trợ cấu hình Intel XMP 3.0 và AMD EXPO ép xung dễ dàng chỉ với 1 click trong BIOS.',
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.8,
    ratingCount: 360,
    variants: [
      ['Đen / 32GB (2x16GB) 5600MHz', 2890000, 50, 'RAM-COR-VEN-32G-BLK']
    ]
  },
  {
    name: 'RAM Kingston Fury Beast 16GB DDR5 5200MHz',
    category: 'RAM',
    brand: 'Kingston',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế tản nhiệt nhôm đen đơn giản tinh tế, tương thích Plug N Play tự động nhận diện tốc độ xung nhịp tối ưu trên mọi nền tảng mainboard thế hệ mới.',
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 3400,
    ratingAvg: 4.8,
    ratingCount: 710,
    variants: [
      ['16GB 5200MHz Đơn', 1590000, 80, 'RAM-KING-16G-5200'],
      ['32GB (2x16GB) 5600MHz Kit', 3190000, 45, 'RAM-KING-32G-5600']
    ]
  },
  {
    name: 'RAM Kingston Fury Renegade 32GB (2x16GB) DDR5 6400MHz',
    category: 'RAM',
    brand: 'Kingston',
    shopName: 'GearVN Pro Gaming',
    description: 'Dành riêng cho những người đam mê tốc độ với xung nhịp siêu cao 6400MHz độ trễ thấp CL32, tản nhiệt nhôm phay vân xước bạc đen hầm hố.',
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 720,
    ratingAvg: 4.9,
    ratingCount: 155,
    variants: [
      ['32GB (2x16GB) 6400MHz RGB', 3890000, 25, 'RAM-KING-REN-32G']
    ]
  },
  {
    name: 'Ổ cứng SSD Samsung 990 PRO 2TB NVMe M.2',
    category: 'Ổ cứng SSD',
    brand: 'Samsung',
    shopName: 'GearVN Pro Gaming',
    description: 'Ông vua tốc độ SSD chuẩn PCIe 4.0 với tốc độ đọc tuần tự lên đến 7450 MB/s và ghi 6900 MB/s, bộ điều khiển phủ niken tản nhiệt và phần mềm Samsung Magician bảo vệ toàn diện.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1420,
    ratingAvg: 5.0,
    ratingCount: 380,
    variants: [
      ['Bản 2TB Không Heatsink', 4590000, 30, 'SSD-SS-990PRO-2TB'],
      ['Bản 2TB Có Kèm Tản Heatsink (PS5)', 4990000, 20, 'SSD-SS-990PRO-2TB-HS']
    ]
  },
  {
    name: 'Ổ cứng SSD Samsung 980 PRO 1TB NVMe M.2',
    category: 'Ổ cứng SSD',
    brand: 'Samsung',
    shopName: 'An Phát Computer',
    description: 'Chuẩn PCIe 4.0 NVMe M.2 tốc độ đọc 7000 MB/s, tuổi thọ đọc ghi 600 TBW bền bỉ vượt thời gian, tương thích hoàn hảo cả PC, Laptop và máy chơi game PS5.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2900,
    ratingAvg: 4.9,
    ratingCount: 650,
    variants: [
      ['Bản 1TB Chính Hãng', 2690000, 45, 'SSD-SS-980PRO-1TB']
    ]
  },
  {
    name: 'Ổ cứng SSD WD Black SN850X 1TB PCIe Gen4',
    category: 'Ổ cứng SSD',
    brand: 'Western Digital',
    shopName: 'GearVN Pro Gaming',
    description: 'Tốc độ đọc ấn tượng 7300 MB/s, chế độ Game Mode 2.0 tự động kích hoạt tính năng tải trước bản đồ trong game và giảm thiểu tối đa hiện tượng giật khung hình.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1250,
    ratingAvg: 4.8,
    ratingCount: 270,
    variants: [
      ['Bản 1TB NVMe Gen4', 2550000, 35, 'SSD-WD-SN850X-1TB']
    ]
  },
  {
    name: 'Nguồn máy tính Corsair RM850e 850W 80 Plus Gold',
    category: 'Nguồn & Tản nhiệt',
    brand: 'Corsair',
    shopName: 'GearVN Pro Gaming',
    description: 'Chuẩn nguồn ATX 3.0 và PCIe 5.0 đi kèm cáp nguồn 12VHPWR cấp điện trực tiếp cho RTX 40 Series, dây cáp rời hoàn toàn Full Modular và chứng nhận hiệu suất 80 Plus Gold.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 980,
    ratingAvg: 4.9,
    ratingCount: 210,
    variants: [
      ['Công suất 850W Gold ATX 3.0', 3290000, 30, 'PSU-COR-RM850E']
    ]
  },
  {
    name: 'Tản nhiệt nước AIO Cooler Master MasterLiquid 360L Core ARGB',
    category: 'Nguồn & Tản nhiệt',
    brand: 'Cooler Master',
    shopName: 'GearVN Pro Gaming',
    description: 'Két làm mát 360mm với 3 quạt ARGB 120mm áp suất gió cao, bơm thiết kế 2 buồng Dual Chamber thế hệ S cải tiến tăng lưu lượng dòng chảy và giảm ồn tuyệt đối.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 840,
    ratingAvg: 4.8,
    ratingCount: 180,
    variants: [
      ['Màu Đen / Radiator 360mm', 2190000, 35, 'AIO-CM-360L-BLK'],
      ['Màu Trắng / Radiator 360mm', 2290000, 25, 'AIO-CM-360L-WHT']
    ]
  },
  {
    name: 'Tản nhiệt khí CPU Cooler Master Hyper 622 Halo Black',
    category: 'Nguồn & Tản nhiệt',
    brand: 'Cooler Master',
    shopName: 'GearVN Pro Gaming',
    description: 'Tháp tản nhiệt đôi Dual Tower với 6 ống dẫn nhiệt đồng mạ niken, 2 quạt Halo² ARGB vòng đôi rực rỡ, cân tốt các CPU Core i7 và Ryzen 7 khi chạy hết công suất.',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1150,
    ratingAvg: 4.8,
    ratingCount: 240,
    variants: [
      ['Màu Đen / Dual Fan ARGB', 1290000, 45, 'FAN-CM-HYPER622']
    ]
  },

  // =========================================================================
  // NHÓM D: MÁY TÍNH BẢNG – TABLETS (15 SẢN PHẨM)
  // =========================================================================
  {
    name: 'iPad Pro 13 inch M4 Ultra Retina OLED',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế mỏng kỷ lục 5.1mm mỏng nhất trong lịch sử sản phẩm Apple, màn hình Ultra Retina XDR sử dụng công nghệ tấm nền OLED hai lớp đột phá Tandem OLED, chip Apple M4 sức mạnh vượt tầm.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 420,
    ratingAvg: 5.0,
    ratingCount: 110,
    variants: [
      ['Đen Không Gian / 256GB Wi-Fi', 37990000, 20, 'IPAD-PRO13-M4-256'],
      ['Bạc Bạc / 512GB Wi-Fi + 5G', 47990000, 12, 'IPAD-PRO13-M4-512G']
    ]
  },
  {
    name: 'iPad Pro 11 inch M4 Ultra Retina OLED',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Màn hình 11 inch Tandem OLED tần số quét 10-120Hz ProMotion, hỗ trợ phụ kiện Apple Pencil Pro với cảm ứng xoay nén và bàn phím Magic Keyboard nhôm cao cấp.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 680,
    ratingAvg: 4.9,
    ratingCount: 160,
    variants: [
      ['Đen Không Gian / 256GB Wi-Fi', 28990000, 25, 'IPAD-PRO11-M4-256'],
      ['Bạc / 512GB Wi-Fi', 34990000, 18, 'IPAD-PRO11-M4-512']
    ]
  },
  {
    name: 'iPad Air 13 inch M2',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Lần đầu tiên dòng iPad Air sở hữu phiên bản kích thước lớn 13 inch. Sức mạnh vượt trội từ chip M2, camera trước đặt ở cạnh ngang tối ưu cuộc gọi FaceTime và làm việc.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 590,
    ratingAvg: 4.8,
    ratingCount: 140,
    variants: [
      ['Xanh Blue / 128GB Wi-Fi', 21990000, 30, 'IPAD-AIR13-128'],
      ['Xám Không Gian / 256GB Wi-Fi', 24990000, 20, 'IPAD-AIR13-256']
    ]
  },
  {
    name: 'iPad Air 11 inch M2',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Hiệu năng đồ họa nhanh hơn 50% so với thế hệ M1, màn hình Liquid Retina chống chói, âm thanh stereo vòm sống động và bảo mật vân tay Touch ID trên nút nguồn.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1250,
    ratingAvg: 4.8,
    ratingCount: 290,
    variants: [
      ['Tím Purple / 128GB Wi-Fi', 16490000, 40, 'IPAD-AIR11-128-PUR'],
      ['Xám / 128GB Wi-Fi', 16490000, 35, 'IPAD-AIR11-128-GRY']
    ]
  },
  {
    name: 'iPad Gen 10 10.9 inch 64GB',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Thiết kế viền mỏng toàn màn hình với 4 màu sắc cá tính tươi sáng, cổng kết nối Type-C hiện đại, chip A14 Bionic đáp ứng mượt mà nhu cầu học online và giải trí gia đình.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3800,
    ratingAvg: 4.8,
    ratingCount: 780,
    variants: [
      ['Xanh Dương / 64GB Wi-Fi', 9490000, 60, 'IPAD-GEN10-64-BLU'],
      ['Bạc Bạc / 64GB Wi-Fi', 9490000, 50, 'IPAD-GEN10-64-SLV'],
      ['Hồng / 256GB Wi-Fi', 13490000, 30, 'IPAD-GEN10-256-PNK']
    ]
  },
  {
    name: 'iPad mini 7 128GB',
    category: 'Máy tính bảng',
    brand: 'Apple',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Sức mạnh bỏ túi với chip A17 Pro hỗ trợ Apple Intelligence, màn hình Liquid Retina 8.3 inch hiển thị sắc nét, tương thích bút vẽ Apple Pencil Pro cảm ứng nhạy bén.',
    images: [
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 820,
    ratingAvg: 4.9,
    ratingCount: 190,
    variants: [
      ['Xám Không Gian / 128GB Wi-Fi', 13990000, 30, 'IPAD-MINI7-128-GRY'],
      ['Tím Nhạt / 256GB Wi-Fi', 16990000, 20, 'IPAD-MINI7-256-PUR']
    ]
  },
  {
    name: 'Samsung Galaxy Tab S10 Ultra 5G',
    category: 'Máy tính bảng',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Màn hình khổng lồ 14.6 inch Dynamic AMOLED 2X lớp phủ chống lóa chuyên nghiệp, chuẩn kháng nước bụi IP68 cho cả máy và bút S-Pen, vi xử lý Dimensity 9300+ mạnh mẽ.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 310,
    ratingAvg: 4.9,
    ratingCount: 72,
    variants: [
      ['Xám Moonstone / 12GB-256GB 5G', 30990000, 15, 'SS-TABS10U-256-5G'],
      ['Bạc Platinum / 16GB-512GB 5G', 35990000, 10, 'SS-TABS10U-512-5G']
    ]
  },
  {
    name: 'Samsung Galaxy Tab S10+ Wi-Fi',
    category: 'Máy tính bảng',
    brand: 'Samsung',
    shopName: 'TechZone Flagship Store',
    description: 'Màn hình 12.4 inch 120Hz mượt mà rực rỡ, tích hợp sâu bộ công cụ Galaxy AI Circle to Search và trợ lý vẽ tranh thông minh, pin 10090mAh dùng liên tục.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 520,
    ratingAvg: 4.8,
    ratingCount: 118,
    variants: [
      ['Xám Moonstone / 12GB-256GB Wi-Fi', 23990000, 20, 'SS-TABS10P-256']
    ]
  },
  {
    name: 'Samsung Galaxy Tab S9 FE 128GB',
    category: 'Máy tính bảng',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Máy tính bảng tầm trung hiếm hoi đạt chuẩn kháng nước IP68, tặng kèm sẵn bút cảm ứng S-Pen trong hộp, màn hình 90Hz bảo vệ mắt và thiết kế kim loại nguyên khối.',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1450,
    ratingAvg: 4.7,
    ratingCount: 310,
    variants: [
      ['Xanh Mint / 6GB-128GB Wi-Fi', 8490000, 45, 'SS-TABS9FE-128-MNT'],
      ['Xám / 8GB-256GB Wi-Fi', 10490000, 25, 'SS-TABS9FE-256-GRY']
    ]
  },
  {
    name: 'Samsung Galaxy Tab A9+ 5G',
    category: 'Máy tính bảng',
    brand: 'Samsung',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Màn hình 11 inch 90Hz kèm 4 loa công nghệ Dolby Atmos, kết nối mạng di động 5G mọi lúc mọi nơi và chế độ đa nhiệm chia 3 cửa sổ ứng dụng cùng lúc.',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2200,
    ratingAvg: 4.6,
    ratingCount: 470,
    variants: [
      ['Đen Graphite / 4GB-64GB 5G', 5490000, 50, 'SS-TABA9P-5G']
    ]
  },
  {
    name: 'Xiaomi Pad 6S Pro 12.4',
    category: 'Máy tính bảng',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Hiệu năng quái thú với màn hình tỷ lệ 3:2 kích thước 12.4 inch 3K tần số quét 144Hz, chip Snapdragon 8 Gen 2, 6 loa stereo công suất lớn và sạc siêu tốc 120W.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 680,
    ratingAvg: 4.8,
    ratingCount: 155,
    variants: [
      ['Đen Xám / 8GB-256GB', 12990000, 30, 'MI-PAD6SP-256']
    ]
  },
  {
    name: 'Xiaomi Pad 6 128GB',
    category: 'Máy tính bảng',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Thiết kế kim loại siêu mỏng 6.51mm, màn hình 2.8K 144Hz hiển thị 1 tỷ màu, vi xử lý Snapdragon 870 cân mượt mọi tác vụ học tập giải trí.',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1980,
    ratingAvg: 4.8,
    ratingCount: 420,
    variants: [
      ['Xanh Lam / 8GB-128GB', 7290000, 45, 'MI-PAD6-128-BLU']
    ]
  },
  {
    name: 'Redmi Pad Pro 12.1 inch',
    category: 'Máy tính bảng',
    brand: 'Xiaomi',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Màn hình cỡ đại 12.1 inch 2.5K 120Hz tỷ lệ 16:10, chứng nhận bảo vệ mắt ánh sáng xanh thấp TÜV Rheinland, viên pin khủng 10000mAh và chip Snapdragon 7s Gen 2.',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1420,
    ratingAvg: 4.7,
    ratingCount: 310,
    variants: [
      ['Xanh Bạc Hà / 6GB-128GB', 6490000, 40, 'RD-PADPRO-128']
    ]
  },
  {
    name: 'Lenovo Tab P12 12.7 inch',
    category: 'Máy tính bảng',
    brand: 'Lenovo',
    shopName: 'An Phát Computer',
    description: 'Màn hình 3K siêu nét 12.7 inch, hệ thống 4 loa âm thanh vòm JBL tối ưu bởi Dolby Atmos, kèm bút cảm ứng Lenovo Tab Pen Plus hỗ trợ ghi chú thông minh.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 480,
    ratingAvg: 4.7,
    ratingCount: 102,
    variants: [
      ['Xám Bão / 8GB-128GB (Kèm bút)', 7990000, 25, 'LEN-TABP12-128']
    ]
  },
  {
    name: 'Huawei MatePad 11.5S PaperMatte',
    category: 'Máy tính bảng',
    brand: 'Huawei',
    shopName: 'An Phát Computer',
    description: 'Màn hình công nghệ khắc nano PaperMatte chống chói lóa 99%, mang lại cảm giác viết vẽ chân thực như trên giấy thật, tần số quét 144Hz và ứng dụng vẽ GoPaint chuyên nghiệp.',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 350,
    ratingAvg: 4.8,
    ratingCount: 78,
    variants: [
      ['Tím Violet / 8GB-256GB', 11990000, 20, 'HW-MATE115S-256']
    ]
  },

  // =========================================================================
  // NHÓM E: THIẾT BỊ ÂM THANH – AUDIO (18 SẢN PHẨM)
  // =========================================================================
  {
    name: 'Tai nghe Sony WH-1000XM5 chống ồn cao cấp',
    category: 'Âm thanh',
    brand: 'Sony',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Tai nghe chụp tai chống ồn chủ động tốt nhất thế giới với hai bộ xử lý V1 và QN1, 8 micro khử ồn tự động theo môi trường, màng loa carbon 30mm tái tạo âm thanh chuẩn Hi-Res Audio Wireless LDAC.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1250,
    ratingAvg: 4.9,
    ratingCount: 310,
    variants: [
      ['Đen / Black', 7490000, 30, 'SONY-WH1000XM5-BLK'],
      ['Bạc Bạch Kim / Silver', 7490000, 25, 'SONY-WH1000XM5-SLV']
    ]
  },
  {
    name: 'Tai nghe Sony WF-1000XM5 True Wireless',
    category: 'Âm thanh',
    brand: 'Sony',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Thiết kế tai nghe nhét tai nhỏ gọn hơn 25%, màng loa Dynamic Driver X thế hệ mới truyền tải âm bass sâu lắng và chi tiết dải cao tách bạch, cảm biến dẫn truyền qua xương đàm thoại rõ nét.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 980,
    ratingAvg: 4.8,
    ratingCount: 220,
    variants: [
      ['Đen / Black', 5490000, 35, 'SONY-WF1000XM5-BLK'],
      ['Bạc / Silver', 5490000, 25, 'SONY-WF1000XM5-SLV']
    ]
  },
  {
    name: 'Tai nghe Apple AirPods Pro 2 MagSafe USB-C',
    category: 'Âm thanh',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Trang bị chip Apple H2 chống ồn chủ động gấp 2 lần, chế độ Thích Ứng Âm Thanh Thông Minh (Adaptive Audio), tính năng Nhận Biết Cuộc Trò Chuyện và hộp sạc chống nước IP54 cổng sạc Type-C.',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 4100,
    ratingAvg: 4.9,
    ratingCount: 920,
    variants: [
      ['Trắng / White (Hộp sạc USB-C)', 5690000, 80, 'AP-AIRPODSPRO2-USBC']
    ]
  },
  {
    name: 'Tai nghe Apple AirPods 4 Chống ồn chủ động',
    category: 'Âm thanh',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Thiết kế open-ear đeo êm ái nhất lịch sử AirPods lần đầu tiên trang bị tính năng Chống Ồn Chủ Động (ANC), hỗ trợ âm thanh không gian cá nhân hóa Spatial Audio và hộp sạc nhỏ nhất thế giới tích hợp loa tìm kiếm.',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1600,
    ratingAvg: 4.8,
    ratingCount: 350,
    variants: [
      ['Bản Tiêu Chuẩn', 3490000, 50, 'AP-AIRPODS4-STD'],
      ['Bản Có Chống Ồn ANC', 4790000, 60, 'AP-AIRPODS4-ANC']
    ]
  },
  {
    name: 'Tai nghe Apple AirPods Max',
    category: 'Âm thanh',
    brand: 'Apple',
    shopName: 'TechZone Flagship Store',
    description: 'Tai nghe chụp tai Over-ear cao cấp với khung vòm lưới thoáng khí, đệm tai bằng mút hoạt tính êm ái, núm xoay Digital Crown điều khiển chính xác và cổng sạc USB-C mới.',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 320,
    ratingAvg: 4.8,
    ratingCount: 75,
    variants: [
      ['Đen Midnight / USB-C', 13490000, 15, 'AP-AIRPODSMAX-MID'],
      ['Ánh Sao Starlight / USB-C', 13490000, 12, 'AP-AIRPODSMAX-STA']
    ]
  },
  {
    name: 'Tai nghe Bose QuietComfort Ultra Headphones',
    category: 'Âm thanh',
    brand: 'Bose',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Công nghệ âm thanh Bose Immersive Audio mang lại cảm giác âm thanh chân thực như phòng thu, khả năng chống ồn huyền thoại của Bose và công nghệ hiệu chỉnh CustomTune theo cấu trúc tai mỗi người.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 460,
    ratingAvg: 4.9,
    ratingCount: 105,
    variants: [
      ['Đen / Black', 9490000, 20, 'BOSE-QCU-BLK'],
      ['Trắng Khói / White Smoke', 9490000, 15, 'BOSE-QCU-WHT']
    ]
  },
  {
    name: 'Tai nghe Bose QuietComfort Ultra Earbuds',
    category: 'Âm thanh',
    brand: 'Bose',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Tai nghe nhét tai chống ồn chủ động đỉnh cao số 1 thế giới, đệm tai silicon hình chiếc dù khép kín tuyệt đối, âm thanh không gian đa chiều sống động.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 580,
    ratingAvg: 4.8,
    ratingCount: 130,
    variants: [
      ['Đen / Black', 6890000, 25, 'BOSE-QCUEAR-BLK']
    ]
  },
  {
    name: 'Tai nghe Marshall Major V Bluetooth',
    category: 'Âm thanh',
    brand: 'Marshall',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Biểu tượng phong cách Rock & Roll cổ điển với thời lượng pin không tưởng lên tới 100+ giờ phát nhạc liên tục, hỗ trợ sạc không dây và nút tùy chỉnh M-Button tiện lợi.',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1100,
    ratingAvg: 4.8,
    ratingCount: 260,
    variants: [
      ['Đen Da Vân Cổ Điển', 3890000, 40, 'MAR-MAJOR5-BLK']
    ]
  },
  {
    name: 'Loa Bluetooth Marshall Stanmore III',
    category: 'Âm thanh',
    brand: 'Marshall',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Chiếc loa để bàn gia đình công suất 80W uy lực với âm trường rộng mở hơn thế hệ trước, kết nối Bluetooth 5.2 LE Audio thế hệ mới, núm vặn analog mạ vàng đồng sang trọng.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.9,
    ratingCount: 215,
    variants: [
      ['Đen Cổ Điển / Black', 8990000, 25, 'MAR-STANMORE3-BLK'],
      ['Kem Vintage / Cream', 8990000, 20, 'MAR-STANMORE3-CRM']
    ]
  },
  {
    name: 'Loa Bluetooth Marshall Emberton II',
    category: 'Âm thanh',
    brand: 'Marshall',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Loa di động bỏ túi âm thanh 360 độ True Stereophonic, kháng nước bụi chuẩn IP67, pin 30 giờ và chế độ Stack Mode ghép nối nhiều loa cùng lúc.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.8,
    ratingCount: 370,
    variants: [
      ['Đen Viền Đồng / Black & Brass', 3790000, 50, 'MAR-EMBERTON2-BLK']
    ]
  },
  {
    name: 'Loa Bluetooth JBL Charge 5',
    category: 'Âm thanh',
    brand: 'JBL',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Chất âm JBL Pro Sound mạnh mẽ với củ loa trầm độc lập và 2 màng cộng hưởng thụ động, kháng nước chuẩn IP67, pin 20 giờ kiêm sạc dự phòng cho điện thoại.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2450,
    ratingAvg: 4.8,
    ratingCount: 520,
    variants: [
      ['Đen / Black', 3490000, 45, 'JBL-CHARGE5-BLK'],
      ['Xanh Rằn Ri / Camo', 3490000, 30, 'JBL-CHARGE5-CAM']
    ]
  },
  {
    name: 'Loa Bluetooth JBL Flip 6',
    category: 'Âm thanh',
    brand: 'JBL',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Loa mini hình trụ cầm tay nhỏ gọn, hệ thống loa 2 đường tiếng cho dải trung rõ ràng và dải cao trong trẻo, chống nước chống bụi IP67 pin 12 giờ.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3100,
    ratingAvg: 4.7,
    ratingCount: 680,
    variants: [
      ['Đen / Black', 2490000, 60, 'JBL-FLIP6-BLK'],
      ['Xanh Dương / Blue', 2490000, 40, 'JBL-FLIP6-BLU']
    ]
  },
  {
    name: 'Loa di động JBL PartyBox Stage 320',
    category: 'Âm thanh',
    brand: 'JBL',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Loa kéo tiệc tùng công suất 240W uy lực rung chuyển mọi không gian, tích hợp tay kéo và bánh xe di động, đèn LED RGB nhấp nháy theo điệu nhạc và cổng cắm micro karaoke.',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 280,
    ratingAvg: 4.9,
    ratingCount: 65,
    variants: [
      ['Đen PartyBox 240W', 14900000, 15, 'JBL-STAGE320']
    ]
  },
  {
    name: 'Tai nghe Gaming HyperX Cloud III Wireless',
    category: 'Âm thanh',
    brand: 'HyperX',
    shopName: 'GearVN Pro Gaming',
    description: 'Huyền thoại tai nghe eSports nay nâng cấp không dây kết nối 2.4GHz không độ trễ, pin siêu khủng 120 giờ chỉ 1 lần sạc, đệm mút hoạt tính êm ái trứ danh.',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1450,
    ratingAvg: 4.9,
    ratingCount: 340,
    variants: [
      ['Đen Đỏ / Black-Red', 3590000, 35, 'HX-CLOUD3-WL-RED']
    ]
  },
  {
    name: 'Tai nghe Gaming Razer BlackShark V2 Pro',
    category: 'Âm thanh',
    brand: 'Razer',
    shopName: 'GearVN Pro Gaming',
    description: 'Tai nghe eSports hàng đầu thế giới được các tuyển thủ chuyên nghiệp tin dùng, mic thu âm Razer HyperClear Super Wideband độ nét cao và màng loa TriForce Titanium 50mm.',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 980,
    ratingAvg: 4.8,
    ratingCount: 220,
    variants: [
      ['Đen / Black', 4590000, 25, 'RZ-BSHARK-V2P-BLK'],
      ['Trắng / White', 4690000, 20, 'RZ-BSHARK-V2P-WHT']
    ]
  },
  {
    name: 'Tai nghe Gaming Logitech G Pro X 2 LIGHTSPEED',
    category: 'Âm thanh',
    brand: 'Logitech',
    shopName: 'GearVN Pro Gaming',
    description: 'Màng loa làm từ vật liệu Graphene 50mm cách mạng giảm thiểu tối đa độ méo tiếng, định vị tiếng bước chân đối thủ siêu chuẩn xác trong game bắn súng FPS.',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 780,
    ratingAvg: 4.9,
    ratingCount: 175,
    variants: [
      ['Đen / Black', 5290000, 20, 'LOG-GPROX2-BLK']
    ]
  },
  {
    name: 'Tai nghe kiểm âm Audio-Technica ATH-M50x',
    category: 'Âm thanh',
    brand: 'Audio-Technica',
    shopName: 'Cellphones Audio & Mobile',
    description: 'Chiếc tai nghe phòng thu huyền thoại được các kỹ sư âm thanh và streamer toàn cầu yêu thích, dải tần đáp ứng phẳng trung thực và khả năng cách âm thụ động hoàn hảo.',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1890,
    ratingAvg: 4.9,
    ratingCount: 420,
    variants: [
      ['Đen Studio / Black', 3590000, 35, 'AT-ATH-M50X-BLK']
    ]
  },
  {
    name: 'Loa máy tính Logitech Z407 Bluetooth Subwoofer',
    category: 'Âm thanh',
    brand: 'Logitech',
    shopName: 'An Phát Computer',
    description: 'Dàn âm thanh vi tính 2.1 công suất đỉnh 80W kèm loa siêu trầm đánh bass uy lực, đi kèm núm xoay điều khiển không dây tròn độc đáo đặt trên bàn làm việc.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1420,
    ratingAvg: 4.7,
    ratingCount: 290,
    variants: [
      ['Bộ Loa 2.1 Kèm Cục Sub', 1990000, 40, 'LOG-Z407-21']
    ]
  },

  // =========================================================================
  // NHÓM F: THIẾT BỊ NGOẠI VI VÀ GAMING (18 SẢN PHẨM)
  // =========================================================================
  {
    name: 'Chuột không dây Logitech MX Master 3S',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'An Phát Computer',
    description: 'Vua chuột công thái học văn phòng với con lăn cơ điện từ MagSpeed cuộn 1000 dòng/giây, công tắc Quiet Clicks giảm 90% tiếng ồn, cảm biến Darkfield 8000 DPI di mượt trên mặt kính.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3100,
    ratingAvg: 4.9,
    ratingCount: 750,
    variants: [
      ['Xám Graphite / Black', 2190000, 60, 'LOG-MXM3S-GRY'],
      ['Trắng Pale Grey', 2190000, 45, 'LOG-MXM3S-WHT']
    ]
  },
  {
    name: 'Chuột gaming không dây Logitech G Pro X Superlight 2',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'GearVN Pro Gaming',
    description: 'Trọng lượng siêu nhẹ chỉ 60g, công tắc quang học cơ khí lai LIGHTFORCE phản hồi tức thì, cảm biến HERO 2 độ phân giải 32000 DPI và tần số quét polling rate 4000Hz.',
    images: [
      'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1850,
    ratingAvg: 5.0,
    ratingCount: 460,
    variants: [
      ['Đen / Black 60g', 3290000, 40, 'LOG-GPX2-BLK'],
      ['Trắng / White 60g', 3290000, 35, 'LOG-GPX2-WHT'],
      ['Hồng Magenta', 3390000, 20, 'LOG-GPX2-PNK']
    ]
  },
  {
    name: 'Chuột gaming Logitech G502 X PLUS LIGHTSPEED',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'GearVN Pro Gaming',
    description: 'Thiết kế biểu tượng G502 huyền thoại tái sinh với trọng lượng tối ưu, dải đèn RGB 8 vùng phát sáng rực rỡ và nút DPI-Shift có thể đảo ngược hoặc tháo rời.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1200,
    ratingAvg: 4.8,
    ratingCount: 280,
    variants: [
      ['Đen / Black RGB', 3490000, 30, 'LOG-G502X-PLS-BLK']
    ]
  },
  {
    name: 'Chuột gaming Logitech G102 Lightsync RGB',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'TechZone Flagship Store',
    description: 'Chuột gaming có dây bán chạy nhất mọi thời đại, cảm biến 8000 DPI chuẩn xác, hệ thống đèn LED sóng màu Lightsync RGB 16.8 triệu màu đẹp mắt.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
    ],
    soldCount: 6500,
    ratingAvg: 4.8,
    ratingCount: 1450,
    variants: [
      ['Đen / Black', 390000, 150, 'LOG-G102-BLK'],
      ['Trắng / White', 390000, 100, 'LOG-G102-WHT']
    ]
  },
  {
    name: 'Chuột gaming Razer DeathAdder V3 Pro',
    category: 'Phụ kiện',
    brand: 'Razer',
    shopName: 'GearVN Pro Gaming',
    description: 'Kiểu dáng công thái học tối thượng được tinh chỉnh cùng các pro player eSports, trọng lượng siêu nhẹ 63g, cảm biến quang học Focus Pro 30K siêu chuẩn.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1350,
    ratingAvg: 4.9,
    ratingCount: 310,
    variants: [
      ['Đen / Black', 2990000, 35, 'RZ-DA-V3P-BLK'],
      ['Trắng / White', 3090000, 25, 'RZ-DA-V3P-WHT']
    ]
  },
  {
    name: 'Chuột gaming Razer Viper V3 Pro',
    category: 'Phụ kiện',
    brand: 'Razer',
    shopName: 'GearVN Pro Gaming',
    description: 'Chuột đối xứng đối xứng nhẹ nhất chỉ 54g, hỗ trợ polling rate không dây thực tế 8000Hz (HyperPolling Wireless Dongle đi kèm sẵn trong hộp).',
    images: [
      'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.9,
    ratingCount: 205,
    variants: [
      ['Đen / 8000Hz 54g', 3890000, 25, 'RZ-VIPER-V3P-BLK']
    ]
  },
  {
    name: 'Bàn phím cơ không dây Logitech MX Mechanical',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'An Phát Computer',
    description: 'Bàn phím cơ low-profile thanh lịch cho lập trình viên, switch cơ học gõ êm ái, đèn nền thông minh tự động sáng khi đưa tay lại gần và thời lượng pin 10 tháng.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 950,
    ratingAvg: 4.8,
    ratingCount: 210,
    variants: [
      ['Bản Full-size / Tactile Quiet Switch', 3490000, 30, 'LOG-MXMECH-FULL'],
      ['Bản Mini 75% / Tactile Quiet Switch', 3190000, 25, 'LOG-MXMECH-MINI']
    ]
  },
  {
    name: 'Bàn phím cơ gaming Logitech G915 LIGHTSPEED Wireless',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'GearVN Pro Gaming',
    description: 'Đỉnh cao bàn phím cơ siêu mỏng nhôm phay xước hàng không, switch GL cơ học siêu nhạy, kết nối LIGHTSPEED 1ms không dây độ trễ bằng 0.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 820,
    ratingAvg: 4.8,
    ratingCount: 180,
    variants: [
      ['Bản TKL Không Dây / GL Tactile', 4490000, 25, 'LOG-G915-TKL-TAC']
    ]
  },
  {
    name: 'Bàn phím cơ Razer Huntsman V3 Pro Tenkeyless',
    category: 'Phụ kiện',
    brand: 'Razer',
    shopName: 'GearVN Pro Gaming',
    description: 'Switch quang học Analog Gen-2 cho phép tùy chỉnh hành trình nhận phím từ 0.1mm đến 4.0mm, tính năng Rapid Trigger nhấp nhả phím di chuyển thần tốc trong Valorant và CS2.',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 710,
    ratingAvg: 4.9,
    ratingCount: 165,
    variants: [
      ['Bản TKL / Switch Analog Gen-2', 5490000, 20, 'RZ-HUNTS-V3P-TKL']
    ]
  },
  {
    name: 'Bàn phím cơ Corsair K70 RGB PRO',
    category: 'Phụ kiện',
    brand: 'Corsair',
    shopName: 'GearVN Pro Gaming',
    description: 'Khung nhôm anode đen cao cấp, switch cơ học Cherry MX Red chính hãng từ Đức, công nghệ xử lý siêu tốc CORSAIR AXON polling rate 8000Hz.',
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1250,
    ratingAvg: 4.8,
    ratingCount: 280,
    variants: [
      ['Fullsize / Cherry MX Red', 3290000, 35, 'COR-K70-PRO-RED']
    ]
  },
  {
    name: 'Bàn phím cơ SteelSeries Apex Pro TKL',
    category: 'Phụ kiện',
    brand: 'SteelSeries',
    shopName: 'GearVN Pro Gaming',
    description: 'Bàn phím cơ nhanh nhất thế giới với switch từ tính OmniPoint 2.0 HyperMagnetic, màn hình thông minh OLED Smart Display hiển thị thông số CPU/GPU và thông báo Discord.',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 650,
    ratingAvg: 4.9,
    ratingCount: 145,
    variants: [
      ['Bản TKL / OmniPoint 2.0 Switch', 4890000, 20, 'SS-APEX-PRO-TKL']
    ]
  },
  {
    name: 'Màn hình Gaming LG UltraGear 27GR95QE OLED 240Hz',
    category: 'Phụ kiện',
    brand: 'LG',
    shopName: 'GearVN Pro Gaming',
    description: 'Màn hình 27 inch tấm nền OLED độ phân giải 2K QHD, tốc độ phản hồi siêu thực 0.03ms (GtG), tần số quét 240Hz mượt mà và độ tương phản vô cực 1.500.000:1.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 420,
    ratingAvg: 4.9,
    ratingCount: 98,
    variants: [
      ['27 inch 2K OLED 240Hz', 18990000, 15, 'LG-27GR95QE-OLED']
    ]
  },
  {
    name: 'Màn hình Gaming ASUS ROG Swift OLED PG27AQDM',
    category: 'Phụ kiện',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Trang bị tản nhiệt tùy chỉnh độc quyền chống hiện tượng lưu ảnh burn-in, độ sáng tối đa 1000 nits, chuẩn màu 99% DCI-P3 và chân đế ROG phong cách cơ giáp.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 310,
    ratingAvg: 5.0,
    ratingCount: 75,
    variants: [
      ['27 inch 2K QHD OLED 240Hz', 22990000, 12, 'ROG-PG27AQDM']
    ]
  },
  {
    name: 'Màn hình đồ họa Dell UltraSharp U2724D',
    category: 'Phụ kiện',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Màn hình chuẩn đồ họa chuyên nghiệp đầu tiên trang bị công nghệ tấm nền IPS Black độ tương phản 2000:1, tần số quét nâng cấp 120Hz mượt mắt và cảm biến tự động điều chỉnh ánh sáng môi trường.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.9,
    ratingCount: 380,
    variants: [
      ['27 inch 2K IPS Black 120Hz', 10490000, 30, 'DELL-U2724D']
    ]
  },
  {
    name: 'Màn hình văn phòng Dell P2422H 24 inch',
    category: 'Phụ kiện',
    brand: 'Dell',
    shopName: 'An Phát Computer',
    description: 'Màn hình công thái học xoay dọc 90 độ, chân đế điều chỉnh đa hướng linh hoạt, công nghệ ComfortView Plus giảm ánh sáng xanh có hại mà không làm sai lệch màu sắc.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 4200,
    ratingAvg: 4.8,
    ratingCount: 890,
    variants: [
      ['23.8 inch Full HD IPS 60Hz', 3890000, 60, 'DELL-P2422H']
    ]
  },
  {
    name: 'Màn hình cong Gaming Samsung Odyssey G7 32 inch',
    category: 'Phụ kiện',
    brand: 'Samsung',
    shopName: 'GearVN Pro Gaming',
    description: 'Độ cong hoàn hảo 1000R ôm trọn tầm nhìn mắt người, độ phân giải 2K QHD, tấm nền QLED chấm lượng tử màu sắc rực rỡ và tần số quét 240Hz 1ms.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 560,
    ratingAvg: 4.8,
    ratingCount: 125,
    variants: [
      ['32 inch 2K Cong 1000R 240Hz', 12490000, 18, 'SS-ODYSSEY-G7-32']
    ]
  },
  {
    name: 'Tay cầm chơi game không dây Microsoft Xbox Wireless Controller',
    category: 'Phụ kiện',
    brand: 'Microsoft',
    shopName: 'GearVN Pro Gaming',
    description: 'Tay cầm chơi game PC/Xbox tốt nhất thế giới với bề mặt nhám bám tay chống trượt, nút D-pad lai chính xác và công nghệ rung phản hồi cò súng Impulse Triggers chân thực.',
    images: [
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2800,
    ratingAvg: 4.9,
    ratingCount: 650,
    variants: [
      ['Màu Đen Carbon / Black', 1450000, 50, 'XB-CTRL-BLK'],
      ['Màu Trắng Robot / White', 1450000, 45, 'XB-CTRL-WHT'],
      ['Màu Đỏ Pulse Red', 1550000, 30, 'XB-CTRL-RED']
    ]
  },
  {
    name: 'Webcam Logitech Brio 4K Ultra HD',
    category: 'Phụ kiện',
    brand: 'Logitech',
    shopName: 'An Phát Computer',
    description: 'Webcam cao cấp ghi hình 4K HDR siêu sắc nét, tự động cân bằng ánh sáng RightLight 3, góc quay tùy chỉnh 65/78/90 độ và hỗ trợ mở khóa khuôn mặt Windows Hello.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 940,
    ratingAvg: 4.8,
    ratingCount: 215,
    variants: [
      ['Đen 4K Ultra HD', 3990000, 25, 'LOG-BRIO-4K']
    ]
  },

  // =========================================================================
  // NHÓM G: THIẾT BỊ MẠNG VÀ PHỤ KIỆN (18 SẢN PHẨM)
  // =========================================================================
  {
    name: 'Router Wi-Fi 7 TP-Link Archer BE800 Tri-Band',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'TP-Link',
    shopName: 'Phong Vũ Digital',
    description: 'Tốc độ không tưởng 19 Gbps 3 băng tần Wi-Fi 7, trang bị 2 cổng 10G WAN/LAN và 4 cổng 2.5G LAN, màn hình ma trận LED hiển thị thời tiết biểu tượng cảm xúc độc đáo.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 180,
    ratingAvg: 4.9,
    ratingCount: 45,
    variants: [
      ['Wi-Fi 7 19Gbps / 2 Cổng 10G', 11990000, 10, 'TPL-BE800-10G']
    ]
  },
  {
    name: 'Hệ thống Mesh Wi-Fi 6 TP-Link Deco X50 (Bộ 3 pack)',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'TP-Link',
    shopName: 'Phong Vũ Digital',
    description: 'Phủ sóng toàn diện ngôi nhà lên đến 600m² loại bỏ hoàn toàn vùng góc chết sóng Wi-Fi, chuyển vùng mượt mà Seamless Roaming tự động kết nối nốt mạng mạnh nhất.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1100,
    ratingAvg: 4.9,
    ratingCount: 260,
    variants: [
      ['Bộ 3 Thiết Bị (3-pack) AX3000', 4490000, 30, 'TPL-DECO-X50-3PK'],
      ['Bộ 2 Thiết Bị (2-pack) AX3000', 3190000, 25, 'TPL-DECO-X50-2PK']
    ]
  },
  {
    name: 'Router Wi-Fi 6 ASUS RT-AX88U Pro Gaming',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'ASUS',
    shopName: 'GearVN Pro Gaming',
    description: 'Router chuyên trị ping cao cho game thủ với 2 cổng mạng 2.5Gbps, công nghệ tăng tốc game chuyên dụng Mobile Game Mode và bảo mật trọn đời ASUS AiProtection Pro.',
    images: [
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 390,
    ratingAvg: 4.9,
    ratingCount: 95,
    variants: [
      ['Dual-Band AX6000 2 Cổng 2.5G', 7290000, 15, 'ASUS-RTAX88U-PRO']
    ]
  },
  {
    name: 'Router Wi-Fi 6 TP-Link Archer AX73',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'TP-Link',
    shopName: 'Phong Vũ Digital',
    description: 'Tốc độ chuẩn AX5400 với 6 ăng-ten ngoài độ lợi cao công nghệ Beamforming tập trung tín hiệu, hỗ trợ tới 200 thiết bị kết nối ổn định đồng thời.',
    images: [
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1850,
    ratingAvg: 4.8,
    ratingCount: 410,
    variants: [
      ['Băng Tần Kép AX5400 6 Ăng-ten', 2290000, 45, 'TPL-ARCHER-AX73']
    ]
  },
  {
    name: 'Củ sạc nhanh Anker Prime 100W GaN 3 cổng',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Anker',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Công nghệ GaNPrime tối tân thu nhỏ kích thước 43%, kiểm soát nhiệt độ thời gian thực ActiveShield 2.0, công suất 100W sạc nhanh cùng lúc MacBook, iPhone và iPad.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2600,
    ratingAvg: 4.9,
    ratingCount: 580,
    variants: [
      ['Màu Đen / 2 Type-C + 1 USB-A', 1450000, 50, 'ANK-PRIME-100W']
    ]
  },
  {
    name: 'Củ sạc Anker 735 65W GaNPrime',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Anker',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Củ sạc du lịch bỏ túi bán chạy nhất với 3 cổng ra (2C1A), tự động phân bổ nguồn điện thông minh PowerIQ 4.0 và chân gập tiện dụng.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3800,
    ratingAvg: 4.9,
    ratingCount: 820,
    variants: [
      ['Đen / 65W 3 Cổng', 890000, 70, 'ANK-735-65W-BLK'],
      ['Trắng / 65W 3 Cổng', 890000, 50, 'ANK-735-65W-WHT']
    ]
  },
  {
    name: 'Pin dự phòng Anker 737 Power Bank 24000mAh 140W',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Anker',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Quái vật sạc dự phòng tích hợp màn hình màu kỹ thuật số hiển thị chi tiết công suất dòng điện và thời gian nạp đầy, công suất đầu ra siêu khủng 140W sạc được cả MacBook Pro 16.',
    images: [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 5.0,
    ratingCount: 390,
    variants: [
      ['Dung lượng 24000mAh / 140W', 2290000, 35, 'ANK-737-140W']
    ]
  },
  {
    name: 'Pin dự phòng Baseus Blade 100W Siêu mỏng 20000mAh',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Baseus',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Thiết kế dẹt siêu mỏng chỉ 18mm dễ dàng đút vừa balo túi chống sốc laptop, công suất chuẩn PD 100W và màn hình LED hiển thị % pin sắc nét.',
    images: [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2100,
    ratingAvg: 4.8,
    ratingCount: 450,
    variants: [
      ['Đen Nhám / 100W 20000mAh', 1190000, 55, 'BAS-BLADE-100W']
    ]
  },
  {
    name: 'Củ sạc UGREEN Nexode Pro 160W 4 cổng GaN',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'UGREEN',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Trạm sạc bàn làm việc chuyên nghiệp công suất tối đa 160W, cổng C1 hỗ trợ chuẩn sạc PD 3.1 140W siêu tốc cho laptop cao cấp, thiết kế nguyên khối xám titan hiện đại.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 920,
    ratingAvg: 4.9,
    ratingCount: 210,
    variants: [
      ['Xám Titan / 3 Type-C + 1 USB-A', 1890000, 35, 'UGR-NEXODE-160W']
    ]
  },
  {
    name: 'Củ sạc nhanh UGREEN 65W GaN Robot Nexode',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'UGREEN',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Thiết kế hình chú robot siêu dễ thương với màn hình LED hiển thị biểu cảm khuôn mặt tương ứng trạng thái sạc pin, chân đế bảo vệ tháo rời nam châm.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 4500,
    ratingAvg: 4.9,
    ratingCount: 980,
    variants: [
      ['Robot Màu Đen / 65W', 690000, 70, 'UGR-ROBOT-65W-BLK'],
      ['Robot Màu Tím / 65W', 690000, 60, 'UGR-ROBOT-65W-PUR']
    ]
  },
  {
    name: 'Hub chuyển đổi UGREEN Revodok Pro 9 trong 1 USB-C Dual 4K',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'UGREEN',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Bộ mở rộng cổng đa năng xuất 2 màn hình 4K 60Hz độc lập qua HDMI, tích hợp cổng mạng Gigabit LAN, cổng sạc PD 100W và đầu đọc thẻ SD/TF tốc độ cao.',
    images: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1750,
    ratingAvg: 4.8,
    ratingCount: 390,
    variants: [
      ['Vỏ Nhôm Không Gian / 9 in 1', 1190000, 50, 'UGR-HUB-9IN1']
    ]
  },
  {
    name: 'Cáp sạc UGREEN USB-C to USB-C 100W Bọc dù 2m',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'UGREEN',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Chịu tải công suất 100W 5A tích hợp chip E-Marker an toàn, bọc dù nylon bện mật độ cao chống gãy gập hơn 15000 lần uốn cong.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 5200,
    ratingAvg: 4.9,
    ratingCount: 1100,
    variants: [
      ['Dài 1 mét / 100W', 99000, 150, 'UGR-C2C-100W-1M'],
      ['Dài 2 mét / 100W', 149000, 120, 'UGR-C2C-100W-2M']
    ]
  },
  {
    name: 'Cáp sạc Belkin BoostCharge Pro Flex USB-C to Lightning 1m',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Belkin',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Chứng nhận Apple MFi tuyệt đối an toàn cho iPhone/iPad, cấu trúc dây bện silicone kép chống rối chống gãy và kèm dây nam châm kẹp bàn tiện dụng.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1980,
    ratingAvg: 4.8,
    ratingCount: 420,
    variants: [
      ['Màu Trắng / 1 mét', 390000, 60, 'BELK-C2L-1M-WHT'],
      ['Màu Đen / 1 mét', 390000, 50, 'BELK-C2L-1M-BLK']
    ]
  },
  {
    name: 'Đế sạc không dây 3 in 1 Belkin BoostCharge Pro MagSafe 15W',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Belkin',
    shopName: 'Phụ Kiện Chính Hãng UGREEN & Anker',
    description: 'Trạm sạc cao cấp chính thức chuẩn Made for MagSafe 15W, nạp điện đồng thời cho iPhone, Apple Watch Fast Charging và tai nghe AirPods.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 620,
    ratingAvg: 4.9,
    ratingCount: 140,
    variants: [
      ['Màu Đen Nhám / 15W 3in1', 3490000, 20, 'BELK-3IN1-MAG-BLK'],
      ['Màu Trắng Sứ / 15W 3in1', 3490000, 25, 'BELK-3IN1-MAG-WHT']
    ]
  },
  {
    name: 'Ổ cứng di động SSD Kingston XS1000 1TB USB 3.2 Gen 2',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'Kingston',
    shopName: 'Phong Vũ Digital',
    description: 'Ổ cứng SSD ngoài nhỏ nhất thế giới nằm gọn trong lòng bàn tay, nặng chỉ 29g, tốc độ đọc nhanh như chớp 1050 MB/s sao chép video 4K trong vài giây.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1450,
    ratingAvg: 4.8,
    ratingCount: 310,
    variants: [
      ['Dung lượng 1TB / USB 3.2 Gen 2', 1990000, 45, 'SSD-EXT-KING-1TB'],
      ['Dung lượng 2TB / USB 3.2 Gen 2', 3490000, 25, 'SSD-EXT-KING-2TB']
    ]
  },
  {
    name: 'Ổ cứng di động SSD SanDisk Extreme Portable 1TB V2',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'SanDisk',
    shopName: 'Phong Vũ Digital',
    description: 'Vỏ bọc cao su chống va đập rơi từ độ cao 2 mét, kháng nước bụi IP55, tốc độ 1050 MB/s, kèm móc treo carabiner tiện lợi cho các nhiếp ảnh gia du lịch.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 2200,
    ratingAvg: 4.9,
    ratingCount: 490,
    variants: [
      ['Dung lượng 1TB SanDisk Extreme', 2390000, 50, 'SSD-EXT-SANDISK-1TB'],
      ['Dung lượng 2TB SanDisk Extreme', 4190000, 30, 'SSD-EXT-SANDISK-2TB']
    ]
  },
  {
    name: 'USB 3.2 SanDisk Ultra Dual Drive Luxe Type-C 128GB',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'SanDisk',
    shopName: 'Phong Vũ Digital',
    description: 'Thiết kế 2 đầu cắm xoay vỏ kim loại nguyên khối (1 đầu Type-C cho điện thoại và 1 đầu USB-A truyền thống cho máy tính), tốc độ đọc 400 MB/s.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 4800,
    ratingAvg: 4.8,
    ratingCount: 940,
    variants: [
      ['Dung lượng 128GB Kim Loại', 349000, 100, 'USB-SANDISK-128G'],
      ['Dung lượng 256GB Kim Loại', 589000, 60, 'USB-SANDISK-256G']
    ]
  },
  {
    name: 'Switch mạng TP-Link TL-SG108 8 cổng Gigabit',
    category: 'Thiết bị mạng & Phụ kiện',
    brand: 'TP-Link',
    shopName: 'Phong Vũ Digital',
    description: 'Bộ chia mạng 8 cổng 10/100/1000Mbps vỏ sắt tản nhiệt bền bỉ, hỗ trợ tính năng tự động đàm phán Auto-MDI/MDIX và công nghệ tiết kiệm điện Green Ethernet.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.8,
    ratingCount: 320,
    variants: [
      ['Vỏ Thép 8 Cổng 1000Mbps', 520000, 50, 'TPL-SG108-8P']
    ]
  },

  // =========================================================================
  // NHÓM H: THIẾT BỊ THÔNG MINH VÀ CÔNG NGHỆ KHÁC (12 SẢN PHẨM)
  // =========================================================================
  {
    name: 'Đồng hồ Apple Watch Series 10 46mm GPS Viền nhôm',
    category: 'Thiết bị thông minh',
    brand: 'Apple',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Mẫu Apple Watch mỏng nhất từng có với màn hình OLED góc nhìn rộng sáng hơn 40%, phát hiện hội chứng ngưng thở khi ngủ, cảm biến đo độ sâu nước và sạc nhanh 80% chỉ trong 30 phút.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 920,
    ratingAvg: 4.9,
    ratingCount: 215,
    variants: [
      ['Đen bóng Jet Black / 46mm GPS', 11490000, 30, 'AW-S10-46-JET'],
      ['Vàng hồng Rose Gold / 42mm GPS', 10490000, 25, 'AW-S10-42-RSG']
    ]
  },
  {
    name: 'Đồng hồ Apple Watch Ultra 2 49mm Dây Ocean',
    category: 'Thiết bị thông minh',
    brand: 'Apple',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Chiếc đồng hồ thể thao dã ngoại đỉnh cao làm từ vỏ Titan đen mới, độ sáng màn hình kỷ lục 3000 nits, GPS tần số kép L1+L5 chính xác tuyệt đối và pin 72 giờ ở chế độ tiết kiệm pin.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 450,
    ratingAvg: 5.0,
    ratingCount: 110,
    variants: [
      ['Titan Đen Mới / 49mm Cellular Dây Ocean', 21490000, 15, 'AW-ULTRA2-49-BLK']
    ]
  },
  {
    name: 'Đồng hồ Samsung Galaxy Watch7 44mm Bluetooth',
    category: 'Thiết bị thông minh',
    brand: 'Samsung',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Chip 3nm đầu tiên trên smartwatch, cảm biến BioActive Sensor 13 bóng LED đo chỉ số AGEs đánh giá lão hóa sinh học, GPS kép L1/L5 theo dõi tập luyện ngoài trời chuẩn xác.',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 780,
    ratingAvg: 4.8,
    ratingCount: 175,
    variants: [
      ['Xanh Quân Đội / 44mm Bluetooth', 6990000, 35, 'SS-WATCH7-44-GRN'],
      ['Bạc Bạc / 40mm Bluetooth', 6290000, 25, 'SS-WATCH7-40-SLV']
    ]
  },
  {
    name: 'Đồng hồ Samsung Galaxy Watch Ultra 47mm LTE',
    category: 'Thiết bị thông minh',
    brand: 'Samsung',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Thiết kế Cushion đệm gối Titan cấp 4 siêu bền chịu nhiệt độ từ -20°C đến 55°C, còi báo động khẩn cấp Siren 86dB, khả năng chống nước 10 ATM và pin lên đến 100 giờ.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 310,
    ratingAvg: 4.9,
    ratingCount: 75,
    variants: [
      ['Xám Titan / 47mm LTE', 14990000, 15, 'SS-WATCH-ULTRA-47']
    ]
  },
  {
    name: 'Đồng hồ thể thao Garmin Fenix 7 Pro Solar',
    category: 'Thiết bị thông minh',
    brand: 'Garmin',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Đồng hồ sinh tồn cao cấp thấu kính sạc năng lượng mặt trời Power Glass pin tới 37 ngày, đèn pin LED siêu sáng tích hợp trên thân vỏ, bản đồ địa hình Topo đa lục địa chi tiết.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 420,
    ratingAvg: 5.0,
    ratingCount: 98,
    variants: [
      ['Bản Thép Đen 47mm Kèm Solar', 17490000, 15, 'GAR-FENIX7P-SOL']
    ]
  },
  {
    name: 'Đồng hồ chạy bộ Garmin Forerunner 265',
    category: 'Thiết bị thông minh',
    brand: 'Garmin',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Màn hình cảm ứng AMOLED rực rỡ, chỉ số sẵn sàng luyện tập Training Readiness, động lực học chạy bộ Running Dynamics trên cổ tay và hỗ trợ phát nhạc trực tiếp không cần điện thoại.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 890,
    ratingAvg: 4.9,
    ratingCount: 195,
    variants: [
      ['Màu Đen Khói / 46mm', 10990000, 25, 'GAR-FR265-BLK']
    ]
  },
  {
    name: 'Vòng đeo tay thông minh Xiaomi Smart Band 9',
    category: 'Thiết bị thông minh',
    brand: 'Xiaomi',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Khung viền kim loại sang trọng nhiều màu sắc trẻ trung, màn hình AMOLED 1.62 inch độ sáng 1200 nits, cảm biến nhịp tim nâng cấp độ chính xác 16% và thời lượng pin 21 ngày.',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 5200,
    ratingAvg: 4.8,
    ratingCount: 1100,
    variants: [
      ['Đen Huyền Bí / Dây TPU', 890000, 100, 'MI-BAND9-BLK'],
      ['Hồng Bạc Hà / Dây TPU', 890000, 80, 'MI-BAND9-PNK']
    ]
  },
  {
    name: 'Camera an ninh trong nhà TP-Link Tapo C220 2K QHD 360 độ',
    category: 'Thiết bị thông minh',
    brand: 'TP-Link',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Độ phân giải 2K 4MP siêu nét quay quét ngang 360 độ dọc 114 độ, phát hiện người và thú cưng thông minh bằng AI, nhìn đêm có màu và đàm thoại 2 chiều to rõ.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 3400,
    ratingAvg: 4.8,
    ratingCount: 720,
    variants: [
      ['Camera Tapo C220 4MP', 649000, 80, 'TPL-TAPO-C220']
    ]
  },
  {
    name: 'Camera an ninh ngoài trời Xiaomi Outdoor Camera CW400',
    category: 'Thiết bị thông minh',
    brand: 'Xiaomi',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Chuẩn chống nước bụi ngoài trời IP66 bền bỉ dưới mọi thời tiết, cảm biến 4MP 2.5K kèm 4 đèn LED quan sát ban đêm có màu sắc nét, ăng-ten kép thu sóng Wi-Fi xa.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1650,
    ratingAvg: 4.8,
    ratingCount: 340,
    variants: [
      ['Camera CW400 Ngoài Trời', 990000, 45, 'MI-CAM-CW400']
    ]
  },
  {
    name: 'Máy đọc sách Amazon Kindle Paperwhite 5 (16GB)',
    category: 'Thiết bị thông minh',
    brand: 'Amazon',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Màn hình E-Ink Carta 1200 kích thước 6.8 inch 300 PPI đọc êm mắt như giấy thật, đèn nền ánh sáng vàng ấm có thể điều chỉnh, kháng nước chuẩn IPX8 và pin 10 tuần.',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 1980,
    ratingAvg: 4.9,
    ratingCount: 460,
    variants: [
      ['Màu Đen / 16GB USB-C', 3590000, 40, 'AMZ-KINDLE-PW5-16G'],
      ['Màu Xanh Agave / 16GB', 3690000, 25, 'AMZ-KINDLE-PW5-BLU']
    ]
  },
  {
    name: 'Máy chiếu mini thông minh Samsung The Freestyle Gen 2',
    category: 'Thiết bị thông minh',
    brand: 'Samsung',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Máy chiếu di động xoay 180 độ chiếu mọi mặt phẳng từ tường lên trần nhà, tự động căn chỉnh góc vuông và lấy nét thông minh, loa 360 độ và tích hợp hệ điều hành Smart TV.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 290,
    ratingAvg: 4.8,
    ratingCount: 68,
    variants: [
      ['Bản Gen 2 Kèm Gaming Hub', 10990000, 15, 'SS-FREESTYLE-G2']
    ]
  },
  {
    name: 'Thiết bị phát hình thông minh Google TV Streamer 4K',
    category: 'Thiết bị thông minh',
    brand: 'Google',
    shopName: 'SmartHome & Gadgets Hub',
    description: 'Thiết bị phát trực tuyến 4K HDR Dolby Vision kiêm trung tâm điều khiển nhà thông minh Matter & Thread, bộ nhớ nâng cấp 32GB, điều khiển từ xa có tính năng bấm chuông tìm kiếm.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    soldCount: 780,
    ratingAvg: 4.9,
    ratingCount: 180,
    variants: [
      ['Màu Trắng Sứ Porcelain / 4K', 2790000, 30, 'GG-TV-STREAMER-4K']
    ]
  }
];

// Xuất file demoProductsList.js
const targetFile = path.join(__dirname, 'demoProductsList.js');
const fileContent = `// Danh sách 162 sản phẩm chi tiết cho 8 nhóm ngành hàng TECHSTORE
export const DEMO_PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log(`[buildProducts] Đã xuất thành công ${PRODUCTS.length} sản phẩm ra: ${targetFile}`);
