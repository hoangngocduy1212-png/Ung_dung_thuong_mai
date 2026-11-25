// Đánh giá mẫu chân thực của khách hàng cho các sản phẩm tiêu biểu
// Kèm phản hồi chính thức từ gian hàng

export const DEMO_REVIEWS = [
  {
    productName: 'iPhone 16 Pro Max 256GB',
    customerEmail: 'hoangnam@shop.local',
    variantName: 'Titan Sa Mạc / 256GB',
    rating: 5,
    content: 'Máy nguyên seal chính hãng VNA, màu titan sa mạc bên ngoài nhìn sang chảnh và tinh tế hơn nhiều so với trên ảnh. Shop giao hàng hỏa tốc trong 2 tiếng, đóng gói bọc xốp cẩn thận nhiều lớp. Chấm 10/10.',
    reply: 'Dạ TechZone Flagship Store xin chân thành cảm ơn anh Nam đã tin tưởng và ủng hộ gian hàng! Chúc anh có những trải nghiệm tuyệt vời cùng siêu phẩm iPhone 16 Pro Max ạ!'
  },
  {
    productName: 'iPhone 16 Pro Max 256GB',
    customerEmail: 'minhanh@shop.local',
    variantName: 'Titan Tự Nhiên / 256GB',
    rating: 5,
    content: 'Camera chụp zoom quang học 5x cực kỳ sắc nét, nút Camera Control bấm chụp rất tiện lợi khi đi du lịch. Pin trâu dùng cả ngày từ 7h sáng đến đêm vẫn còn 35%. Hàng xịn giá tốt.',
    reply: 'Cảm ơn bạn Minh Anh đã đánh giá chi tiết! Nếu cần hỗ trợ thêm thông tin về bảo hành và phụ kiện, bạn cứ nhắn tin cho shop nhé!'
  },
  {
    productName: 'Galaxy S24 Ultra 256GB',
    customerEmail: 'ducthang@shop.local',
    variantName: 'Xám titan / 256GB',
    rating: 5,
    content: 'Màn hình phẳng chống chói cực đỉnh dưới trời nắng gắt. Bút S-Pen tiện cho công việc ghi chú nhanh. Tính năng Galaxy AI dịch trực tiếp cuộc gọi và khoanh vùng tìm kiếm siêu mượt.',
    reply: 'Shop cảm ơn anh Thắng rất nhiều ạ! Chúc anh luôn gặt hái nhiều thành công trong công việc cùng S24 Ultra!'
  },
  {
    productName: 'MacBook Pro 14 inch M4',
    customerEmail: 'hoangnam@shop.local',
    variantName: 'Đen Không Gian / 16GB-512GB',
    rating: 5,
    content: 'Màu Đen Không Gian (Space Black) hạn chế bám vân tay rất tốt. Chip M4 render video 4K trong DaVinci Resolve và After Effects mượt mà không hề có tiếng quạt gió kêu. Màn hình Liquid Retina XDR 120Hz đẹp mê ly.',
    reply: 'TechZone cảm ơn anh Hoàng Nam đã tin tưởng lựa chọn MacBook Pro M4! Chúc anh sáng tạo thật nhiều sản phẩm tuyệt vời ạ!'
  },
  {
    productName: 'ASUS ROG Zephyrus G16',
    customerEmail: 'khach@shop.local',
    variantName: 'Xám Eclipse / Ultra 9 / RTX 4070 / 32GB / 1TB',
    rating: 5,
    content: 'Màn hình OLED 240Hz hiển thị màu sắc và độ tương phản đen tuyệt đối, chơi Cyberpunk 2077 bật Ray Tracing max setting vẫn mượt mà trên 90 FPS. Vỏ nhôm CNC mỏng nhẹ bất ngờ đối với một cỗ máy gaming đỉnh cao.',
    reply: 'GearVN cảm ơn anh Khách đã để lại đánh giá tâm huyết! Chúc anh có những giờ phút gaming và làm việc thăng hoa!'
  },
  {
    productName: 'Card màn hình ASUS ROG Strix GeForce RTX 4090 24GB',
    customerEmail: 'ducthang@shop.local',
    variantName: 'Bản OC 24GB GDDR6X',
    rating: 5,
    content: 'Quái vật đồ họa thực thụ! Cụm tản nhiệt 3.5 slot cực kỳ nạc và đầm tay, nhiệt độ chơi game full load không bao giờ quá 65 độ C. LED Aura Sync đồng bộ lung linh với case.',
    reply: 'GearVN Pro Gaming cảm ơn anh Thắng! Đây đúng là đỉnh cao phân khúc enthusiast, chúc anh tận hưởng tối đa sức mạnh của cỗ máy đồ họa này!'
  },
  {
    productName: 'Tai nghe Sony WH-1000XM5 chống ồn cao cấp',
    customerEmail: 'minhanh@shop.local',
    variantName: 'Bạc Bạch Kim / Silver',
    rating: 5,
    content: 'Khả năng chống ồn chủ động (ANC) quá ấn tượng, đeo vào khi đi máy bay hay ngồi quán cafe ồn ào là như lạc vào thế giới riêng. Đệm tai bằng da mềm mại, đeo liên tục 5-6 tiếng không bị đau vành tai.',
    reply: 'Cellphones cảm ơn bạn Minh Anh! Rất vui vì XM5 đã đồng hành cùng bạn trong công việc và thư giãn!'
  },
  {
    productName: 'Chuột không dây Logitech MX Master 3S',
    customerEmail: 'hoangnam@shop.local',
    variantName: 'Xám Graphite / Black',
    rating: 5,
    content: 'Con lăn MagSpeed cuộn 1000 dòng/giây cực đã khi làm việc với file Excel và code dài. Click chuột gần như yên tĩnh tuyệt đối (Quiet Clicks), công thái học ôm trọn lòng bàn tay.',
    reply: 'Cảm ơn anh Nam đã dành lời khen cho MX Master 3S! Chúc anh nâng cao hiệu suất làm việc mỗi ngày!'
  },
  {
    productName: 'Bàn phím cơ không dây Logitech MX Mechanical',
    customerEmail: 'khach@shop.local',
    variantName: 'Bản Mini 75% / Tactile Quiet Switch',
    rating: 5,
    content: 'Switch gõ êm mượt, âm thanh xúc giác nhẹ nhàng không làm phiền đồng nghiệp trong văn phòng. Đèn nền thông minh tự sáng khi đưa tay lại gần. Kết nối Bolt + Bluetooth 3 thiết bị mượt mà.',
    reply: 'TechZone Flagship Store cảm ơn quý khách! Bàn phím công thái học cao cấp này sẽ giúp anh làm việc cả ngày không mỏi tay!'
  },
  {
    productName: 'Loa Bluetooth Marshall Stanmore III',
    customerEmail: 'minhanh@shop.local',
    variantName: 'Đen Cổ Điển / Black',
    rating: 5,
    content: 'Thiết kế vintage kinh điển để phòng khách cực kỳ sang trọng. Chất âm đặc trưng với âm trầm ấm áp, dải trung mộc mạc nghe Rock, Jazz và Acoustic xuất sắc.',
    reply: 'Cellphones cảm ơn bạn đã yêu thích chất âm của Marshall! Chúc bạn có những phút giây thư thái bên âm nhạc!'
  },
  {
    productName: 'Củ sạc UGREEN Nexode Pro 160W 4 cổng GaN',
    customerEmail: 'ducthang@shop.local',
    variantName: 'Xám Titan / 3 Type-C + 1 USB-A',
    rating: 5,
    content: 'Kích thước nhỏ gọn hơn củ sạc Apple 140W đơn cổng rất nhiều, sạc cùng lúc cả MacBook Pro, iPad và iPhone vẫn mát mẻ nhờ công nghệ GaNFast. Cầm đi công tác cực kỳ tiện.',
    reply: 'UGREEN cảm ơn anh Thắng! Cam kết bảo hành 1 đổi 1 trong 18 tháng lỗi là đổi mới, anh an tâm sử dụng ạ!'
  },
  {
    productName: 'Đồng hồ Apple Watch Series 10 46mm GPS Viền nhôm',
    customerEmail: 'hoangnam@shop.local',
    variantName: 'Đen bóng Jet Black / 46mm GPS',
    rating: 5,
    content: 'Màu Jet Black bóng bẩy cực đẹp gợi nhớ thời iPhone 7. Màn hình lớn hơn và mỏng hơn hẳn Series 9, góc nhìn nghiêng sáng hơn rõ rệt. Đo nồng độ oxy và phát hiện ngưng thở khi ngủ rất chính xác.',
    reply: 'SmartHome & Gadgets Hub cảm ơn anh Nam! Chúc anh luôn duy trì sức khỏe dẻo dai cùng Apple Watch Series 10!'
  },
  {
    productName: 'Đồng hồ thể thao Garmin Fenix 7 Pro Solar',
    customerEmail: 'khach@shop.local',
    variantName: 'Bản Thép Đen 47mm Kèm Solar',
    rating: 5,
    content: 'Kính sạc năng lượng mặt trời giúp pin dùng cả tuần khi đi trekking leo núi mà không cần mang theo sạc. Bản đồ Topo chi tiết, GPS đa băng tần bắt tín hiệu tức thì dù trong rừng rậm.',
    reply: 'SmartHome Hub cảm ơn anh! Garmin Fenix 7 Pro sinh ra là để chinh phục mọi cung đường cùng anh!'
  }
];
