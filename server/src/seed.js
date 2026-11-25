// Tạo dữ liệu khởi tạo.
// npm run seed        -> admin + danh mục + thương hiệu
// npm run seed:demo   -> bộ dữ liệu thực tế: 7 gian hàng, 162 sản phẩm, biến thể, hình ảnh, đánh giá, voucher
// Hỗ trợ flag --dry-run: kiểm tra đối soát mà không ghi vào database.

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Shop, { shopKey } from './models/Shop.js';
import { Category, Brand } from './models/Catalog.js';
import { Product, Variant } from './models/Product.js';
import { Voucher } from './models/Voucher.js';
import Order from './models/Order.js';
import { Review } from './models/Support.js';

import { DEMO_CATEGORIES, DEMO_BRANDS, DEMO_SHOPS, DEMO_CUSTOMERS } from './data/demoCatalog.js';
import { DEMO_PRODUCTS } from './data/demoProductsList.js';
import { DEMO_REVIEWS } from './data/demoReviews.js';

const isDemo = process.argv.includes('--demo');
const isDryRun = process.argv.includes('--dry-run');

const hash = (p) => bcrypt.hash(p, 10);

const stats = {
  categories: { created: 0, updated: 0, skipped: 0 },
  brands: { created: 0, updated: 0, skipped: 0 },
  shops: { created: 0, updated: 0, skipped: 0 },
  users: { created: 0, updated: 0, skipped: 0 },
  products: { created: 0, updated: 0, skipped: 0 },
  variants: { created: 0, updated: 0, skipped: 0 },
  vouchers: { created: 0, updated: 0, skipped: 0 },
  reviews: { created: 0, updated: 0, skipped: 0 },
};

async function ensureUser(email, data, password) {
  let u = await User.findOne({ email });
  if (!u) {
    if (isDryRun) {
      stats.users.created++;
      return { _id: new mongoose.Types.ObjectId(), email, ...data };
    }
    u = await User.create({ email, passwordHash: await hash(password), ...data });
    stats.users.created++;
  } else {
    stats.users.skipped++;
  }
  return u;
}

async function ensureCategory(name, parent = null) {
  let cat = await Category.findOne({ name, isDeleted: false });
  if (!cat) {
    if (isDryRun) {
      stats.categories.created++;
      return { _id: new mongoose.Types.ObjectId(), name, parent };
    }
    cat = await Category.create({ name, parent });
    stats.categories.created++;
    return cat;
  }
  if (parent && !cat.parent) {
    if (!isDryRun) {
      cat.parent = parent;
      await cat.save();
    }
    stats.categories.updated++;
  } else {
    stats.categories.skipped++;
  }
  return cat;
}

async function ensureBrand(name, logo = '') {
  let b = await Brand.findOne({ name, isDeleted: false });
  if (!b) {
    if (isDryRun) {
      stats.brands.created++;
      return { _id: new mongoose.Types.ObjectId(), name, logo };
    }
    b = await Brand.create({ name, logo });
    stats.brands.created++;
    return b;
  }
  if (logo && !b.logo) {
    if (!isDryRun) {
      b.logo = logo;
      await b.save();
    }
    stats.brands.updated++;
  } else {
    stats.brands.skipped++;
  }
  return b;
}

await connectDB();

if (isDryRun) {
  console.log('======================================================');
  console.log('MODE: DRY-RUN (Kiểm tra đối soát dữ liệu, KHÔNG ghi DB)');
  console.log('======================================================');
}

// 1. Quản trị viên
await ensureUser('admin@shop.local', { fullName: 'Quản trị viên', phone: '0900000000', role: 'admin' }, 'Admin@123');

// 2. Danh mục & Thương hiệu
const catMap = {};
const brandMap = {};

// Khởi tạo danh mục theo cấu trúc
const categoriesToSeed = isDemo ? DEMO_CATEGORIES : [
  { name: 'Điện thoại' },
  { name: 'Laptop' },
  { name: 'Máy tính bàn' },
  {
    name: 'Linh kiện PC',
    children: [
      { name: 'Card đồ họa (VGA)' },
      { name: 'CPU' },
      { name: 'RAM' },
      { name: 'Ổ cứng SSD' },
      { name: 'Bo mạch chủ' },
      { name: 'Nguồn & Tản nhiệt' },
    ],
  },
  { name: 'Phụ kiện' },
];

