import { refreshProfile } from "./auth-service.js";
import { mountShoppingChrome } from "./shopping.js";
import { $, $$, assetUrl, escapeHtml as esc, formatDate, formatMoney, PLACEHOLDER_IMAGE } from "./utils.js";
import { showToast } from "./ui.js";
import { getBrands, getCategories } from "./product-service.js";
import {
  createProduct, createVoucher, decideAfterSales, deleteProduct, deleteVoucher, getAfterSales, getInventory,
  getOrder, getOrders, getProduct, getProducts, getReviews, getSellerProfile, getSellerStats, getShop, getStaff,
  getVouchers, rejectOrder, replyReview, setProductVisibility, staffAction, updateOrderStatus,
  updateProduct, updateSellerProfile, updateShop, updateStock, updateVoucher, uploadSellerImage,
} from "./seller-service.js";
import { ORDER_STATUS_LABELS } from "./status-labels.js";

const main = $("#seller-main");
const state = { user: null, shop: null, section: new URLSearchParams(location.search).get("section") || "overview", productQuery: "", orderPage: 1, orderStatus: "", orderQuery: "", modal: null };
const nav = [
  ["overview", "Tổng quan", "⌂"], ["shop", "Cửa hàng & hồ sơ", "▦"], ["products", "Sản phẩm", "□"],
  ["inventory", "Tồn kho", "▤"], ["orders", "Đơn hàng", "⇄"], ["after-sales", "Hậu mãi", "↺"],
  ["vouchers", "Voucher", "%"], ["reviews", "Đánh giá", "☆"], ["stats", "Thống kê", "⌁"], ["staff", "Nhân viên", "♙"],
];
const shopName = () => state.shop?.name || "Gian hàng";
const isOwner = () => state.user?.sellerRole === "owner";
const isActive = () => state.shop?.status === "active";
const escapeAttr = esc;
const statusLabel = (status) => ORDER_STATUS_LABELS[status] || status || "—";
const badge = (text, tone = "") => `<span class="seller-badge ${tone ? `seller-badge--${tone}` : ""}">${esc(text)}</span>`;
const empty = (text) => `<div class="seller-empty">${esc(text)}</div>`;
const dateTime = (value) => value ? new Date(value).toLocaleString("vi-VN") : "—";

function panel(title, intro, body) {
  return `<section class="seller-panel"><h2>${esc(title)}</h2><p class="seller-panel__intro">${esc(intro)}</p>${body}</section>`;
}

function shell() {
  const visibleNav = nav.filter(([id]) => !["stats", "staff"].includes(id) || isOwner());
  main.innerHTML = `
    <header class="seller-head"><div><span class="seller-eyebrow">Seller Center</span><h1>${esc(shopName())}</h1><p>Xin chào ${esc(state.user.fullName || state.user.email)} · ${isOwner() ? "Chủ gian hàng" : "Nhân viên gian hàng"}</p></div><a class="btn btn--ghost" href="./index.html">← Về trang mua sắm</a></header>
    ${!isActive() ? `<div class="seller-notice"><strong>Gian hàng ${esc(({pending:"đang chờ quản trị viên duyệt",locked:"đang bị khóa",rejected:"đã bị từ chối"})[state.shop?.status] || "chưa sẵn sàng")}</strong><p>Gian hàng chỉ dùng các chức năng quản lý sau khi được kích hoạt.</p></div>` : ""}
    <div class="seller-layout"><nav class="seller-nav" aria-label="Điều hướng Seller Center">${visibleNav.map(([id,label,icon])=>`<button type="button" data-section="${id}" aria-current="${state.section===id?"page":"false"}"><span aria-hidden="true">${icon}</span>${label}</button>`).join("")}</nav><div id="seller-view" aria-live="polite"></div></div>
    <dialog class="seller-modal" id="seller-modal"></dialog>`;
  $("#seller-modal").addEventListener("close", () => { state.modal = null; });
}

async function showSection(section = state.section) {
  if (!nav.some(([id]) => id === section) || (["stats", "staff"].includes(section) && !isOwner())) section = "overview";
  state.section = section;
  history.replaceState(null, "", `${location.pathname}?section=${encodeURIComponent(section)}`);
  $$(".seller-nav [data-section]").forEach((button) => button.setAttribute("aria-current", String(button.dataset.section === section ? "page" : "false")));
  const target = $("#seller-view");
  target.innerHTML = `<div class="seller-loading">Đang tải dữ liệu…</div>`;
  if (!isActive() && section !== "shop") { target.innerHTML = panel("Gian hàng chưa hoạt động", "Các chức năng Seller sẽ sẵn sàng sau khi gian hàng được duyệt và mở khóa.", empty("Bạn vẫn có thể xem thông tin hồ sơ và trạng thái gian hàng trong mục Cửa hàng & hồ sơ.")); return; }
  try {
    const renderers = { overview, shop: shopPanel, products: productsPanel, inventory: inventoryPanel, orders: ordersPanel, "after-sales": afterSalesPanel, vouchers: vouchersPanel, reviews: reviewsPanel, stats: statsPanel, staff: staffPanel };
    target.innerHTML = await renderers[section]();
  } catch (error) {
    target.innerHTML = panel("Không tải được dữ liệu", error.message || "Đã xảy ra lỗi.", `<button class="seller-btn seller-btn--primary" type="button" data-reload>Thử lại</button>`);
  }
}

