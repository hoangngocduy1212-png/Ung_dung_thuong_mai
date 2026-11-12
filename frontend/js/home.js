import { formatDate, formatMoney, debounce, h, $ } from "./utils.js";
import { isCustomer, logout, refreshProfile, ROLE_LABEL } from "./auth-service.js";
import { takeFlash } from "./session.js";
import { addWishlist, getBrands, getCategories, getProduct, getProducts, getShops, getWishlist, removeWishlist } from "./product-service.js";
import { addToCart, countCartItems, getCart } from "./cart-service.js";
import { claimVoucher, getAvailableVouchers, getPlatformVouchers, redeemVoucher } from "./voucher-service.js";
import { comingSoon, openLoginPrompt, openModal, showToast } from "./ui.js";
import { productCard as sharedProductCard } from "./product-card.js";

const PAGE_SIZE = 12;
const STORE_PAGE_SIZE = 8;

const state = {
  user: null,
  customer: false,
  wishlist: new Set(),
  categories: [],
  brands: [],
  shops: [],
  filters: { q: "", category: "", brand: "", minPrice: "", maxPrice: "", sort: "newest", page: 1 },
  store: { shop: null, page: 1, items: [] },
};

/* ------------------------------------------------------------------ */
/* Dựng phần tử dùng chung                                            */
/* ------------------------------------------------------------------ */
const skeletonCards = (count) =>
  Array.from({ length: count }, () =>
    h("div", { class: "skeleton-card", "aria-hidden": "true" },
      h("span", { class: "sk sk-img" }),
      h("div", { class: "sk-body" },
        h("span", { class: "sk sk-line sk-line--short" }),
        h("span", { class: "sk sk-line" }),
        h("span", { class: "sk sk-line sk-line--short" }),
        h("span", { class: "sk sk-btn" }))));

const stateBox = (message, { retry, error = false } = {}) =>
  h("div", { class: `state-box${error ? " state-box--error" : ""}`, role: error ? "alert" : "status" },
    h("p", { text: message }),
    retry ? h("button", { class: "btn btn--primary", type: "button", onclick: retry }, "Thử lại") : null);

function setBusy(container, busy) {
  container.setAttribute("aria-busy", busy ? "true" : "false");
}

function productCard(p) {
  const showActions = !state.user || state.customer;
  return sharedProductCard(p, {
    favorite: state.wishlist.has(p._id),
    showActions,
    onFavorite: showActions ? (product, button) => onToggleWishlist(product, button) : null,
    onAdd: showActions ? (product, button) => onAddToCart(product, button) : null,
  });
}

function renderGrid(container, items, { empty = "Chưa có sản phẩm phù hợp.", append = false } = {}) {
  if (!append) container.replaceChildren();
  else container.querySelectorAll(".skeleton-card, .state-box").forEach((n) => n.remove());
  if (!items.length && !append) {
    container.append(stateBox(empty));
    return;
  }
  container.append(...items.map(productCard));
}

/* ------------------------------------------------------------------ */
/* Tài khoản, giỏ hàng                                                */
/* ------------------------------------------------------------------ */
function renderAccount() {
  const area = $("#account-area");
  area.replaceChildren();
  const user = state.user;

  if (!user) {
    area.append(
      h("div", { class: "account-link", style: "cursor:default" },
        h("span", { class: "account-link__icon", "aria-hidden": "true" },
          document.createRange().createContextualFragment(
            '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>')),
        h("span", { class: "account-link__copy" },
          h("small", { text: "Tài khoản" }),
          h("strong", {},
            h("a", { href: "./auth.html?tab=login" }, "Đăng nhập"), " / ",
            h("a", { href: "./auth.html?tab=register" }, "Đăng ký")))));
    return;
  }

  const items = [];
  const item = (label, handler, cls = "") =>
    h("button", { type: "button", role: "menuitem", class: cls, onclick: () => { closeAccountMenu(); handler(); } }, label);

  if (user.role === "customer") {
    items.push(item("Tài khoản", comingSoon));
    items.push(h("a", { href: "./orders.html", role: "menuitem", class: "account-menu__link", text: "Đơn hàng" }));
    ["Voucher của tôi", "Điểm thưởng"].forEach((l) => items.push(item(l, comingSoon)));
  } else if (user.role === "seller") {
    items.push(item("Vào Seller Center", comingSoon));
  } else {
    items.push(item("Vào trang quản trị", comingSoon));
  }
  items.push(item("Đăng xuất", onLogout, "is-danger"));

  const menu = h("div", { class: "account-menu", id: "account-menu", role: "menu", hidden: true },
    h("div", { class: "account-menu__head" },
      h("strong", { text: user.fullName || user.email }),
      h("small", { text: ROLE_LABEL[user.role] || "" })),
    items);

  const trigger = h("button", {
    class: "account-trigger", type: "button", id: "account-trigger",
    "aria-haspopup": "menu", "aria-expanded": "false", "aria-controls": "account-menu",
  },
    h("span", { class: "account-link__icon", "aria-hidden": "true" },
      document.createRange().createContextualFragment(
        '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>')),
    h("span", { class: "account-link__copy" },
      h("small", { text: "Xin chào," }),
      h("strong", { text: user.fullName || user.email })));

  trigger.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("button")?.focus();
  });
  area.append(trigger, menu);
}