for (const c of categoriesToSeed) {
  const root = await ensureCategory(c.name, null);
  catMap[c.name] = root;
  if (c.children && Array.isArray(c.children)) {
    for (const child of c.children) {
      const ch = await ensureCategory(child.name, root._id);
      catMap[child.name] = ch;
    }
  }
}

// Khởi tạo thương hiệu
const brandsToSeed = isDemo ? DEMO_BRANDS : [
  { name: 'Apple' }, { name: 'Samsung' }, { name: 'ASUS' }, { name: 'Dell' },
  { name: 'Lenovo' }, { name: 'MSI' }, { name: 'NVIDIA' }, { name: 'AMD' },
  { name: 'Intel' }, { name: 'Kingston' }, { name: 'Logitech' }
];

for (const b of brandsToSeed) {
  const brandDoc = await ensureBrand(b.name, b.logo || '');
  brandMap[b.name] = brandDoc;
}

console.log(`[seed] Admin, Danh mục (sẵn sàng: ${Object.keys(catMap).length}), Thương hiệu (sẵn sàng: ${Object.keys(brandMap).length})`);

// 3. Demo Dataset
if (isDemo) {
  // CSKH user
  await ensureUser('cskh@shop.local', { fullName: 'Nhân viên CSKH', phone: '0900000001', role: 'cskh' }, 'Cskh@123');

  // Khách hàng demo
  for (const c of DEMO_CUSTOMERS) {
    await ensureUser(c.email, { fullName: c.fullName, phone: c.phone, role: 'customer' }, 'Khach@123');
  }

  // Khởi tạo các gian hàng demo
  const shopMap = {};
  for (const s of DEMO_SHOPS) {
    const owner = await ensureUser(
      s.email,
      { fullName: `Chủ ${s.name}`, phone: s.phone, role: 'seller', sellerRole: 'owner' },
      'Owner@123'
    );

    let shopDoc = await Shop.findOne({ $or: [{ nameKey: shopKey(s.name) }, { owner: owner._id }] });
    if (!shopDoc) {
      if (isDryRun) {
        stats.shops.created++;
        shopDoc = { _id: new mongoose.Types.ObjectId(), name: s.name, owner: owner._id };
      } else {
        shopDoc = await Shop.create({
          name: s.name,
          nameKey: shopKey(s.name),
          owner: owner._id,
          status: 'active',
          description: s.description,
          policy: s.policy,
          logo: s.logo,
        });
        stats.shops.created++;
      }
    } else {
      if (!isDryRun) {
        let changed = false;
        if (shopDoc.name !== s.name) {
          shopDoc.name = s.name;
          shopDoc.nameKey = shopKey(s.name);
          changed = true;
        }
        if (s.logo && shopDoc.logo !== s.logo) {
          shopDoc.logo = s.logo;
          changed = true;
        }
        if (s.description && shopDoc.description !== s.description) {
          shopDoc.description = s.description;
          changed = true;
        }
        if (s.policy && shopDoc.policy !== s.policy) {
          shopDoc.policy = s.policy;
          changed = true;
        }
        if (shopDoc.status !== 'active') {
          shopDoc.status = 'active';
          changed = true;
        }
        if (changed) {
          await shopDoc.save();
          stats.shops.updated++;
        } else {
          stats.shops.skipped++;
        }
      } else {
        stats.shops.skipped++;
      }
    }

    if (!isDryRun && owner && String(owner.shop) !== String(shopDoc._id)) {
      owner.shop = shopDoc._id;
      await owner.save();
    }
    shopMap[s.name] = shopDoc;
  }

  // Khởi tạo sản phẩm & biến thể
  const defaultShop = shopMap['TechZone Flagship Store'] || Object.values(shopMap)[0];

  for (const p of DEMO_PRODUCTS) {
    const targetShop = shopMap[p.shopName] || defaultShop;
    const targetCat = catMap[p.category] || catMap['Điện thoại'];
    const targetBrand = brandMap[p.brand];

    const minPrice = Math.min(...p.variants.map((v) => v[1]));

    let prod = await Product.findOne({ shop: targetShop._id, name: p.name, isDeleted: false });

    if (!prod) {
      if (isDryRun) {
        stats.products.created++;
        prod = { _id: new mongoose.Types.ObjectId(), name: p.name, shop: targetShop._id };
      } else {
        prod = await Product.create({
          shop: targetShop._id,
          name: p.name,
          category: targetCat._id,
          brand: targetBrand?._id,
          images: p.images || [],
          description: p.description,
          minPrice,
          soldCount: p.soldCount || 0,
          ratingAvg: p.ratingAvg || 5,
          ratingCount: p.ratingCount || 0,
        });
        stats.products.created++;
      }
    } else {
      stats.products.skipped++;
      if (!isDryRun) {
        // Cập nhật thông số bổ sung nếu chưa có
        let prodChanged = false;
        if (p.images && (!prod.images || prod.images.length === 0)) {
          prod.images = p.images;
          prodChanged = true;
        }
        if (p.soldCount && (!prod.soldCount || prod.soldCount === 0)) {
          prod.soldCount = p.soldCount;
          prodChanged = true;
        }
        if (p.ratingAvg && (!prod.ratingAvg || prod.ratingAvg === 0)) {
          prod.ratingAvg = p.ratingAvg;
          prod.ratingCount = p.ratingCount || 10;
          prodChanged = true;
        }
        if (prodChanged) await prod.save();
      }
    }

    // Biến thể cho sản phẩm
    for (const v of p.variants) {
      const [vName, vPrice, vStock, vSku] = v;
      let vr = await Variant.findOne({ product: prod._id, name: vName, isDeleted: false });
      if (!vr) {
        if (isDryRun) {
          stats.variants.created++;
        } else {
          await Variant.create({
            product: prod._id,
            name: vName,
            price: vPrice,
            stock: vStock,
            sku: vSku || undefined,
          });
          stats.variants.created++;
        }
      } else {
        stats.variants.skipped++;
      }
    }
  }

  // Khởi tạo mã giảm giá (Vouchers)
  const now = new Date();
  const later = new Date(now.getTime() + 90 * 86400000);
  const vouchers = [
    { code: 'SAN100K', title: 'Giảm 100.000đ toàn sàn', scope: 'platform', amount: 100000, minOrder: 1000000, quantity: 1000, pointsCost: 0 },
    { code: 'DOIDIEM50K', title: 'Đổi điểm: giảm 50.000đ', scope: 'platform', amount: 50000, minOrder: 500000, quantity: 1000, pointsCost: 20 },
    { code: 'TECHZONE200K', title: 'TechZone giảm 200.000đ', scope: 'shop', shop: defaultShop._id, amount: 200000, minOrder: 5000000, quantity: 100, pointsCost: 0 },
    { code: 'GEARVN500K', title: 'GearVN Pro Gaming giảm 500k', scope: 'shop', shop: shopMap['GearVN Pro Gaming']?._id, amount: 500000, minOrder: 15000000, quantity: 50, pointsCost: 0 },
  ];

  for (const v of vouchers) {
    if (!v.shop && v.scope === 'shop') continue;
    const exists = await Voucher.exists({ code: v.code });
    if (!exists) {
      if (isDryRun) {
        stats.vouchers.created++;
      } else {
        await Voucher.create({ ...v, remaining: v.quantity, startDate: now, endDate: later });
        stats.vouchers.created++;
      }
    } else {
      stats.vouchers.skipped++;
    }
  }

  // Khởi tạo Đánh giá mẫu (Reviews) kèm Đơn hàng hoàn tất
  for (const r of DEMO_REVIEWS) {
    let prod = await Product.findOne({ name: r.productName, isDeleted: false });
    let cust = await User.findOne({ email: r.customerEmail });

    if (isDryRun) {
      const prodWillExist = prod || DEMO_PRODUCTS.some((dp) => dp.name === r.productName);
      const custWillExist = cust || DEMO_CUSTOMERS.some((dc) => dc.email === r.customerEmail) || r.customerEmail === 'khach@shop.local';
      if (prodWillExist && custWillExist) {
        stats.reviews.created++;
      }
      continue;
    }

    if (!prod || !cust) continue;

    const existingReview = await Review.findOne({ product: prod._id, customer: cust._id, isDeleted: false });
    if (existingReview) {
      stats.reviews.skipped++;
      continue;
    }

    // Đảm bảo có đơn hàng hoàn tất hợp lệ làm bằng chứng đánh giá
    const orderCode = `ORD-DEMO-${cust._id.toString().slice(-4).toUpperCase()}-${prod._id.toString().slice(-4).toUpperCase()}`;
    let order = await Order.findOne({ code: orderCode });

    const variant = await Variant.findOne({ product: prod._id, isDeleted: false }) || { name: r.variantName, price: prod.minPrice };

    if (!order) {
      order = await Order.create({
        code: orderCode,
        groupCode: `GRP-${orderCode}`,
        customer: cust._id,
        shop: prod.shop,
        items: [
          {
            product: prod._id,
            variant: variant._id,
            productName: prod.name,
            variantName: r.variantName,
            image: prod.images?.[0] || '',
            price: variant.price || prod.minPrice,
            quantity: 1,
          },
        ],
        shippingAddress: {
          receiver: cust.fullName,
          phone: cust.phone,
          detail: '123 Đường Công Nghệ',
          ward: 'Phường Bến Nghé',
          district: 'Quận 1',
          province: 'TP. Hồ Chí Minh',
        },
        subtotal: variant.price || prod.minPrice,
        shippingFee: 0,
        total: variant.price || prod.minPrice,
        sellerRevenue: variant.price || prod.minPrice,
        status: 'da_giao',
        statusHistory: [
          { status: 'cho_xac_nhan', at: new Date(Date.now() - 7 * 86400000), note: 'Khách đặt đơn' },
          { status: 'da_xac_nhan', at: new Date(Date.now() - 6 * 86400000), note: 'Shop xác nhận đơn' },
          { status: 'dang_giao', at: new Date(Date.now() - 5 * 86400000), note: 'Đã bàn giao vận chuyển' },
          { status: 'da_giao', at: new Date(Date.now() - 4 * 86400000), note: 'Giao hàng thành công' },
        ],
        payment: {
          method: 'online',
          status: 'paid',
          paidAt: new Date(Date.now() - 7 * 86400000),
          txnId: `DEMO-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      });
    }

    const shopOwner = (await Shop.findById(prod.shop).populate('owner'))?.owner;

    await Review.create({
      order: order._id,
      product: prod._id,
      shop: prod.shop,
      customer: cust._id,
      variantName: r.variantName,
      rating: r.rating,
      content: r.content,
      reply: r.reply && shopOwner ? {
        content: r.reply,
        by: shopOwner._id,
        at: new Date(Date.now() - 3 * 86400000),
      } : undefined,
    });
    stats.reviews.created++;
  }
}

console.log('\n======================================================');
console.log(`BÁO CÁO KẾT QUẢ SEED ${isDryRun ? '(DRY-RUN PREVIEW)' : '(SUCCESSFUL COMMIT)'}`);
console.log('======================================================');
console.table({
  'Categories (Danh mục)': stats.categories,
  'Brands (Thương hiệu)': stats.brands,
  'Shops (Gian hàng)': stats.shops,
  'Users (Người dùng)': stats.users,
  'Products (Sản phẩm)': stats.products,
  'Variants (Biến thể/SKU)': stats.variants,
  'Vouchers (Khuyến mãi)': stats.vouchers,
  'Reviews (Đánh giá)': stats.reviews,
});

if (isDemo) {
  console.log('\nTài khoản demo khả dụng:');
  console.log(' - Admin: admin@shop.local / Admin@123');
  console.log(' - CSKH: cskh@shop.local / Cskh@123');
  console.log(' - Chủ Shop: owner@shop.local / Owner@123');
  console.log(' - Khách hàng: khach@shop.local / Khach@123');
  console.log(' - Khách hàng VIP: hoangnam@shop.local / Khach@123');
}

await mongoose.disconnect();