async function overview() {
  const [productData, orderData] = await Promise.all([getProducts({limit:1}), getOrders({limit:1})]);
  const products = productData.total || 0, orders = orderData.total || 0;
  let stats = null;
  if (isOwner()) { try { stats = await getSellerStats({}); } catch { /* quyền/thống kê có thể tạm thời chưa sẵn sàng */ } }
  const pendingOrders = await getOrders({limit:1,status:"cho_xac_nhan"});
  const cards = [
    ["Sản phẩm đang quản lý", products, "Sản phẩm chưa xóa mềm"], ["Tổng đơn hàng", orders, "Đơn thuộc gian hàng"],
    ["Đơn chờ xác nhận", pendingOrders.total || 0, "Cần xử lý tiếp theo quy trình"],
  ];
  if (stats) cards.push(["Doanh thu ghi nhận", formatMoney(stats.revenue), `${stats.completedOrders || 0} đơn hoàn tất trong khoảng thống kê`]);
  return panel("Tổng quan", "Số liệu lấy trực tiếp từ dữ liệu hiện có của gian hàng.", `<div class="seller-grid ${cards.length>3?"seller-grid--3":""}">${cards.map(([label,value,note])=>`<article class="seller-card"><strong>${esc(label)}</strong><b>${esc(value)}</b><small>${esc(note)}</small></article>`).join("")}</div><div class="seller-form-actions"><button class="seller-btn" data-section="orders">Mở đơn hàng</button><button class="seller-btn" data-section="products">Quản lý sản phẩm</button><button class="seller-btn" data-section="inventory">Kiểm tra tồn kho</button></div>`);
}

async function shopPanel() {
  const [profile, shop] = await Promise.all([getSellerProfile(), getShop()]); state.shop = shop; state.user = profile; shellHeaderRefresh();
  const readonly = !isOwner() || !isActive();
  return panel("Cửa hàng & hồ sơ", "Thông tin liên hệ dùng hồ sơ tài khoản hiện có. Tên gian hàng giữ nguyên theo quy tắc đăng ký.", `
    <form data-form="profile"><div class="seller-grid"><label class="seller-field">Tên người liên hệ<input name="fullName" required minlength="2" maxlength="80" value="${escapeAttr(profile.fullName)}" ${readonly?"disabled":""}></label><label class="seller-field">Số điện thoại<input name="phone" required value="${escapeAttr(profile.phone)}" ${readonly?"disabled":""}></label><label class="seller-field">Email tài khoản<input value="${escapeAttr(profile.email)}" disabled><small>Email hiện được dùng làm định danh đăng nhập.</small></label><label class="seller-field">Tên cửa hàng<input value="${escapeAttr(shop.name)}" disabled><small>Tên không đổi sau khi đăng ký.</small></label></div>${readonly?"":`<button class="seller-btn seller-btn--primary" type="submit">Lưu hồ sơ</button>`}</form>
    <hr><form data-form="shop"><label class="seller-field">Mô tả cửa hàng<textarea name="description" maxlength="2000" ${readonly?"disabled":""}>${esc(shop.description)}</textarea></label><label class="seller-field">Chính sách cửa hàng<textarea name="policy" maxlength="3000" ${readonly?"disabled":""}>${esc(shop.policy)}</textarea></label><div class="seller-image-row"><label class="seller-field">Logo (URL)<input name="logo" value="${escapeAttr(shop.logo || "")}" ${readonly?"disabled":""}><small>Chọn ảnh để tải lên máy chủ, hoặc dán URL ảnh.</small></label><img class="seller-logo-preview" src="${escapeAttr(assetUrl(shop.logo))}" alt="Logo cửa hàng"></div>${readonly?"":`<div class="seller-form-actions"><label class="seller-btn">Tải logo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload hidden></label><button class="seller-btn seller-btn--primary" type="submit">Lưu thông tin cửa hàng</button></div>`}</form>`);
}
function shellHeaderRefresh() { const h1 = $(".seller-head h1"); if (h1) h1.textContent = shopName(); }

