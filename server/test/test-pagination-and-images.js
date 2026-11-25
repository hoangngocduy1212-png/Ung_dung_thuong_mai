async function runTests() {
  const base = process.env.API_BASE_URL || 'http://localhost:5000/api';
  let passCount = 0;
  let failCount = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASS: ${msg}`);
      passCount++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failCount++;
    }
  }

  console.log('======================================================');
  console.log('▶ 1. KIỂM THỬ TẤT CẢ CÁC TRANG (PAGINATION ACROSS ALL 14 PAGES)');
  console.log('======================================================');

  const allProductIds = new Set();
  let totalReported = 0;
  let totalPagesReported = 0;

  for (let p = 1; p <= 14; p++) {
    const res = await (await fetch(`${base}/products?page=${p}&limit=12`)).json();
    totalReported = res.total;
    totalPagesReported = res.totalPages;

    assert(res.page === p, `Trang ${p}: trường "page" trả về đúng ${p}`);
    assert(res.items.length > 0, `Trang ${p}: có sản phẩm (${res.items.length} SP)`);

    for (const item of res.items) {
      if (allProductIds.has(item._id)) {
        assert(false, `Trùng lặp sản phẩm [${item.name}] tại trang ${p}`);
      } else {
        allProductIds.add(item._id);
      }
    }
  }

  assert(allProductIds.size === totalReported, `Tổng sản phẩm duy nhất quét qua 14 trang (${allProductIds.size}) khớp chính xác với total (${totalReported})`);
  assert(totalPagesReported === 14, `Tổng số trang tính toán chính xác là 14 trang`);

  console.log('\n======================================================');
  console.log('▶ 2. KIỂM THỬ CÁC TRƯỜNG HỢP BIÊN (BOUNDARY CONDITIONS)');
  console.log('======================================================');

  // Page 0 / negative
  const p0 = await (await fetch(`${base}/products?page=0&limit=12`)).json();
  assert(p0.page === 1, 'Truy vấn page=0 tự động chuẩn hóa về page=1 an toàn');

  const pNeg = await (await fetch(`${base}/products?page=-5&limit=12`)).json();
  assert(pNeg.page === 1, 'Truy vấn page âm tự động chuẩn hóa về page=1 an toàn');

  // Page out of bounds
  const pOver = await (await fetch(`${base}/products?page=999&limit=12`)).json();
  assert(pOver.items.length === 0, 'Truy vấn page=999 vượt ngưỡng trả về mảng rỗng [] không crash');
  assert(pOver.total === totalReported, 'Total vẫn giữ nguyên chính xác khi vượt trang');

  console.log('\n======================================================');
  console.log('▶ 3. KIỂM THỬ KẾT HỢP BỘ LỌC VÀ PHÂN TRANG (FILTER + PAGINATION)');
  console.log('======================================================');

  // Filter Brand Apple (23 items -> 2 pages: 12 + 11)
  const brands = await (await fetch(`${base}/brands`)).json();
  const apple = brands.find((b) => b.name === 'Apple');
  const appleP1 = await (await fetch(`${base}/products?brand=${apple._id}&page=1&limit=12`)).json();
  const appleP2 = await (await fetch(`${base}/products?brand=${apple._id}&page=2&limit=12`)).json();

  assert(appleP1.total === 23, 'Lọc Apple: tổng số sản phẩm là 23');
  assert(appleP1.totalPages === 2, 'Lọc Apple: tổng số trang là 2');
  assert(appleP1.items.length === 12, 'Lọc Apple trang 1: đủ 12 sản phẩm');
  assert(appleP2.items.length === 11, 'Lọc Apple trang 2: đủ 11 sản phẩm');

  // Check no duplicates between Apple page 1 & 2
  const appleIds = new Set(appleP1.items.map((i) => i._id));
  const hasOverlap = appleP2.items.some((i) => appleIds.has(i._id));
  assert(!hasOverlap, 'Lọc Apple: Không có sản phẩm nào bị lặp giữa trang 1 và trang 2');

  // Filter Category "Linh kiện PC" (26 items -> 3 pages: 12 + 12 + 2)
  const cats = await (await fetch(`${base}/categories`)).json();
  const pcCat = cats.find((c) => c.name === 'Linh kiện PC');
  const pcP1 = await (await fetch(`${base}/products?category=${pcCat._id}&page=1&limit=12`)).json();
  const pcP2 = await (await fetch(`${base}/products?category=${pcCat._id}&page=2&limit=12`)).json();
  const pcP3 = await (await fetch(`${base}/products?category=${pcCat._id}&page=3&limit=12`)).json();

  assert(pcP1.total === 26, 'Lọc Linh kiện PC: tổng số 26 sản phẩm (kèm các danh mục con)');
  assert(pcP1.totalPages === 3, 'Lọc Linh kiện PC: tổng số 3 trang');
  assert(pcP1.items.length === 12, 'Linh kiện PC trang 1: 12 sản phẩm');
  assert(pcP2.items.length === 12, 'Linh kiện PC trang 2: 12 sản phẩm');
  assert(pcP3.items.length === 2, 'Linh kiện PC trang 3: 2 sản phẩm');

  console.log('\n======================================================');
  console.log('▶ 4. KIỂM THỬ SẮP XẾP ỔN ĐỊNH VÀ PHÂN TRANG (SORT STABILITY)');
  console.log('======================================================');

  // Sort price asc across page 1 and page 2
  const sortAsc1 = await (await fetch(`${base}/products?sort=price_asc&page=1&limit=12`)).json();
  const sortAsc2 = await (await fetch(`${base}/products?sort=price_asc&page=2&limit=12`)).json();

  const maxPriceP1 = Math.max(...sortAsc1.items.map((i) => i.minPrice));
  const minPriceP2 = Math.min(...sortAsc2.items.map((i) => i.minPrice));
  assert(maxPriceP1 <= minPriceP2, `Sắp xếp giá tăng dần ổn định: max(trang 1: ${maxPriceP1}đ) <= min(trang 2: ${minPriceP2}đ)`);

  const ascP1Ids = new Set(sortAsc1.items.map((i) => i._id));
  const ascOverlap = sortAsc2.items.some((i) => ascP1Ids.has(i._id));
  assert(!ascOverlap, 'Sắp xếp giá tăng dần: Không có sản phẩm trùng lặp qua ranh giới trang nhờ _id tie-breaker');

  // Sort price desc across page 1 and page 2
  const sortDesc1 = await (await fetch(`${base}/products?sort=price_desc&page=1&limit=12`)).json();
  const sortDesc2 = await (await fetch(`${base}/products?sort=price_desc&page=2&limit=12`)).json();

  const minPriceDesc1 = Math.min(...sortDesc1.items.map((i) => i.minPrice));
  const maxPriceDesc2 = Math.max(...sortDesc2.items.map((i) => i.minPrice));
  assert(minPriceDesc1 >= maxPriceDesc2, `Sắp xếp giá giảm dần ổn định: min(trang 1: ${minPriceDesc1}đ) >= max(trang 2: ${maxPriceDesc2}đ)`);

  console.log('\n======================================================');
  console.log('▶ 5. KIỂM THỬ TÍNH TOÀN VẸN HÌNH ẢNH SẢN PHẨM (IMAGE INTEGRITY)');
  console.log('======================================================');

  // Verify first 20 products all have valid non-empty images array
  const sampleProds = (await (await fetch(`${base}/products?limit=20`)).json()).items;
  let allHaveImages = true;
  for (const sp of sampleProds) {
    if (!sp.images || sp.images.length === 0 || !sp.images[0].startsWith('http')) {
      allHaveImages = false;
      break;
    }
  }
  assert(allHaveImages, 'Tất cả sản phẩm mẫu đều có mảng images hợp lệ với URL HTTP(S)');

  console.log('\n======================================================');
  console.log(`TỔNG KẾT KIỂM THỬ: ${passCount} ĐẠT, ${failCount} THẤT BẠI`);
  console.log('======================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
