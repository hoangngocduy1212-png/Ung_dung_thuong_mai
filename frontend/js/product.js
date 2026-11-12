import { getProduct, addWishlist, removeWishlist, getWishlist } from "./product-service.js";
import { addToCart, getCart } from "./cart-service.js";
import { getProductReviews } from "./review-service.js";
import { getAvailableVouchers, getPlatformVouchers, claimVoucher } from "./voucher-service.js";
import { $, h, formatMoney, formatDate, makeImage } from "./utils.js";
import { mountShoppingChrome, notifyCartChanged } from "./shopping.js";
import { isCustomer } from "./auth-service.js";
import { openLoginPrompt, openModal, showToast } from "./ui.js";

const main = $("#page-content");
const id = new URLSearchParams(location.search).get("id");
const state = { product: null, variant: null, user: null, customer: false, favorite: false, reviewPage: 1 };

function showError(message) {
  main.replaceChildren(h("div", { class: "error-state", role: "alert" },
    h("h1", { text: "Không tìm thấy sản phẩm" }),
    h("p", { text: message }),
    h("a", { class: "btn btn--primary", href: "./products.html", text: "Xem sản phẩm khác" })));
}

function chosenVariant() {
  return state.product.variants.find((v) => v._id === state.variant);
}

function neutralDescription(value, productName) {
  const text = String(value || "")
    .replace(/(?:^|[\s,;|–—-])(?:hàng\s+)?chính\s+hãng(?:\s*100%)?/gi, " ")
    .replace(/giao\s+nhanh\s+2\s+giờ/gi, " ")
    .replace(/\s*[-–—|:]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return !text || text.toLocaleLowerCase("vi-VN") === String(productName || "").toLocaleLowerCase("vi-VN")
    ? "Chưa có thông tin mô tả."
    : text;
}

async function addChosen(variant, quantity, buyNow = false) {
  if (buyNow) {
    const currentCart = await getCart();
    if (currentCart.items.some((line) => String(line.variant) === String(variant._id))) {
      showToast("Biến thể này đã có trong giỏ. Hãy kiểm tra số lượng trong giỏ trước khi thanh toán.", { error: true });
      return;
    }
  }
  const cart = await addToCart(state.product._id, variant._id, quantity);
  notifyCartChanged();
  showToast("Đã thêm vào giỏ hàng");
  if (buyNow) {
    const item = cart.items.find((line) => String(line.variant) === String(variant._id));
    if (item) location.href = `./checkout.html?items=${encodeURIComponent(item._id)}`;
  }
}

function renderDetail(p) {
  const images = (p.images || []).filter(Boolean);
  const mainImage = makeImage(images[0], p.name);
  mainImage.id = "product-main-image";
  const thumbs = h("div", { class: "product-thumbs", "aria-label": "Ảnh sản phẩm" },
    ...images.map((src, index) => {
      const button = h("button", { type: "button", "aria-label": `Xem ảnh ${index + 1}`, "aria-pressed": String(index === 0) }, makeImage(src, `${p.name}, ảnh ${index + 1}`));
      button.addEventListener("click", () => {
        mainImage.src = src;
        thumbs.querySelectorAll("button").forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
      });
      return button;
    }));
  const gallery = h("section", { class: "product-gallery" }, h("div", { class: "product-gallery__main" }, mainImage), thumbs);
  const status = h("span", { class: "shop-status", text: "Còn hàng" });
  const price = h("div", { class: "product-detail__price" });
  const variantList = h("div", { class: "variant-list", role: "group", "aria-label": "Chọn biến thể" });
  const qty = h("input", { type: "number", min: "1", value: "1", inputmode: "numeric", "aria-label": "Số lượng" });
  const error = h("p", { class: "form-error", role: "alert", "aria-live": "polite" });
  const canShowActions = !state.user || state.customer;
  const favorite = state.customer
    ? h("button", { class: "btn btn--ghost", type: "button", "aria-pressed": String(state.favorite), text: state.favorite ? "♥ Đã yêu thích" : "♡ Yêu thích" })
    : null;
  const addButton = h("button", { class: "btn btn--primary", type: "button", text: "Thêm vào giỏ" });
  const buyButton = h("button", { class: "btn btn--ghost", type: "button", text: "Mua ngay" });
  const actionButtons = h("div", { class: "product-actions", hidden: !canShowActions }, addButton, buyButton, favorite);
  const detailInfo = h("section", { class: "product-info" },
    h("div", { class: "product-meta" },
      h("span", { text: p.brand?.name || "Chưa phân loại thương hiệu" }),
      h("span", { text: p.category?.name || "" }),
      h("a", { href: `./products.html?shop=${encodeURIComponent(p.shop?._id || "")}`, text: `Bán bởi ${p.shop?.name || "gian hàng"}` }),
      h("span", { text: `${p.ratingAvg || 0} ★ · ${p.ratingCount || 0} đánh giá` })),
    h("h1", { text: p.name }),
    status,
    price,
    h("strong", { text: "Chọn phân loại" }),
    variantList,
    h("label", { class: "product-qty" }, "Số lượng", qty),
    error, actionButtons,
    h("div", { class: "product-copy", text: neutralDescription(p.description, p.name) }));
  const voucherSection = h("section", { class: "shop-panel", "aria-labelledby": "detail-vouchers-heading" },
    h("h2", { id: "detail-vouchers-heading", text: "Voucher có thể nhận" }),
    h("div", { class: "detail-vouchers", id: "detail-vouchers" }, h("p", { class: "voucher-hint", text: "Đang tải voucher…" })));
  const reviewSection = h("section", { class: "reviews-section", "aria-labelledby": "reviews-heading" },
    h("div", { class: "page-heading" }, h("h2", { id: "reviews-heading", text: "Đánh giá sản phẩm" }), h("span", { text: `${p.ratingAvg || 0} ★ · ${p.ratingCount || 0}` })),
    h("div", { class: "review-list", id: "review-list", "aria-live": "polite" }, h("p", { class: "loading-line", text: "Đang tải đánh giá…" })),
    h("button", { class: "btn btn--ghost reviews-more", id: "reviews-more", type: "button", hidden: true, text: "Xem thêm đánh giá" }));
  main.replaceChildren(
    h("nav", { class: "breadcrumbs", "aria-label": "Điều hướng" },
      h("a", { href: "./index.html", text: "Trang chủ" }), " / ",
      h("a", { href: "./products.html", text: "Sản phẩm" }), " / ", h("span", { text: p.name })),
    h("div", { class: "product-detail" }, gallery, detailInfo),
    voucherSection, reviewSection);
  state.product = p;
  state.variant = p.variants.find((v) => v.stock > 0)?._id || p.variants[0]?._id;

  function updateVariant() {
    const chosen = chosenVariant();
    price.textContent = chosen ? formatMoney(chosen.price) : "Hết hàng";
    status.textContent = chosen?.stock > 0 ? `Còn ${chosen.stock} sản phẩm` : "Hết hàng";
    status.classList.toggle("shop-status--danger", !chosen?.stock);
    qty.max = String(Math.max(1, chosen?.stock || 0));
    qty.value = "1";
    addButton.disabled = buyButton.disabled = !chosen || chosen.stock < 1;
    variantList.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.variant === state.variant)));
  }
  p.variants.forEach((v) => {
    const button = h("button", { class: "variant-option", type: "button", disabled: v.stock <= 0, "aria-pressed": "false", dataset: { variant: v._id } },
      `${v.name} · ${formatMoney(v.price)} · Còn ${v.stock}`);
    button.addEventListener("click", () => { state.variant = v._id; updateVariant(); });
    variantList.append(button);
  });
  updateVariant();
  qty.addEventListener("change", () => {
    const variant = chosenVariant();
    if (!variant) return;
    const value = Number(qty.value);
    if (!Number.isInteger(value) || value < 1 || value > variant.stock) {
      qty.value = String(Math.min(Math.max(1, value || 1), Math.max(1, variant.stock)));
      error.textContent = `Số lượng phải từ 1 đến ${variant.stock}.`;
    } else error.textContent = "";
  });
  async function submit(buy) {
    if (!state.customer) return openLoginPrompt(buy ? "mua sản phẩm" : "thêm sản phẩm vào giỏ hàng");
    const variant = chosenVariant();
    const quantity = Number(qty.value);
    if (!variant || quantity < 1 || quantity > variant.stock) { error.textContent = "Vui lòng chọn biến thể và số lượng hợp lệ."; return; }
    const button = buy ? buyButton : addButton;
    button.disabled = true;
    try { await addChosen(variant, quantity, buy); }
    catch (e) { error.textContent = e.message; showToast(e.message, { error: true }); }
    finally { button.disabled = false; }
  }
  addButton.addEventListener("click", () => submit(false));
  buyButton.addEventListener("click", () => submit(true));
  favorite?.addEventListener("click", async () => {
    favorite.disabled = true;
    try {
      if (state.favorite) await removeWishlist(p._id); else await addWishlist(p._id);
      state.favorite = !state.favorite;
      favorite.textContent = state.favorite ? "♥ Đã yêu thích" : "♡ Yêu thích";
      favorite.setAttribute("aria-pressed", String(state.favorite));
    } catch (e) { showToast(e.message, { error: true }); }
    finally { favorite.disabled = false; }
  });
  $("#reviews-more").addEventListener("click", () => { state.reviewPage += 1; loadReviews(p._id, true); });
  loadVouchers(p);
  loadReviews(p._id);
}