async function productsPanel() {
  const data = await getProducts({q:state.productQuery,limit:50});
  const rows = data.items.map(p=>`<tr><td><div class="seller-product"><img src="${escapeAttr(assetUrl(p.images?.[0]))}" alt=""><strong>${esc(p.name)}</strong></div></td><td>${esc(p.category?.name || "—")}</td><td>${formatMoney(p.minPrice)}</td><td>${p.variants.reduce((n,v)=>n+Number(v.stock||0),0)}</td><td>${p.hidden?badge("Đang ẩn","amber"):badge("Đang bán","green")}</td><td><div class="seller-actions"><button class="seller-btn" data-edit-product="${p._id}">Sửa</button><button class="seller-btn" data-visibility="${p._id}" data-hidden="${!p.hidden}">${p.hidden?"Hiện":"Ẩn"}</button><button class="seller-btn seller-btn--danger" data-delete-product="${p._id}">Xóa</button></div></td></tr>`).join("");
  return panel("Sản phẩm", "Quản lý nội dung, biến thể, giá, hình ảnh và trạng thái hiển thị.", `<div class="seller-toolbar"><input class="seller-search" type="search" name="productQuery" placeholder="Tìm theo tên sản phẩm" value="${escapeAttr(state.productQuery)}"><button class="seller-btn seller-btn--primary" data-create-product>＋ Thêm sản phẩm</button></div>${rows?`<div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá từ</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${rows}</tbody></table></div>`:empty("Chưa có sản phẩm phù hợp.")}<p class="seller-panel__intro">Sản phẩm cần có ít nhất một biến thể. Tồn của biến thể hiện có được chỉnh trong mục Tồn kho.</p>`);
}

async function inventoryPanel() {
  const items = await getInventory();
  const rows = items.map(v=>`<tr><td><div class="seller-product"><img src="${escapeAttr(assetUrl(v.image))}" alt=""><strong>${esc(v.productName)}</strong></div></td><td>${esc(v.name)}</td><td>${esc(v.sku || "—")}</td><td>${formatMoney(v.price)}</td><td>${badge(v.stock,Number(v.stock)<=5?"red":"green")}</td><td><div class="seller-actions"><button class="seller-btn" data-stock="${v._id}" data-product="${v.product}">Điều chỉnh</button></div></td></tr>`).join("");
  return panel("Tồn kho", "Tồn được quản lý theo từng biến thể. Thay đổi số lượng có kiểm tra tồn hiện tại ở máy chủ.", `<div class="seller-toolbar"><label class="seller-field">Lọc tồn thấp<input id="stock-threshold" type="number" min="0" placeholder="Ngưỡng tồn kho"></label><button class="seller-btn" data-stock-filter>Lọc</button></div>${rows?`<div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Sản phẩm</th><th>Biến thể</th><th>SKU</th><th>Giá</th><th>Tồn</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty("Chưa có biến thể để theo dõi tồn kho.")}`);
}

async function ordersPanel() {
  const data=await getOrders({page:state.orderPage,limit:20,status:state.orderStatus,q:state.orderQuery});
  const cards=data.items.map(o=>`<article class="seller-order-card"><div class="seller-order-top"><h3>${esc(o.code)} · ${esc(dateTime(o.createdAt))}</h3>${badge(statusLabel(o.status),o.status==="da_huy"?"red":o.status==="hoan_tat"?"green":"amber")}</div><p>Người nhận: ${esc(o.shippingAddress?.receiver)} · ${esc(o.shippingAddress?.phone)}<br>${esc([o.shippingAddress?.detail,o.shippingAddress?.ward,o.shippingAddress?.district,o.shippingAddress?.province].filter(Boolean).join(", "))}</p><ul class="seller-order-items">${o.items.map(i=>`<li><span>${esc(i.productName)} · ${esc(i.variantName)} × ${i.quantity}</span><b>${formatMoney(i.price*i.quantity)}</b></li>`).join("")}</ul><div class="seller-order-top"><strong>Tổng: ${formatMoney(o.total)}</strong><div class="seller-actions"><button class="seller-btn" data-order-detail="${o._id}">Chi tiết</button>${o.status==="cho_xac_nhan"?`<button class="seller-btn seller-btn--primary" data-order-status="${o._id}" data-next="da_xac_nhan">Xác nhận</button><button class="seller-btn seller-btn--danger" data-reject-order="${o._id}">Từ chối</button>`:""}${o.status==="da_xac_nhan"?`<button class="seller-btn seller-btn--primary" data-order-status="${o._id}" data-next="dang_giao">Bắt đầu giao</button>`:""}${o.status==="dang_giao"?`<button class="seller-btn seller-btn--primary" data-order-status="${o._id}" data-next="da_giao">Đã giao</button>`:""}</div></div></article>`).join("");
  return panel("Đơn hàng", "Chỉ hiển thị đơn thuộc gian hàng của bạn. Trạng thái phải chuyển theo đúng trình tự nghiệp vụ.", `<div class="seller-toolbar"><select id="order-status"><option value="">Tất cả trạng thái</option>${Object.entries(ORDER_STATUS_LABELS).map(([v,l])=>`<option value="${v}" ${state.orderStatus===v?"selected":""}>${esc(l)}</option>`).join("")}</select><input class="seller-search" id="order-query" placeholder="Tìm mã đơn" value="${escapeAttr(state.orderQuery)}"><button class="seller-btn" data-filter-orders>Lọc</button></div>${cards||empty("Chưa có đơn hàng.")}<div class="seller-pagination"><button class="seller-btn" data-order-page="${Math.max(1,state.orderPage-1)}" ${state.orderPage<=1?"disabled":""}>Trước</button><span>Trang ${data.page} / ${Math.max(data.totalPages,1)}</span><button class="seller-btn" data-order-page="${Math.min(data.totalPages,state.orderPage+1)}" ${state.orderPage>=data.totalPages?"disabled":""}>Sau</button></div>`);
}

async function afterSalesPanel() {
  const items=await getAfterSales();
  const cards=items.map(a=>`<article class="seller-order-card"><div class="seller-order-top"><h3>${esc(a.order?.code||"Đơn hàng")} · ${esc(({huy_don:"Yêu cầu hủy đơn",hoan_tien:"Hoàn tiền / trả hàng",doi_hang:"Đổi hàng"})[a.type]||a.type)}</h3>${badge(({cho_xu_ly:"Chờ xử lý",da_chap_nhan:"Đã chấp nhận",bi_tu_choi:"Bị từ chối"})[a.status]||a.status,a.status==="cho_xu_ly"?"amber":"green")}</div><p>${esc(a.reason)}<br>Tạo lúc ${esc(dateTime(a.createdAt))}</p>${a.status==="cho_xu_ly"?`<div class="seller-actions"><button class="seller-btn seller-btn--primary" data-after-sales="${a._id}" data-decision="accept">Chấp nhận</button><button class="seller-btn seller-btn--danger" data-after-sales="${a._id}" data-decision="reject">Từ chối</button></div>`:`<small>${esc(a.sellerNote||"")}</small>`}</article>`).join("");
  return panel("Yêu cầu hậu mãi", "Xử lý yêu cầu hủy, hoàn tiền hoặc đổi hàng. Ghi chú xử lý là bắt buộc.", cards||empty("Không có yêu cầu hậu mãi."));
}

async function vouchersPanel() {
  const items=await getVouchers();
  const rows=items.map(v=>`<tr><td><strong>${esc(v.code)}</strong><br>${esc(v.title)}</td><td>${formatMoney(v.amount)}</td><td>${formatMoney(v.minOrder)}</td><td>${v.remaining}/${v.quantity}</td><td>${esc(formatDate(v.startDate))} – ${esc(formatDate(v.endDate))}</td><td>${v.active?badge("Đang bật","green"):badge("Đã tắt","amber")}</td><td><div class="seller-actions"><button class="seller-btn" data-edit-voucher="${v._id}">Sửa</button><button class="seller-btn seller-btn--danger" data-delete-voucher="${v._id}">Xóa</button></div></td></tr>`).join("");
  return panel("Voucher gian hàng", "Voucher do gian hàng tạo và chịu chi phí giảm giá. Mã voucher không đổi sau khi tạo.", `<div class="seller-toolbar"><button class="seller-btn seller-btn--primary" data-create-voucher>＋ Tạo voucher</button></div>${rows?`<div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Voucher</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Lượt còn</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty("Chưa có voucher." )}`);
}