function closeAccountMenu() {
  const menu = $("#account-menu");
  const trigger = $("#account-trigger");
  if (menu && !menu.hidden) {
    menu.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
  }
}

async function onLogout() {
  await logout();
  location.reload();
}

async function refreshCartBadge() {
  const button = $("#cart-button");
  button.hidden = !state.customer;
  if (!state.customer) return;
  try {
    const count = countCartItems(await getCart());
    $("#cart-count").textContent = String(count);
    button.setAttribute("aria-label", `Giỏ hàng, ${count} sản phẩm`);
  } catch {
    /* giữ số cũ khi lỗi */
  }
}

/* ------------------------------------------------------------------ */
/* Thao tác sản phẩm                                                  */
/* ------------------------------------------------------------------ */
async function onToggleWishlist(product, button) {
  if (!state.user || !state.customer) return openLoginPrompt("lưu sản phẩm vào danh sách yêu thích");
  const was = state.wishlist.has(product._id);
  button.classList.add("is-loading");
  try {
    if (was) await removeWishlist(product._id);
    else await addWishlist(product._id);
    if (was) state.wishlist.delete(product._id);
    else state.wishlist.add(product._id);
    syncFavoriteButtons(product._id);
    showToast(was ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  } catch (error) {
    showToast(error.message, { error: true });
  } finally {
    button.classList.remove("is-loading");
  }
}

function syncFavoriteButtons(productId) {
  const on = state.wishlist.has(productId);
  document.querySelectorAll(`.favorite[data-id="${CSS.escape(productId)}"]`).forEach((b) => {
    b.classList.toggle("is-favorite", on);
    b.textContent = on ? "♥" : "♡";
    b.setAttribute("aria-pressed", String(on));
  });
}

async function onAddToCart(product, button) {
  if (!state.user || !state.customer) return openLoginPrompt("thêm sản phẩm vào giỏ hàng");
  button.classList.add("is-loading");
  try {
    const detail = await getProduct(product._id);
    const variants = detail.variants || [];
    if (!variants.length) throw new Error("Sản phẩm chưa có phân loại để mua");
    if (variants.length === 1) {
      await submitCart(product, variants[0]._id, 1);
    } else {
      openVariantPicker(product, variants);
    }
  } catch (error) {
    showToast(error.message, { error: true });
  } finally {
    button.classList.remove("is-loading");
  }
}

async function submitCart(product, variantId, quantity) {
  await addToCart(product._id, variantId, quantity);
  showToast("Đã thêm vào giỏ hàng");
  refreshCartBadge();
}

function openVariantPicker(product, variants) {
  const firstAvailable = variants.find((v) => v.stock > 0);
  const name = `variant-${product._id}`;
  const list = h("fieldset", { class: "variant-list" },
    h("legend", { class: "sr-only", text: "Chọn phân loại" }),
    variants.map((v) =>
      h("label", { class: "variant-option" },
        h("input", { type: "radio", name, value: v._id, class: "sr-only", disabled: v.stock <= 0, checked: v === firstAvailable }),
        h("span", { class: "variant-option__name" },
          h("span", { text: v.name }),
          h("small", { text: v.stock > 0 ? `Còn ${v.stock}` : "Hết hàng" })),
        h("strong", { text: formatMoney(v.price) }))));
  const qty = h("input", { type: "number", id: "variant-qty", min: "1", value: "1", inputmode: "numeric" });
  const error = h("p", { class: "modal__error", role: "alert" });
  const confirm = h("button", { class: "btn btn--primary", type: "button", disabled: !firstAvailable }, "Thêm vào giỏ");
  let close;
  confirm.addEventListener("click", async () => {
    const chosen = list.querySelector("input:checked");
    const variant = variants.find((v) => v._id === chosen?.value);
    const quantity = Math.max(1, parseInt(qty.value, 10) || 1);
    if (!variant) { error.textContent = "Vui lòng chọn phân loại"; return; }
    if (quantity > variant.stock) { error.textContent = `Chỉ còn ${variant.stock} sản phẩm`; return; }
    confirm.disabled = true;
    try {
      await submitCart(product, variant._id, quantity);
      close();
    } catch (e) {
      error.textContent = e.message;
      confirm.disabled = false;
    }
  });
  close = openModal({
    title: product.name,
    description: "Chọn phân loại bạn muốn mua.",
    content: h("div", {}, list, h("label", { class: "qty-row" }, "Số lượng", qty), error),
    actions: [confirm, h("button", { class: "btn btn--ghost", type: "button", onclick: () => close() }, "Hủy")],
  });
}

/* ------------------------------------------------------------------ */
/* Bộ lọc & danh mục                                                  */
/* ------------------------------------------------------------------ */
function fillSelect(select, rows, label) {
  select.replaceChildren(h("option", { value: "", text: label }),
    ...rows.map((r) => h("option", { value: r._id, text: r.name })));
}

function renderCategories() {
  const roots = state.categories.filter((c) => !c.parent);
  const childrenOf = (id) => state.categories.filter((c) => String(c.parent) === String(id));

  const links = $("#category-links");
  links.replaceChildren(...roots.map((c) =>
    h("a", { href: `./products.html?category=${encodeURIComponent(c._id)}`, "data-id": c._id }, c.name)));

  const panel = $("#all-categories-panel");
  panel.replaceChildren(
    ...roots.map((c) =>
      h("div", { class: "category-panel__group" },
        h("h3", { text: c.name.toUpperCase() }),
        h("a", { href: `./products.html?category=${encodeURIComponent(c._id)}` }, `Tất cả ${c.name}`),
        childrenOf(c._id).map((ch) =>
          h("a", { href: `./products.html?category=${encodeURIComponent(ch._id)}` }, ch.name)))),
    state.brands.length
      ? h("div", { class: "category-panel__brands" },
          h("h3", { text: "THƯƠNG HIỆU" }),
          h("div", {}, state.brands.map((b) =>
            h("a", { href: `./products.html?brand=${encodeURIComponent(b._id)}` }, b.name))))
      : null);

  const options = [];
  roots.forEach((c) => {
    options.push(h("option", { value: c._id, text: c.name }));
    childrenOf(c._id).forEach((ch) => options.push(h("option", { value: ch._id, text: `— ${ch.name}` })));
  });
  $("#filter-category").replaceChildren(h("option", { value: "", text: "Tất cả" }), ...options);
  fillSelect($("#filter-brand"), state.brands, "Tất cả");
}

function closeNavPanels() {
  const btn = $("#all-categories-btn");
  $("#all-categories-panel").hidden = true;
  btn.setAttribute("aria-expanded", "false");
  $("#category-nav").classList.remove("is-open");
  $("#nav-toggle").setAttribute("aria-expanded", "false");
}

function applyCategory(id) {
  Object.assign(state.filters, { category: id, page: 1 });
  $("#filter-category").value = id;
  loadProducts({ scroll: true });
}

function applyBrand(id) {
  Object.assign(state.filters, { brand: id, page: 1 });
  $("#filter-brand").value = id;
  loadProducts({ scroll: true });
}

function readFilters() {
  const f = state.filters;
  f.category = $("#filter-category").value;
  f.brand = $("#filter-brand").value;
  f.minPrice = $("#filter-min").value.trim();
  f.maxPrice = $("#filter-max").value.trim();
  f.sort = $("#filter-sort").value;
  f.page = 1;
}

let productsController;
async function loadProducts({ scroll = false } = {}) {
  const grid = $("#product-grid");
  const status = $("#search-status");
  const f = state.filters;
  if (f.minPrice && f.maxPrice && Number(f.minPrice) > Number(f.maxPrice)) {
    status.textContent = "Giá tối thiểu không được lớn hơn giá tối đa.";
    status.style.color = "#c0453f";
    return;
  }
  status.style.color = "";
  productsController?.abort();
  productsController = new AbortController();
  const signal = productsController.signal;

  setBusy(grid, true);
  grid.replaceChildren(...skeletonCards(PAGE_SIZE / 2));
  if (scroll) $("#products").scrollIntoView({ behavior: "smooth", block: "start" });

  const params = { page: f.page, limit: PAGE_SIZE, sort: f.sort };
  ["q", "category", "brand", "minPrice", "maxPrice"].forEach((k) => { if (f[k]) params[k] = f[k]; });

  try {
    const data = await getProducts(params, signal);
    if (signal.aborted) return;
    renderGrid(grid, data.items, { empty: f.q ? `Không tìm thấy sản phẩm cho "${f.q}".` : "Không có sản phẩm phù hợp với bộ lọc." });
    status.textContent = data.total
      ? `Hiển thị ${data.items.length} / ${data.total} sản phẩm${f.q ? ` cho "${f.q}"` : ""}`
      : "";
    renderPagination(data.page, data.totalPages);
  } catch (error) {
    if (error.name === "AbortError" || signal.aborted) return;
    grid.replaceChildren(stateBox(error.message, { error: true, retry: () => loadProducts() }));
    $("#pagination").hidden = true;
  } finally {
    setBusy(grid, false);
  }
}

function renderPagination(page, totalPages) {
  const nav = $("#pagination");
  nav.replaceChildren();
  nav.hidden = totalPages <= 1;
  if (totalPages <= 1) return;
  const go = (p) => { state.filters.page = p; loadProducts({ scroll: true }); };
  const btn = (label, p, { disabled = false, current = false, aria } = {}) =>
    h("button", { type: "button", disabled, "aria-label": aria, "aria-current": current ? "page" : null, onclick: () => go(p) }, label);

  nav.append(btn("‹", page - 1, { disabled: page <= 1, aria: "Trang trước" }));
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  let last = 0;
  [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b).forEach((p) => {
    if (p - last > 1) nav.append(h("span", { "aria-hidden": "true" }, "…"));
    nav.append(btn(String(p), p, { current: p === page, aria: `Trang ${p}` }));
    last = p;
  });
  nav.append(btn("›", page + 1, { disabled: page >= totalPages, aria: "Trang sau" }));
}

/* ------------------------------------------------------------------ */
/* Tìm kiếm                                                           */
/* ------------------------------------------------------------------ */
function setupSearch() {
  const input = $("#product-search");
  const clear = $("#search-clear");
  const box = $("#search-suggest");
  let suggestController;
  let activeIndex = -1;

  const hideSuggest = () => {
    box.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  };
  const runSearch = (q) => {
    hideSuggest();
    const query = q.trim();
    location.href = `./products.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  };

  const suggest = debounce(async () => {
    const q = input.value.trim();
    if (q.length < 1) return hideSuggest();
    suggestController?.abort();
    suggestController = new AbortController();
    try {
      const data = await getProducts({ q, limit: 5 }, suggestController.signal);
      box.replaceChildren();
      if (!data.items.length) {
        box.append(h("div", { class: "suggest-empty", text: "Không có gợi ý phù hợp" }));
      } else {
        data.items.forEach((p) => box.append(
          h("button", { type: "button", role: "option", class: "suggest-item", onclick: () => { input.value = p.name; runSearch(p.name); } },
            h("span", { text: p.name }), h("span", { text: formatMoney(p.minPrice) }))));
      }
      box.hidden = false;
      input.setAttribute("aria-expanded", "true");
    } catch (error) {
      if (error.name !== "AbortError") hideSuggest();
    }
  }, 300);

  input.addEventListener("input", () => {
    clear.hidden = !input.value;
    if (!input.value.trim()) hideSuggest();
    else suggest();
  });
  input.addEventListener("keydown", (e) => {
    const options = [...box.querySelectorAll(".suggest-item")];
    if (e.key === "Escape") return hideSuggest();
    if (!options.length || box.hidden) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options.forEach((o, i) => o.setAttribute("aria-selected", String(i === activeIndex)));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      options[activeIndex].click();
    }
  });
  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    suggest.cancel();
    runSearch(input.value);
  });
  clear.addEventListener("click", () => {
    input.value = "";
    clear.hidden = true;
    hideSuggest();
    input.focus();
    if (state.filters.q) runSearch("");
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#search-form")) hideSuggest(); });
}

/* ------------------------------------------------------------------ */
/* Bán chạy & cửa hàng                                                */
/* ------------------------------------------------------------------ */
async function loadPopular() {
  const grid = $("#popular-grid");
  setBusy(grid, true);
  grid.replaceChildren(...skeletonCards(4));
  try {
    const data = await getProducts({ sort: "popular", limit: 4 });
    renderGrid(grid, data.items, { empty: "Chưa có sản phẩm nào." });
  } catch (error) {
    grid.replaceChildren(stateBox(error.message, { error: true, retry: loadPopular }));
  } finally {
    setBusy(grid, false);
  }
}

function renderStoreMenu() {
  const menu = $("#store-menu");
  menu.replaceChildren(...state.shops.map((s) =>
    h("button", {
      type: "button", role: "option", class: `store-option${s._id === state.store.shop ? " is-selected" : ""}`,
      "aria-selected": String(s._id === state.store.shop),
      onclick: () => { selectStore(s._id); closeStoreMenu(); },
    }, h("strong", { text: s.name }))));
  const current = state.shops.find((s) => s._id === state.store.shop);
  $("#active-store-name").textContent = current ? current.name : "Chưa có gian hàng";
}

function closeStoreMenu() {
  $("#store-menu").hidden = true;
  $("#store-picker").setAttribute("aria-expanded", "false");
}

function selectStore(id) {
  state.store.shop = id;
  state.store.page = 1;
  renderStoreMenu();
  loadStoreProducts();
}

async function loadStoreProducts({ append = false } = {}) {
  const grid = $("#store-grid");
  const more = $("#store-more");
  if (!state.store.shop) {
    grid.replaceChildren(stateBox("Hiện chưa có gian hàng nào đang hoạt động."));
    more.hidden = true;
    return;
  }
  setBusy(grid, true);
  if (!append) grid.replaceChildren(...skeletonCards(4));
  try {
    const data = await getProducts({ shop: state.store.shop, page: state.store.page, limit: STORE_PAGE_SIZE, sort: "newest" });
    renderGrid(grid, data.items, { empty: "Gian hàng này chưa có sản phẩm.", append });
    more.hidden = data.page >= data.totalPages;
  } catch (error) {
    grid.replaceChildren(stateBox(error.message, { error: true, retry: () => loadStoreProducts() }));
    more.hidden = true;
  } finally {
    setBusy(grid, false);
  }
}

/* ------------------------------------------------------------------ */
/* Voucher                                                            */
/* ------------------------------------------------------------------ */
async function loadVouchers() {
  const list = $("#voucher-list");
  setBusy(list, true);
  list.replaceChildren(stateBox("Đang tải voucher..."));
  try {
    const vouchers = await getPlatformVouchers();
    const claimed = new Set();
    if (state.customer) {
      try {
        (await getAvailableVouchers()).forEach((v) => { if (v.alreadyClaimed) claimed.add(String(v._id)); });
      } catch { /* bỏ qua, vẫn hiển thị danh sách công khai */ }
    }
    if (!vouchers.length) {
      list.replaceChildren(stateBox("Hiện chưa có voucher toàn sàn."));
      return;
    }
    list.replaceChildren(...vouchers.map((v) => voucherCard(v, claimed.has(String(v._id)))));
  } catch (error) {
    list.replaceChildren(stateBox(error.message, { error: true, retry: loadVouchers }));
  } finally {
    setBusy(list, false);
  }
}

function voucherCard(v, alreadyClaimed) {
  const expired = new Date(v.endDate) <= new Date();
  const soldOut = Number(v.remaining) <= 0;
  const byPoints = Number(v.pointsCost) > 0;
  let label = byPoints ? `Đổi ${v.pointsCost} điểm` : "Nhận";
  let disabled = false;
  if (expired) { label = "Hết hạn"; disabled = true; }
  else if (alreadyClaimed) { label = "Đã nhận"; disabled = true; }
  else if (soldOut) { label = "Hết lượt"; disabled = true; }

  const showButton = !state.user || state.customer;
  const button = showButton
    ? h("button", { class: `btn ${disabled ? "btn--ghost" : "btn--primary"}`, type: "button", disabled }, label)
    : null;
  button?.addEventListener("click", async () => {
    if (!state.user || !state.customer) return openLoginPrompt("nhận voucher");
    button.disabled = true;
    try {
      if (byPoints) {
        const res = await redeemVoucher(v._id);
        if (state.user && res?.points != null) state.user.points = res.points;
      } else {
        await claimVoucher(v._id);
      }
      showToast(`Đã nhận voucher ${v.code}`);
      button.textContent = "Đã nhận";
      button.className = "btn btn--ghost";
    } catch (error) {
      showToast(error.message, { error: true });
      if (error.status === 409) {
        button.textContent = /hết lượt/i.test(error.message) ? "Hết lượt" : "Đã nhận";
        button.className = "btn btn--ghost";
      } else {
        button.disabled = false;
      }
    }
  });

  return h("article", { class: "voucher-card" },
    h("div", { class: "voucher-card__amount", text: `Giảm ${formatMoney(v.amount)}` }),
    h("p", { class: "voucher-card__title", text: v.title || v.code }),
    h("p", { class: "voucher-card__meta" },
      `Mã ${v.code}`, h("br"),
      v.minOrder ? `Đơn từ ${formatMoney(v.minOrder)}` : "Không yêu cầu đơn tối thiểu", h("br"),
      `HSD: ${formatDate(v.endDate)}`, h("br"),
      expired ? "" : `Còn ${Math.max(0, v.remaining)} lượt`),
    button);
}

/* ------------------------------------------------------------------ */
/* Khởi tạo                                                           */
/* ------------------------------------------------------------------ */
function setupChrome() {
  $("#nav-toggle").addEventListener("click", (e) => {
    const nav = $("#category-nav");
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  const all = $("#all-categories-btn");
  all.addEventListener("click", () => {
    const panel = $("#all-categories-panel");
    panel.hidden = !panel.hidden;
    all.setAttribute("aria-expanded", String(!panel.hidden));
  });
  $("#store-picker").addEventListener("click", (e) => {
    const menu = $("#store-menu");
    menu.hidden = !menu.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!menu.hidden));
  });
  $("#store-more button").addEventListener("click", () => { state.store.page += 1; loadStoreProducts({ append: true }); });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".category-menu")) {
      $("#all-categories-panel").hidden = true;
      all.setAttribute("aria-expanded", "false");
    }
    if (!e.target.closest(".store-control")) closeStoreMenu();
    if (!e.target.closest("#account-area")) closeAccountMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeStoreMenu();
      closeAccountMenu();
      $("#all-categories-panel").hidden = true;
      all.setAttribute("aria-expanded", "false");
    }
  });

  $("#filter-bar").addEventListener("submit", (e) => { e.preventDefault(); readFilters(); loadProducts(); });
  $("#filter-sort").addEventListener("change", () => { readFilters(); loadProducts(); });
  $("#filter-reset").addEventListener("click", () => {
    $("#filter-bar").reset();
    $("#product-search").value = "";
    $("#search-clear").hidden = true;
    Object.assign(state.filters, { q: "", category: "", brand: "", minPrice: "", maxPrice: "", sort: "newest", page: 1 });
    loadProducts();
  });
  $("#cart-button").addEventListener("click", () => { location.href = "./cart.html"; });
}

async function loadCatalog() {
  try {
    [state.categories, state.brands] = await Promise.all([getCategories(), getBrands()]);
    renderCategories();
  } catch (error) {
    $("#category-links").replaceChildren(
      h("button", { class: "btn btn--ghost", type: "button", onclick: loadCatalog }, "Không tải được danh mục — Thử lại"));
  }
}

async function loadShops() {
  try {
    state.shops = await getShops();
    state.store.shop = state.shops[0]?._id || null;
    renderStoreMenu();
    loadStoreProducts();
  } catch (error) {
    $("#active-store-name").textContent = "Không tải được";
    $("#store-grid").replaceChildren(stateBox(error.message, { error: true, retry: loadShops }));
  }
}

async function init() {
  const flash = takeFlash();
  if (flash) showToast(flash);

  setupChrome();
  setupSearch();

  state.user = await refreshProfile();
  state.customer = isCustomer(state.user);
  renderAccount();

  if (state.customer) {
    try {
      (await getWishlist()).forEach((p) => state.wishlist.add(p._id));
    } catch { /* tim sẽ hiển thị trống nếu lỗi */ }
  }

  await Promise.all([loadCatalog(), refreshCartBadge()]);
  loadVouchers();
  loadPopular();
  loadProducts();
  loadShops();
}

init();