async function loadVouchers(product) {
  const list = $("#detail-vouchers");
  try {
    const vouchers = state.customer
      ? await getAvailableVouchers(product.shop?._id)
      : await getPlatformVouchers();
    list.replaceChildren();
    if (!vouchers.length) { list.append(h("p", { class: "voucher-hint", text: "Hiện chưa có voucher phù hợp." })); return; }
    vouchers.forEach((voucher) => {
      const button = h("button", { class: "btn btn--ghost", type: "button", disabled: voucher.remaining <= 0 || voucher.alreadyClaimed },
        voucher.pointsCost > 0 ? `Đổi ${voucher.pointsCost} điểm` : voucher.alreadyClaimed ? "Đã nhận" : voucher.remaining <= 0 ? "Hết lượt" : "Nhận");
      button.addEventListener("click", async () => {
        if (!state.customer) return openLoginPrompt("nhận voucher");
        button.disabled = true;
        try {
          if (voucher.pointsCost > 0) {
            const { redeemVoucher } = await import("./voucher-service.js");
            await redeemVoucher(voucher._id);
          } else await claimVoucher(voucher._id);
          button.textContent = "Đã nhận";
          showToast("Đã nhận voucher");
        } catch (error) { button.disabled = false; showToast(error.message, { error: true }); }
      });
      list.append(h("div", { class: "detail-voucher" },
        h("div", {}, h("strong", { text: voucher.title }), h("p", { text: `${formatMoney(voucher.amount)} · Đơn từ ${formatMoney(voucher.minOrder)} · HSD ${formatDate(voucher.endDate)}` })),
        button));
    });
  } catch (error) {
    list.replaceChildren(h("p", { class: "form-error", role: "alert", text: error.message }));
  }
}