async function reviewsPanel() {
  const data=await getReviews({limit:50});
  const cards=data.items.map(r=>`<article class="seller-review-card"><div class="seller-review-head"><div><h3>${esc(r.product?.name||"Sản phẩm")}</h3><small>${esc(r.customer?.fullName||"Khách hàng")} · ${esc(dateTime(r.createdAt))}</small></div><span class="seller-stars" aria-label="${r.rating} trên 5 sao">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span></div><p>${esc(r.content||"Khách không để lại bình luận.")}</p>${r.reply?.content?`<p><strong>Phản hồi cửa hàng:</strong> ${esc(r.reply.content)}</p>`:`<form data-review-reply="${r._id}" class="seller-review-reply"><label class="seller-field">Phản hồi<textarea name="content" required minlength="2" maxlength="1000" placeholder="Viết phản hồi lịch sự, hữu ích"></textarea></label><button class="seller-btn seller-btn--primary">Gửi phản hồi</button></form>`}</article>`).join("");
  return panel("Đánh giá sản phẩm", "Đọc đánh giá đã xác minh và phản hồi khách hàng.", cards||empty("Chưa có đánh giá."));
}

async function statsPanel() {
  const now=new Date(), start=new Date(now.getTime()-29*86400000);
  const data=await getSellerStats({from:start.toISOString().slice(0,10),to:now.toISOString().slice(0,10)});
  const max=Math.max(1,...data.series.map(x=>x.revenue));
  const orderCount=Object.values(data.ordersByStatus||{}).reduce((sum,n)=>sum+Number(n||0),0);
  const statusBreakdown=Object.entries(data.ordersByStatus||{}).map(([status,count])=>`${badge(`${statusLabel(status)}: ${count}`,status==="hoan_tat"?"green":"amber")}`).join(" ")||"Chưa có đơn trong kỳ.";
  const chart=data.series.map(x=>`<div class="seller-chart-row"><span>${esc(x.date)}</span><div class="seller-chart-bar"><span style="width:${Math.max(2,100*x.revenue/max)}%"></span></div><b>${formatMoney(x.revenue)}</b></div>`).join("");
  const tops=data.topProducts.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.quantity}</td><td>${formatMoney(p.revenue)}</td></tr>`).join("");
  return panel("Thống kê gian hàng", "Doanh thu tính trên đơn hoàn tất, sau phần giảm giá do shop chịu; số liệu lấy từ đơn thật.", `<div class="seller-grid seller-grid--3"><article class="seller-card"><strong>Doanh thu</strong><b>${formatMoney(data.revenue)}</b><small>Trong 30 ngày gần nhất</small></article><article class="seller-card"><strong>Đơn hoàn tất</strong><b>${data.completedOrders}</b><small>Giá trị đơn bình quân ${formatMoney(data.avgOrderValue)}</small></article><article class="seller-card"><strong>Tổng đơn trong kỳ</strong><b>${orderCount}</b><small>${data.productCount} sản phẩm đang quản lý</small></article></div><h3>Đơn hàng theo trạng thái</h3><div class="seller-form-actions">${statusBreakdown}</div><h3>Doanh thu theo ngày</h3>${chart?`<div class="seller-chart">${chart}</div>`:empty("Chưa có doanh thu hoàn tất trong khoảng này.")}<h3>Sản phẩm bán chạy</h3>${tops?`<div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Sản phẩm</th><th>Đã bán</th><th>Giá trị hàng</th></tr></thead><tbody>${tops}</tbody></table></div>`:empty("Chưa có dữ liệu bán hàng.")}`);
}

async function staffPanel() {
  const items=await getStaff();
  const cards=items.map(u=>`<article class="seller-staff-card"><div class="seller-order-top"><strong>${esc(u.fullName)}</strong>${badge(({pending:"Chờ duyệt",active:"Hoạt động",locked:"Đã khóa",rejected:"Từ chối"})[u.status]||u.status,u.status==="active"?"green":"amber")}</div><p>${esc(u.email)} · ${esc(u.phone)}</p><div class="seller-actions">${u.status==="pending"?`<button class="seller-btn seller-btn--primary" data-staff="${u._id}" data-action="approve">Duyệt</button><button class="seller-btn seller-btn--danger" data-staff="${u._id}" data-action="reject">Từ chối</button>`:""}${u.status==="active"?`<button class="seller-btn seller-btn--danger" data-staff="${u._id}" data-action="lock">Khóa</button>`:""}${u.status==="locked"?`<button class="seller-btn" data-staff="${u._id}" data-action="unlock">Mở khóa</button>`:""}</div></article>`).join("");
  return panel("Nhân viên cửa hàng", "Chủ cửa hàng duyệt yêu cầu tham gia và quản lý trạng thái nhân viên.", cards||empty("Chưa có nhân viên hoặc yêu cầu tham gia."));
}

async function openProductModal(product = null) {
  const modal=$("#seller-modal"), variants=product?.variants||[{name:"Mặc định",price:"",stock:0,sku:""}];
  const [categories,brands]=await Promise.all([getCategories(),getBrands()]);
  const categoryOptions=categories.map(c=>`<option value="${c._id}" ${(product?.category?._id||product?.category)===c._id?"selected":""}>${esc(c.name)}</option>`).join("");
  const brandOptions=brands.map(b=>`<option value="${b._id}" ${(product?.brand?._id||product?.brand)===b._id?"selected":""}>${esc(b.name)}</option>`).join("");
  modal.innerHTML=`<button type="button" class="seller-modal__close" data-close-modal aria-label="Đóng">×</button><h2>${product?"Sửa sản phẩm":"Thêm sản phẩm"}</h2><form data-form="product" data-product-id="${product?product._id:""}"><div class="seller-grid"><label class="seller-field">Tên sản phẩm<input name="name" required minlength="3" maxlength="200" value="${escapeAttr(product?.name||"")}"></label><label class="seller-field">Danh mục<select name="category" required><option value="">Chọn danh mục</option>${categoryOptions}</select></label><label class="seller-field">Thương hiệu<select name="brand"><option value="">Không chọn</option>${brandOptions}</select></label><label class="seller-field">Ảnh (mỗi URL một dòng)<textarea name="images" maxlength="5000">${esc((product?.images||[]).join("\n"))}</textarea></label></div><label class="seller-field">Mô tả<textarea name="description" maxlength="10000">${esc(product?.description||"")}</textarea></label><div class="seller-order-top"><h3>Biến thể</h3><button type="button" class="seller-btn" data-add-variant>＋ Thêm biến thể</button></div><div data-variant-list>${variants.map(variantRow).join("")}</div><div class="seller-form-actions"><label class="seller-btn">Tải ảnh sản phẩm<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload-product hidden></label><button class="seller-btn seller-btn--primary" type="submit">${product?"Lưu sản phẩm":"Tạo sản phẩm"}</button></div></form>`;
  modal.showModal();
}
function variantRow(v={}) { return `<fieldset class="seller-card seller-variant"><div class="seller-grid seller-grid--3"><input type="hidden" name="_id" value="${escapeAttr(v._id||"")}"><label class="seller-field">Tên biến thể<input name="variantName" required maxlength="100" value="${escapeAttr(v.name||"")}"></label><label class="seller-field">Giá bán<input name="price" type="number" min="1000" required value="${escapeAttr(v.price??"")}"></label><label class="seller-field">Tồn ban đầu<input name="stock" type="number" min="0" value="${escapeAttr(v.stock??0)}" ${v._id?"disabled":""}></label><label class="seller-field">SKU<input name="sku" maxlength="50" value="${escapeAttr(v.sku||"")}"></label><button type="button" class="seller-btn seller-btn--danger" data-remove-variant>Xóa biến thể</button></div></fieldset>`; }

function openVoucherModal(v=null) {
  const modal=$("#seller-modal");
  const date=(value)=>{if(!value)return "";const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
  modal.innerHTML=`<button type="button" class="seller-modal__close" data-close-modal aria-label="Đóng">×</button><h2>${v?"Sửa voucher":"Tạo voucher"}</h2><form data-form="voucher" data-voucher-id="${v? v._id:""}"><div class="seller-grid"><label class="seller-field">Mã voucher<input name="code" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_-]+" title="Chỉ dùng chữ không dấu, số, dấu gạch ngang (-) hoặc gạch dưới (_). Ví dụ: SALE2026" placeholder="Ví dụ: SALE2026" value="${escapeAttr(v?.code||"")}" ${v?"disabled":""}><small>Không dùng dấu cách hoặc dấu /.</small></label><label class="seller-field">Tên voucher<input name="title" required minlength="3" maxlength="120" value="${escapeAttr(v?.title||"")}"></label><label class="seller-field">Số tiền giảm<input name="amount" type="number" min="1000" step="1" required value="${escapeAttr(v?.amount??10000)}"></label><label class="seller-field">Đơn tối thiểu<input name="minOrder" type="number" min="0" step="1" value="${escapeAttr(v?.minOrder??0)}"></label><label class="seller-field">Tổng lượt phát hành<input name="quantity" type="number" min="1" required value="${escapeAttr(v?.quantity??10)}"></label><label class="seller-field">Ngày bắt đầu<input name="startDate" type="date" required value="${date(v?.startDate)}"></label><label class="seller-field">Ngày kết thúc<input name="endDate" type="date" required value="${date(v?.endDate)}"><small>Voucher có hiệu lực đến hết ngày đã chọn.</small></label>${v?`<label class="seller-field">Trạng thái<select name="active"><option value="true" ${v.active?"selected":""}>Bật</option><option value="false" ${!v.active?"selected":""}>Tắt</option></select></label>`:""}</div><button class="seller-btn seller-btn--primary">${v?"Lưu voucher":"Tạo voucher"}</button></form>`;
  modal.showModal();
}

