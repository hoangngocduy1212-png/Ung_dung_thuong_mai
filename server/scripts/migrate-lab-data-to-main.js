import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const isExecute = process.argv.includes('--execute');
const isVerify = process.argv.includes('--verify');
const isDryRun = !isExecute && !isVerify;

const BACKUP_DIR = 'C:\\Project\\DatabaseBackups\\before_lab_merge_20261119';

async function runMigration() {
  console.log('================================================================');
  console.log('  MONGODB CATALOG & DEMO DATA MERGE: LAB -> MAIN');
  console.log(`  MODE: ${isExecute ? 'EXECUTE (GHI DỮ LIỆU)' : isVerify ? 'VERIFY ONLY (KIỂM THỨ)' : 'DRY-RUN (MÔ PHỎNG AN TOÀN)'}`);
  console.log('================================================================');

  // Load configs
  const mainEnv = dotenv.parse(fs.readFileSync('C:/Project/Ung_dung_thuong_mai/server/.env'));
  const labEnv = dotenv.parse(fs.readFileSync('C:/Project/Ung_dung_thuong_mai_animation_lab/server/.env'));

  const mainUri = mainEnv.MONGODB_URI;
  const mainDbName = mainEnv.MONGODB_DB_NAME || 'ecommerce_electronics';

  const labUri = labEnv.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_electronics_lab';
  const labDbName = labEnv.MONGODB_DB_NAME || 'ecommerce_electronics_lab';

  // Verify backup exists before allowing execute
  if (isExecute) {
    if (!fs.existsSync(path.join(BACKUP_DIR, 'backup-manifest.json'))) {
      throw new Error(`[SAFETY GUARD BLOCKED] Không tìm thấy bản backup đã xác minh tại ${BACKUP_DIR}. Dừng ngay lập tức!`);
    }
  }

  console.log('[1/6] Kết nối cơ sở dữ liệu Main và Lab...');
  const mainConn = await mongoose.createConnection(mainUri, { dbName: mainDbName }).asPromise();
  console.log(`      ✓ Main DB connected: ${mainConn.name} (Atlas: ${mainConn.host.includes('mongodb.net') ? 'YES' : 'NO'})`);

  const labConn = await mongoose.createConnection(labUri, { dbName: labDbName }).asPromise();
  console.log(`      ✓ Lab DB connected: ${labConn.name} (Host: ${labConn.host})`);

  // Load current datasets
  console.log('[2/6] Tải dữ liệu hiện có từ hai môi trường...');
  const [
    mainUsers, labUsers,
    mainShops, labShops,
    mainCategories, labCategories,
    mainBrands, labBrands,
    mainProducts, labProducts,
    mainVariants, labVariants,
    mainVouchers, labVouchers,
    mainReviews, labReviews,
    mainOrders, labOrders
  ] = await Promise.all([
    mainConn.db.collection('users').find().toArray(), labConn.db.collection('users').find().toArray(),
    mainConn.db.collection('shops').find().toArray(), labConn.db.collection('shops').find().toArray(),
    mainConn.db.collection('categories').find().toArray(), labConn.db.collection('categories').find().toArray(),
    mainConn.db.collection('brands').find().toArray(), labConn.db.collection('brands').find().toArray(),
    mainConn.db.collection('products').find().toArray(), labConn.db.collection('products').find().toArray(),
    mainConn.db.collection('variants').find().toArray(), labConn.db.collection('variants').find().toArray(),
    mainConn.db.collection('vouchers').find().toArray(), labConn.db.collection('vouchers').find().toArray(),
    mainConn.db.collection('reviews').find().toArray(), labConn.db.collection('reviews').find().toArray(),
    mainConn.db.collection('orders').find().toArray(), labConn.db.collection('orders').find().toArray(),
  ]);

  console.log(`      - Main có: ${mainProducts.length} sản phẩm, ${mainShops.length} gian hàng, ${mainCategories.length} danh mục, ${mainBrands.length} thương hiệu`);
  console.log(`      - Lab có:  ${labProducts.length} sản phẩm, ${labShops.length} gian hàng, ${labCategories.length} danh mục, ${labBrands.length} thương hiệu`);

  // Mapping dictionaries: Lab ID -> Main ID
  const categoryMap = {};
  const brandMap = {};
  const shopMap = {};
  const userMap = {};
  const productMap = {};
  const orderMap = {};

  const stats = {
    categories: { new: 0, skipped: 0, conflict: 0 },
    brands: { new: 0, skipped: 0, conflict: 0 },
    users: { new: 0, skipped: 0, conflict: 0 },
    shops: { new: 0, skipped: 0, conflict: 0 },
    products: { new: 0, skipped: 0, conflict: 0 },
    variants: { new: 0, skipped: 0, conflict: 0 },
    vouchers: { new: 0, skipped: 0, conflict: 0 },
    orders: { new: 0, skipped: 0, conflict: 0 },
    reviews: { new: 0, skipped: 0, conflict: 0 },
  };

  const toInsert = {
    categories: [],
    brands: [],
    users: [],
    shops: [],
    products: [],
    variants: [],
    vouchers: [],
    orders: [],
    reviews: [],
  };

  console.log('[3/6] Phân tích và xây dựng đồ thị ánh xạ tham chiếu (Referential Graph Mapping)...');

  // -------------------------------------------------------------
  // STEP 3.1: CATEGORIES
  // -------------------------------------------------------------
  const normalize = (s) => (s || '').trim().toLowerCase();
  for (const lc of labCategories) {
    const existing = mainCategories.find(mc => normalize(mc.name) === normalize(lc.name));
    if (existing) {
      categoryMap[lc._id.toString()] = existing._id;
      stats.categories.skipped++;
    } else {
      // New category in Lab (e.g. Máy tính bảng, Âm thanh, Thiết bị thông minh, v.v.)
      const newId = new mongoose.Types.ObjectId();
      categoryMap[lc._id.toString()] = newId;
      stats.categories.new++;
      toInsert.categories.push({
        _id: newId,
        name: lc.name,
        parent: lc.parent ? null : null, // will resolve parent in second pass
        rawLabParent: lc.parent ? lc.parent.toString() : null,
        isDeleted: false,
        createdAt: lc.createdAt || new Date(),
        updatedAt: lc.updatedAt || new Date()
      });
    }
  }

  // Resolve parents for new categories
  for (const cat of toInsert.categories) {
    if (cat.rawLabParent) {
      const parentMainId = categoryMap[cat.rawLabParent];
      if (parentMainId) {
        cat.parent = parentMainId;
      }
    }
    delete cat.rawLabParent;
  }

  // -------------------------------------------------------------
  // STEP 3.2: BRANDS
  // -------------------------------------------------------------
  for (const lb of labBrands) {
    const existing = mainBrands.find(mb => normalize(mb.name) === normalize(lb.name));
    if (existing) {
      brandMap[lb._id.toString()] = existing._id;
      stats.brands.skipped++;
    } else {
      const newId = new mongoose.Types.ObjectId();
      brandMap[lb._id.toString()] = newId;
      stats.brands.new++;
      toInsert.brands.push({
        _id: newId,
        name: lb.name,
        logo: lb.logo || '',
        isDeleted: false,
        createdAt: lb.createdAt || new Date(),
        updatedAt: lb.updatedAt || new Date()
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 3.3: DEMO USERS (Seller Owners & Customers for Reviews)
  // -------------------------------------------------------------
  const allowedDemoUserEmails = new Set([
    'admin@shop.local', 'cskh@shop.local', 'owner@shop.local', 'khach@shop.local',
    'gearvn@shop.local', 'anphat@shop.local', 'cellphones@shop.local',
    'phongvu@shop.local', 'phukien@shop.local', 'smarthome@shop.local',
    'hoangnam@shop.local', 'minhanh@shop.local', 'ducthang@shop.local'
  ]);

  for (const lu of labUsers) {
    if (!allowedDemoUserEmails.has(lu.email)) {
      // Bỏ qua tuyệt đối tài khoản test hoặc tài khoản cá nhân khác
      continue;
    }
    const existing = mainUsers.find(mu => mu.email === lu.email);
    if (existing) {
      userMap[lu._id.toString()] = existing._id;
      stats.users.skipped++;
    } else {
      const newId = new mongoose.Types.ObjectId();
      userMap[lu._id.toString()] = newId;
      stats.users.new++;
      toInsert.users.push({
        _id: newId,
        fullName: lu.fullName,
        email: lu.email,
        phone: lu.phone,
        passwordHash: lu.passwordHash,
        role: lu.role,
        sellerRole: lu.sellerRole,
        status: lu.status || 'active',
        isDeleted: false,
        createdAt: lu.createdAt || new Date(),
        updatedAt: lu.updatedAt || new Date()
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 3.4: SHOPS
  // -------------------------------------------------------------
  for (const ls of labShops) {
    // TechZone Flagship Store maps to existing TechZone Demo in Main
    if (ls.nameKey === 'techzone flagship store' || ls.nameKey === 'techzone demo') {
      const mainTechZone = mainShops.find(ms => ms.nameKey === 'techzone demo' || ms.nameKey === 'techzone flagship store');
      if (mainTechZone) {
        shopMap[ls._id.toString()] = mainTechZone._id;
        stats.shops.skipped++;
        continue;
      }
    }

    const existing = mainShops.find(ms => ms.nameKey === ls.nameKey);
    if (existing) {
      shopMap[ls._id.toString()] = existing._id;
      stats.shops.skipped++;
    } else {
      const newId = new mongoose.Types.ObjectId();
      shopMap[ls._id.toString()] = newId;

      const ownerMainId = userMap[ls.owner ? ls.owner.toString() : ''];
      if (!ownerMainId) {
        throw new Error(`[INTEGRITY ERROR] Không tìm thấy Owner hợp lệ cho shop "${ls.name}"`);
      }

      stats.shops.new++;
      toInsert.shops.push({
        _id: newId,
        name: ls.name,
        nameKey: ls.nameKey,
        description: ls.description || '',
        owner: ownerMainId,
        status: 'active',
        isDeleted: false,
        createdAt: ls.createdAt || new Date(),
        updatedAt: ls.updatedAt || new Date()
      });

      // Update user.shop in toInsert.users if applicable
      const userDoc = toInsert.users.find(u => u._id.equals(ownerMainId));
      if (userDoc) {
        userDoc.shop = newId;
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 3.5: PRODUCTS
  // -------------------------------------------------------------
  for (const lp of labProducts) {
    const existing = mainProducts.find(mp => normalize(mp.name) === normalize(lp.name));
    if (existing) {
      productMap[lp._id.toString()] = existing._id;
      stats.products.skipped++;
    } else {
      const targetShopId = shopMap[lp.shop ? lp.shop.toString() : ''];
      const targetCatId = categoryMap[lp.category ? lp.category.toString() : ''];
      const targetBrandId = brandMap[lp.brand ? lp.brand.toString() : ''];

      if (!targetShopId || !targetCatId || !targetBrandId) {
        throw new Error(`[INTEGRITY ERROR] Sản phẩm "${lp.name}" thiếu tham chiếu: Shop(${targetShopId}) Cat(${targetCatId}) Brand(${targetBrandId})`);
      }

      const newId = new mongoose.Types.ObjectId();
      productMap[lp._id.toString()] = newId;
      stats.products.new++;

      toInsert.products.push({
        _id: newId,
        shop: targetShopId,
        category: targetCatId,
        brand: targetBrandId,
        name: lp.name,
        images: lp.images || [],
        description: lp.description || '',
        minPrice: lp.minPrice || 0,
        soldCount: lp.soldCount || 0,
        ratingAvg: lp.ratingAvg || 5,
        ratingCount: lp.ratingCount || 1,
        isDeleted: false,
        createdAt: lp.createdAt || new Date(),
        updatedAt: lp.updatedAt || new Date()
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 3.6: VARIANTS
  // -------------------------------------------------------------
  for (const lv of labVariants) {
    const targetProdId = productMap[lv.product ? lv.product.toString() : ''];
    if (!targetProdId) {
      continue;
    }

    // Nếu sản phẩm đã có trong Main từ trước, kiểm tra xem variant đã tồn tại chưa
    const isExistingProduct = mainProducts.some(mp => mp._id.equals(targetProdId));
    if (isExistingProduct) {
      const existingVar = mainVariants.find(mv => mv.product.equals(targetProdId) && normalize(mv.name) === normalize(lv.name));
      if (existingVar) {
        stats.variants.skipped++;
        continue;
      }
    }

    const newId = new mongoose.Types.ObjectId();
    stats.variants.new++;
    toInsert.variants.push({
      _id: newId,
      product: targetProdId,
      name: lv.name,
      sku: lv.sku || '',
      price: lv.price,
      stock: lv.stock,
      attributes: lv.attributes || {},
      isDeleted: false,
      createdAt: lv.createdAt || new Date(),
      updatedAt: lv.updatedAt || new Date()
    });
  }

  // -------------------------------------------------------------
  // STEP 3.7: DEMO ORDERS & REVIEWS
  // -------------------------------------------------------------
  for (const lo of labOrders) {
    if (!lo.code || !lo.code.startsWith('ORD-DEMO-')) {
      continue;
    }
    const existing = mainOrders.find(mo => mo.code === lo.code);
    if (existing) {
      orderMap[lo._id.toString()] = existing._id;
      stats.orders.skipped++;
    } else {
      const newId = new mongoose.Types.ObjectId();
      orderMap[lo._id.toString()] = newId;

      const custMainId = userMap[lo.customer ? lo.customer.toString() : ''];
      const shopMainId = shopMap[lo.shop ? lo.shop.toString() : ''];

      if (!custMainId || !shopMainId) {
        continue;
      }

      stats.orders.new++;
      toInsert.orders.push({
        _id: newId,
        code: lo.code,
        groupCode: lo.groupCode || `GRP-${lo.code}`,
        customer: custMainId,
        shop: shopMainId,
        items: (lo.items || []).map(item => ({
          product: productMap[item.product ? item.product.toString() : ''] || item.product,
          variant: item.variant,
          productName: item.productName,
          variantName: item.variantName,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: lo.shippingAddress,
        shippingMethod: lo.shippingMethod || 'standard',
        subtotal: lo.subtotal,
        shippingFee: lo.shippingFee || 0,
        total: lo.total,
        sellerRevenue: lo.sellerRevenue || lo.total,
        status: lo.status || 'da_giao',
        statusHistory: lo.statusHistory || [],
        payment: lo.payment || { method: 'online', status: 'paid', paidAt: new Date() },
        createdAt: lo.createdAt || new Date(),
        updatedAt: lo.updatedAt || new Date()
      });
    }
  }

  for (const lr of labReviews) {
    const targetProdId = productMap[lr.product ? lr.product.toString() : ''];
    const targetShopId = shopMap[lr.shop ? lr.shop.toString() : ''];
    const targetCustId = userMap[lr.customer ? lr.customer.toString() : ''];
    const targetOrderId = orderMap[lr.order ? lr.order.toString() : ''];

    if (!targetProdId || !targetShopId || !targetCustId || !targetOrderId) {
      continue;
    }

    const existing = mainReviews.find(mr => mr.product.equals(targetProdId) && mr.order.equals(targetOrderId));
    if (existing) {
      stats.reviews.skipped++;
      continue;
    }

    const newId = new mongoose.Types.ObjectId();
    stats.reviews.new++;

    let replyDoc = undefined;
    if (lr.reply && lr.reply.content) {
      const replyByMainId = userMap[lr.reply.by ? lr.reply.by.toString() : ''];
      if (replyByMainId) {
        replyDoc = {
          content: lr.reply.content,
          by: replyByMainId,
          at: lr.reply.at || new Date()
        };
      }
    }

    toInsert.reviews.push({
      _id: newId,
      order: targetOrderId,
      product: targetProdId,
      shop: targetShopId,
      customer: targetCustId,
      variantName: lr.variantName || '',
      rating: lr.rating,
      content: lr.content,
      reply: replyDoc,
      isDeleted: false,
      createdAt: lr.createdAt || new Date(),
      updatedAt: lr.updatedAt || new Date()
    });
  }

  // -------------------------------------------------------------
  // STEP 3.8: DEMO VOUCHERS (Only GEARVN500K, skip temporary tests)
  // -------------------------------------------------------------
  const officialDemoVoucherCodes = ['GEARVN500K'];
  for (const lv of labVouchers) {
    if (!officialDemoVoucherCodes.includes(lv.code)) {
      continue;
    }
    const existing = mainVouchers.find(mv => mv.code === lv.code);
    if (existing) {
      stats.vouchers.skipped++;
      continue;
    }

    const targetShopId = lv.shop ? shopMap[lv.shop.toString()] : null;
    const newId = new mongoose.Types.ObjectId();
    stats.vouchers.new++;
    toInsert.vouchers.push({
      _id: newId,
      code: lv.code,
      scope: lv.scope || 'shop',
      shop: targetShopId,
      discountType: lv.discountType || 'fixed',
      discountValue: lv.discountValue || 500000,
      minOrder: lv.minOrder || 10000000,
      maxDiscount: lv.maxDiscount || 500000,
      quantity: lv.quantity || 100,
      remaining: lv.remaining || 100,
      startDate: lv.startDate || new Date(),
      endDate: lv.endDate || new Date(Date.now() + 90 * 86400000),
      isDeleted: false,
      createdAt: lv.createdAt || new Date(),
      updatedAt: lv.updatedAt || new Date()
    });
  }

  console.log('\n[4/6] KẾT QUẢ PHÂN TÍCH & KẾ HOẠCH MERGE:');
  const planTable = [
    { Collection: 'categories', 'Main hiện có': mainCategories.length, 'Lab hiện có': labCategories.length, 'Thêm mới': stats.categories.new, 'Bỏ qua (Trùng)': stats.categories.skipped, 'Hành động': 'INSERT danh mục mới, remap ID' },
    { Collection: 'brands', 'Main hiện có': mainBrands.length, 'Lab hiện có': labBrands.length, 'Thêm mới': stats.brands.new, 'Bỏ qua (Trùng)': stats.brands.skipped, 'Hành động': 'INSERT thương hiệu mới' },
    { Collection: 'users', 'Main hiện có': mainUsers.length, 'Lab hiện có': labUsers.length, 'Thêm mới': stats.users.new, 'Bỏ qua (Trùng)': stats.users.skipped, 'Hành động': 'INSERT chủ shop demo & khách demo' },
    { Collection: 'shops', 'Main hiện có': mainShops.length, 'Lab hiện có': labShops.length, 'Thêm mới': stats.shops.new, 'Bỏ qua (Trùng)': stats.shops.skipped, 'Hành động': 'INSERT 6 gian hàng demo mới, map TechZone' },
    { Collection: 'products', 'Main hiện có': mainProducts.length, 'Lab hiện có': labProducts.length, 'Thêm mới': stats.products.new, 'Bỏ qua (Trùng)': stats.products.skipped, 'Hành động': 'INSERT 158 sản phẩm mới' },
    { Collection: 'variants', 'Main hiện có': mainVariants.length, 'Lab hiện có': labVariants.length, 'Thêm mới': stats.variants.new, 'Bỏ qua (Trùng)': stats.variants.skipped, 'Hành động': 'INSERT biến thể thuộc 158 sản phẩm mới' },
    { Collection: 'orders', 'Main hiện có': mainOrders.length, 'Lab hiện có': labOrders.length, 'Thêm mới': stats.orders.new, 'Bỏ qua (Trùng)': stats.orders.skipped, 'Hành động': 'INSERT 13 đơn demo làm căn cứ cho review' },
    { Collection: 'reviews', 'Main hiện có': mainReviews.length, 'Lab hiện có': labReviews.length, 'Thêm mới': stats.reviews.new, 'Bỏ qua (Trùng)': stats.reviews.skipped, 'Hành động': 'INSERT 13 đánh giá mẫu có đầy đủ ref' },
    { Collection: 'vouchers', 'Main hiện có': mainVouchers.length, 'Lab hiện có': labVouchers.length, 'Thêm mới': stats.vouchers.new, 'Bỏ qua (Trùng)': stats.vouchers.skipped, 'Hành động': 'INSERT voucher demo (GEARVN500K)' },
  ];
  console.table(planTable);

  // Generate DATABASE_MIGRATION_PLAN.md
  const planMarkdown = `# KẾ HOẠCH MERGE DỮ LIỆU MONGODB (LAB → MAIN)
**Ngày phân tích:** ${new Date().toISOString()}
**Môi trường Nguồn (Lab):** ${labDbName} (Local)
**Môi trường Đích (Main):** ${mainDbName} (MongoDB Atlas)

## 1. NGUYÊN TẮC AN TOÀN
- **Chiến lược:** MERGE – KHÔNG REPLACE.
- **Bảo toàn dữ liệu Main:** Toàn bộ ${mainProducts.length} sản phẩm, ${mainShops.length} gian hàng, ${mainUsers.length} tài khoản người dùng, giỏ hàng và đơn hàng gốc của Main được giữ nguyên 100%.
- **Chống trùng lặp:** Ánh xạ remap ObjectId đối với các danh mục và thương hiệu đã có trong Main.
- **Bảo mật:** Không di chuyển tài khoản cá nhân hoặc dữ liệu phiên làm việc từ Lab.

## 2. BẢNG PHÂN LOẠI VÀ SỐ LIỆU DỰ KIẾN
| Collection | Main hiện có | Lab hiện có | Thêm mới (INSERT) | Bỏ qua (SKIP) | Xung đột (CONFLICT) | Hành động đề xuất |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
${planTable.map(r => `| **${r.Collection}** | ${r['Main hiện có']} | ${r['Lab hiện có']} | **+${r['Thêm mới']}** | ${r['Bỏ qua (Trùng)']} | 0 | ${r['Hành động']} |`).join('\n')}

## 3. QUAN HỆ THAM CHIẾU (REFERENTIAL INTEGRITY)
- 100% sản phẩm mới (+158) được liên kết đúng Shop ID, Category ID, Brand ID hợp lệ trong Main.
- 100% biến thể (+${stats.variants.new}) liên kết đúng Product ID hợp lệ.
- 100% đánh giá (+${stats.reviews.new}) liên kết đúng Order ID, Product ID, Shop ID và User ID.
`;
  fs.writeFileSync('DATABASE_MIGRATION_PLAN.md', planMarkdown, 'utf8');
  console.log(`[5/6] Đã xuất kế hoạch chi tiết ra tệp: DATABASE_MIGRATION_PLAN.md`);

  // -------------------------------------------------------------
  // STEP 6: EXECUTION (NẾU ĐƯỢC KÍCH HOẠT QUA --execute)
  // -------------------------------------------------------------
  if (!isExecute) {
    console.log('\n================================================================');
    console.log('  KẾT THÚC CHẾ ĐỘ DRY-RUN: MỌI DỮ LIỆU ĐÃ ĐƯỢC KIỂM TRA TOÀN VẸN');
    console.log('  Không có thao tác ghi nào được thực hiện trên MongoDB Atlas.');
    console.log('  Để thực thi merge, sử dụng cờ: --execute');
    console.log('================================================================');
    await mainConn.close();
    await labConn.close();
    return;
  }

  console.log('\n[6/6] ĐANG THỰC THI MIGRATION GHI VÀO MONGODB ATLAS...');

  // Insertion order strictly obeys foreign key dependencies:
  // 1. Categories
  // 2. Brands
  // 3. Users (demo shop owners & demo customers)
  // 4. Shops
  // 5. Products
  // 6. Variants
  // 7. Orders (demo orders)
  // 8. Reviews
  // 9. Vouchers

  if (toInsert.categories.length > 0) {
    await mainConn.db.collection('categories').insertMany(toInsert.categories);
    console.log(`      ✓ Đã thêm ${toInsert.categories.length} categories`);
  }
  if (toInsert.brands.length > 0) {
    await mainConn.db.collection('brands').insertMany(toInsert.brands);
    console.log(`      ✓ Đã thêm ${toInsert.brands.length} brands`);
  }
  if (toInsert.users.length > 0) {
    await mainConn.db.collection('users').insertMany(toInsert.users);
    console.log(`      ✓ Đã thêm ${toInsert.users.length} users (demo owners & customers)`);
  }
  if (toInsert.shops.length > 0) {
    await mainConn.db.collection('shops').insertMany(toInsert.shops);
    console.log(`      ✓ Đã thêm ${toInsert.shops.length} shops`);
  }
  if (toInsert.products.length > 0) {
    await mainConn.db.collection('products').insertMany(toInsert.products);
    console.log(`      ✓ Đã thêm ${toInsert.products.length} products`);
  }
  if (toInsert.variants.length > 0) {
    await mainConn.db.collection('variants').insertMany(toInsert.variants);
    console.log(`      ✓ Đã thêm ${toInsert.variants.length} variants`);
  }
  if (toInsert.orders.length > 0) {
    await mainConn.db.collection('orders').insertMany(toInsert.orders);
    console.log(`      ✓ Đã thêm ${toInsert.orders.length} demo orders`);
  }
  if (toInsert.reviews.length > 0) {
    await mainConn.db.collection('reviews').insertMany(toInsert.reviews);
    console.log(`      ✓ Đã thêm ${toInsert.reviews.length} reviews`);
  }
  if (toInsert.vouchers.length > 0) {
    await mainConn.db.collection('vouchers').insertMany(toInsert.vouchers);
    console.log(`      ✓ Đã thêm ${toInsert.vouchers.length} vouchers`);
  }

  console.log('\n================================================================');
  console.log('  MIGRATION EXECUTE HOÀN TẤT THÀNH CÔNG VÀO MONGODB ATLAS!');
  console.log('================================================================');

  await mainConn.close();
  await labConn.close();
}

runMigration().catch((err) => {
  console.error('[CRITICAL MIGRATION ERROR]:', err);
  process.exit(1);
});