async function loadReviews(productId, append = false) {
  const list = $("#review-list");
  const button = $("#reviews-more");
  try {
    const data = await getProductReviews(productId, { page: state.reviewPage, limit: 10 });
    if (!append) list.replaceChildren();
    data.items.forEach((review) => {
      const card = h("article", { class: "review-card" },
        h("strong", { text: review.customer?.fullName || "Khách hàng ***" }),
        h("span", { class: "product-rating", "aria-label": `${review.rating} trên 5 sao`, text: ` ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}` }),
        h("small", { text: ` · ${formatDate(review.createdAt)}${review.variantName ? ` · ${review.variantName}` : ""}` }),
        h("p", { text: review.content || "Khách hàng chưa để lại nội dung." }));
      if (review.reply?.content) card.append(h("div", { class: "review-reply" }, h("strong", { text: "Phản hồi từ gian hàng" }), h("p", { text: review.reply.content })));
      list.append(card);
    });
    if (!data.items.length && !append) list.append(h("p", { class: "loading-line", text: "Sản phẩm chưa có đánh giá." }));
    button.hidden = state.reviewPage >= data.totalPages;
  } catch (error) {
    if (!append) list.replaceChildren(h("div", { class: "error-state" }, h("p", { text: error.message }), h("button", { class: "btn btn--ghost", type: "button", onclick: () => loadReviews(productId) }, "Thử lại")));
  }
}

async function init() {
  state.user = await mountShoppingChrome();
  state.customer = isCustomer(state.user);
  if (!id) { showError("Thiếu mã sản phẩm."); return; }
  try {
    const product = await getProduct(id);
    document.title = `${product.name} — TechStore`;
    document.querySelector('meta[name="description"]').content = String(product.description || product.name).slice(0, 155);
    if (state.customer) {
      try { state.favorite = (await getWishlist()).some((item) => item._id === product._id); } catch { state.favorite = false; }
    }
    renderDetail(product);
  } catch (error) { showError(error.message); }
}

init();