function openTextModal(title, label, callback, initial = "") {
  const modal=$("#seller-modal");
  modal.innerHTML=`<button type="button" class="seller-modal__close" data-close-modal aria-label="Đóng">×</button><h2>${esc(title)}</h2><form data-form="text"><label class="seller-field">${esc(label)}<textarea name="text" required minlength="3" maxlength="500">${esc(initial)}</textarea></label><div class="seller-form-actions"><button type="button" class="seller-btn" data-close-modal>Đóng</button><button class="seller-btn seller-btn--primary">Xác nhận</button></div></form>`;
  modal.dataset.callback=callback;
  modal.showModal();
}

function closeModal() { const m=$("#seller-modal"); if(m.open)m.close(); m.dataset.callback=""; }
function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }
const asNumber = (v) => v === "" ? undefined : Number(v);

main.addEventListener("click", async (event) => {
  const button=event.target.closest("button,[data-section]"); if(!button)return;
  try {
    if(button.dataset.section) return showSection(button.dataset.section);
    if(button.matches("[data-reload]")) return showSection();
    if(button.matches("[data-close-modal]")) return closeModal();
    if(button.matches("[data-create-product]")) return openProductModal();
    if(button.matches("[data-add-variant]")) { $("[data-variant-list]").insertAdjacentHTML("beforeend",variantRow()); return; }
    if(button.matches("[data-remove-variant]")) { if($$(".seller-variant").length>1)button.closest(".seller-variant").remove(); else showToast("Sản phẩm cần ít nhất một biến thể.",{error:true}); return; }
    if(button.matches("[data-edit-product]")) { const p=await getProduct(button.dataset.editProduct); return openProductModal(p); }
    if(button.matches("[data-visibility]")) { await setProductVisibility(button.dataset.visibility,button.dataset.hidden==="true"); showToast("Đã cập nhật trạng thái hiển thị."); return showSection(); }
    if(button.matches("[data-delete-product]")) { if(confirm("Xóa mềm sản phẩm này? Đơn hàng cũ vẫn giữ snapshot.")){await deleteProduct(button.dataset.deleteProduct);showToast("Đã xóa sản phẩm.");return showSection();} return; }
    if(button.matches("[data-stock-filter]")) { const threshold=$("#stock-threshold").value; const items=await getInventory(threshold===""?{}:{threshold}); const tbody=$(".seller-table tbody"); if(tbody)tbody.innerHTML=items.map(v=>`<tr><td>${esc(v.productName)}</td><td>${esc(v.name)}</td><td>${esc(v.sku||"—")}</td><td>${formatMoney(v.price)}</td><td>${badge(v.stock,Number(v.stock)<=5?"red":"green")}</td><td><button class="seller-btn" data-stock="${v._id}" data-product="${v.product}">Điều chỉnh</button></td></tr>`).join(""); return; }
    if(button.matches("[data-stock]")) return openTextModal("Điều chỉnh tồn kho","Nhập số tồn mới hoặc số thay đổi (+ nhập, - xuất)",`stock:${button.dataset.product}:${button.dataset.stock}`);
    if(button.matches("[data-filter-orders]")) { state.orderPage=1; state.orderStatus=$("#order-status").value; state.orderQuery=$("#order-query").value.trim(); return showSection("orders"); }
    if(button.matches("[data-order-page]")) { state.orderPage=Number(button.dataset.orderPage); return showSection("orders"); }
    if(button.matches("[data-order-status]")) { await updateOrderStatus(button.dataset.orderStatus,button.dataset.next);showToast("Đã cập nhật trạng thái đơn.");return showSection(); }
    if(button.matches("[data-reject-order]")) return openTextModal("Từ chối đơn hàng","Lý do (3–300 ký tự)",`reject:${button.dataset.rejectOrder}`);
    if(button.matches("[data-order-detail]")) { const o=await getOrder(button.dataset.orderDetail); const content=`<div class="seller-order-items">${o.items.map(i=>`<p>${esc(i.productName)} · ${esc(i.variantName)} × ${i.quantity} — ${formatMoney(i.price*i.quantity)}</p>`).join("")}</div><p>Người nhận: ${esc(o.shippingAddress?.receiver)} · ${esc(o.shippingAddress?.phone)}</p><p>Địa chỉ: ${esc([o.shippingAddress?.detail,o.shippingAddress?.ward,o.shippingAddress?.district,o.shippingAddress?.province].filter(Boolean).join(", "))}</p><p>Thanh toán: ${esc(o.payment?.method)} / ${esc(o.payment?.status)}</p><p>Ghi chú: ${esc(o.note||"—")}</p><p>Tổng đơn: <strong>${formatMoney(o.total)}</strong></p>`;const m=$("#seller-modal");m.innerHTML=`<button type="button" class="seller-modal__close" data-close-modal>×</button><h2>Đơn ${esc(o.code)} · ${esc(statusLabel(o.status))}</h2>${content}`;m.showModal();return; }
    if(button.matches("[data-after-sales]")) return openTextModal(button.dataset.decision==="accept"?"Chấp nhận yêu cầu":"Từ chối yêu cầu","Ghi chú xử lý (tối thiểu 3 ký tự)",`after:${button.dataset.afterSales}:${button.dataset.decision}`);
    if(button.matches("[data-create-voucher]")) return openVoucherModal();
    if(button.matches("[data-edit-voucher]")) {const vs=await getVouchers();return openVoucherModal(vs.find(v=>v._id===button.dataset.editVoucher));}
    if(button.matches("[data-delete-voucher]")) {if(confirm("Xóa mềm voucher này?")){await deleteVoucher(button.dataset.deleteVoucher);showToast("Đã xóa voucher.");return showSection();}return;}
    if(button.matches("[data-staff]")) {await staffAction(button.dataset.staff,button.dataset.action);showToast("Đã cập nhật nhân viên.");return showSection();}
  } catch(error) { showToast(error.message||"Thao tác không thành công.",{error:true}); }
});

main.addEventListener("submit", async (event) => {
  const form=event.target.closest("form[data-form],form[data-review-reply]"); if(!form)return;
  event.preventDefault();
  try {
    if(form.dataset.form==="profile") { await updateSellerProfile({fullName:form.elements.fullName.value.trim(),phone:form.elements.phone.value.trim()});showToast("Đã cập nhật hồ sơ.");state.user=await getSellerProfile();return showSection("shop"); }
    if(form.dataset.form==="shop") { await updateShop({description:form.elements.description.value,policy:form.elements.policy.value,logo:form.elements.logo.value.trim()});showToast("Đã cập nhật cửa hàng.");state.shop=await getShop();return showSection("shop"); }
    if(form.dataset.form==="product") {
      const variants=$$(".seller-variant",form).map(row=>({ _id:row.elements._id.value||undefined,name:row.elements.variantName.value.trim(),price:Number(row.elements.price.value),stock:row.elements.stock.disabled?undefined:asNumber(row.elements.stock.value),sku:row.elements.sku.value.trim()||undefined }));
      const data={name:form.elements.name.value.trim(),category:form.elements.category.value.trim(),brand:form.elements.brand.value.trim()||undefined,description:form.elements.description.value,images:form.elements.images.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),variants};
      if(form.dataset.productId) await updateProduct(form.dataset.productId,data);else await createProduct(data);
      closeModal();showToast("Đã lưu sản phẩm.");return showSection("products");
    }
    if(form.dataset.form==="voucher") {
      const f=formObject(form), data={title:f.title.trim(),amount:Number(f.amount),minOrder:Number(f.minOrder||0),quantity:Number(f.quantity),startDate:new Date(`${f.startDate}T00:00:00`).toISOString(),endDate:new Date(`${f.endDate}T23:59:59.999`).toISOString()};
      if(f.code)data.code=f.code.trim(); if(f.active!==undefined)data.active=f.active==="true";
      if(form.dataset.voucherId) await updateVoucher(form.dataset.voucherId,data);else await createVoucher(data);
      closeModal();showToast("Đã lưu voucher.");return showSection("vouchers");
    }
    if(form.dataset.form==="text") {
      const value=form.elements.text.value.trim(), action=$("#seller-modal").dataset.callback; closeModal();
      if(action.startsWith("stock:")){const [,productId,variantId]=action.split(":"); const match=value.match(/^([+-])\s*(\d+)$/); const data=match?{delta:(match[1]==="-"?-1:1)*Number(match[2])}:{stock:Number(value)}; if(!Number.isInteger(data.stock??data.delta))throw new Error("Nhập số tồn hoặc delta là số nguyên hợp lệ.");await updateStock(productId,variantId,data);showToast("Đã cập nhật tồn kho.");return showSection("inventory");}
      if(action.startsWith("reject:")){await rejectOrder(action.split(":")[1],value);showToast("Đã từ chối đơn.");return showSection("orders");}
      if(action.startsWith("after:")){const [,id,decision]=action.split(":");await decideAfterSales(id,decision,value);showToast("Đã xử lý yêu cầu hậu mãi.");return showSection("after-sales");}
    }
    if(form.dataset.reviewReply) { await replyReview(form.dataset.reviewReply,form.elements.content.value.trim());showToast("Đã gửi phản hồi.");return showSection("reviews"); }
  } catch(error) { showToast(error.message||"Không thể lưu thông tin.",{error:true}); }
});

main.addEventListener("change", async (event) => {
  const input=event.target;
  try {
    if(input.matches("[data-upload]")){if(!input.files?.[0])return;const out=await uploadSellerImage(input.files[0]);const field=$("form[data-form=shop] [name=logo]");field.value=out.url;$(".seller-logo-preview").src=assetUrl(out.url);showToast("Đã tải logo lên.");}
    if(input.matches("[data-upload-product]")){if(!input.files?.[0])return;const out=await uploadSellerImage(input.files[0]);const textarea=$("form[data-form=product] [name=images]");textarea.value=[textarea.value.trim(),out.url].filter(Boolean).join("\n");showToast("Đã tải ảnh sản phẩm lên.");}
  } catch(error) { showToast(error.message||"Không tải được ảnh.",{error:true}); }
});

main.addEventListener("input", (event) => {
  if(event.target.matches("[name=productQuery]")) {
    state.productQuery=event.target.value;
    clearTimeout(state.searchTimer);
    state.searchTimer=setTimeout(async()=>{
      await showSection("products");
      const field=$("[name=productQuery]");
      field?.focus();
      field?.setSelectionRange(state.productQuery.length,state.productQuery.length);
    },350);
  }
});

async function init() {
  const user=await refreshProfile();
  if(!user){location.replace(`./auth.html?tab=login&redirect=${encodeURIComponent("./seller.html")}`);return;}
  if(user.role!=="seller"){showToast("Trang này chỉ dành cho người bán.",{error:true});location.replace("./index.html");return;}
  state.user=user;
  state.shop=await getShop();
  await mountShoppingChrome(user);
  shell();
  await showSection(state.section);
}

init().catch(error=>{main.innerHTML=`<div class="seller-notice">Không tải được Seller Center: ${esc(error.message||"lỗi máy chủ")} <a href="./auth.html?tab=login">Đăng nhập lại</a></div>`;});
