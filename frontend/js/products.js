import { getBrands, getCategories, getProducts, getShops, getProduct, getWishlist, addWishlist, removeWishlist } from "./product-service.js";
import { addToCart } from "./cart-service.js";
import { productCard } from "./product-card.js";
import { $, h, formatMoney, makeImage } from "./utils.js";
import { mountShoppingChrome } from "./shopping.js";
import { isCustomer } from "./auth-service.js";
import { openLoginPrompt, openModal, showToast } from "./ui.js";

const form = $("#filters-form");
const grid = $("#products-grid");
const state = { params: {}, catalog: { categories: [], brands: [], shops: [] }, wishlist: new Set(), customer: false, user: null };
const PARAMS = ["q", "category", "brand", "shop", "minPrice", "maxPrice", "sort", "page"];

function readUrl() {
  const search = new URLSearchParams(location.search);
  return Object.fromEntries(PARAMS.map((key) => [key, search.get(key) || (key === "sort" ? "newest" : key === "page" ? "1" : "")]));
}

function writeUrl(params, push = true) {
  const url = new URL(location.href);
  url.search = "";
  Object.entries(params).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  history[push ? "pushState" : "replaceState"](null, "", url);
}

function setFormValues() {
  for (const [key, value] of Object.entries(state.params)) if (form.elements[key]) form.elements[key].value = value;
}

function fill(select, rows, label) {
  select.replaceChildren(h("option", { value: "", text: label }), ...rows.map((row) => h("option", { value: row._id, text: row.name })));
}

function skeleton() {
  grid.setAttribute("aria-busy", "true");
  grid.replaceChildren(...Array.from({ length: 8 }, () => h("div", { class: "skeleton-card", "aria-hidden": "true" },
    h("span", { class: "sk sk-img" }), h("div", { class: "sk-body" }, h("span", { class: "sk sk-line" }), h("span", { class: "sk sk-line sk-line--short" }), h("span", { class: "sk sk-btn" })))));
}

function renderChips() {
  const chips = $("#filter-chips");
  const labels = {
    q: ["Từ khóa", state.params.q],
    category: ["Danh mục", state.catalog.categories.find((x) => x._id === state.params.category)?.name],
    brand: ["Thương hiệu", state.catalog.brands.find((x) => x._id === state.params.brand)?.name],
    shop: ["Gian hàng", state.catalog.shops.find((x) => x._id === state.params.shop)?.name],
    minPrice: ["Giá từ", state.params.minPrice ? formatMoney(state.params.minPrice) : ""],
    maxPrice: ["Đến", state.params.maxPrice ? formatMoney(state.params.maxPrice) : ""],
  };
  chips.replaceChildren(...Object.entries(labels).filter(([, [, value]]) => value).map(([key, [label, value]]) =>
    h("span", { class: "filter-chip" }, `${label}: ${value}`,
      h("button", { type: "button", "aria-label": `Bỏ lọc ${label}`, onclick: () => { state.params[key] = ""; state.params.page = "1"; setFormValues(); writeUrl(state.params); loadProducts(); } }, "×"))));
}

async function addItem(product, button) {
  if (!state.customer) return openLoginPrompt("thêm sản phẩm vào giỏ hàng");
  button.disabled = true;
  try {
    const detail = await getProduct(product._id);
    const variants = detail.variants || [];
    if (variants.length === 1) {
      await addToCart(product._id, variants[0]._id, 1);
      document.dispatchEvent(new CustomEvent("cart:changed"));
      showToast("Đã thêm vào giỏ hàng");
    } else {
      chooseVariant(detail, false);
    }
  } catch (error) { showToast(error.message, { error: true }); }
  finally { button.disabled = false; }
}

function chooseVariant(product, onChoose) {
  const variants = product.variants || [];
  let selected = variants.find((v) => v.stock > 0);
  const qty = h("input", { type: "number", min: "1", max: String(selected?.stock || 1), value: "1", "aria-label": "Số lượng" });
  const message = h("p", { class: "form-error", role: "alert" });
  const options = h("div", { class: "variant-list" }, ...variants.map((v) => {
    const button = h("button", { class: "variant-option", type: "button", disabled: v.stock <= 0, "aria-pressed": String(v === selected) },
      `${v.name} · ${formatMoney(v.price)} · Còn ${v.stock}`);
    button.addEventListener("click", () => {
      selected = v; qty.max = String(v.stock); qty.value = "1";
      options.querySelectorAll("button").forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
    });
    return button;
  }));
  const content = h("div", {}, options, h("label", { class: "product-qty" }, "Số lượng ", qty), message);
  const confirm = h("button", { class: "btn btn--primary", type: "button", disabled: !selected }, "Thêm vào giỏ");
  confirm.addEventListener("click", async () => {
    const amount = Number(qty.value);
    if (!selected || !Number.isInteger(amount) || amount < 1 || amount > selected.stock) {
      message.textContent = `Số lượng phải từ 1 đến ${selected?.stock || 0}.`;
      return;
    }
    confirm.disabled = true;
    try {
      if (onChoose) await onChoose(selected, amount);
      else {
        await addToCart(product._id, selected._id, amount);
        document.dispatchEvent(new CustomEvent("cart:changed"));
        showToast("Đã thêm vào giỏ hàng");
      }
      close();
    } catch (error) { message.textContent = error.message; }
    finally { confirm.disabled = false; }
  });
  const close = openModal({ title: "Chọn phân loại", description: product.name, content, actions: [confirm] });
}

function renderPagination(page, totalPages) {
  const nav = $("#products-pagination");
  nav.hidden = totalPages <= 1;
  nav.replaceChildren();
  if (totalPages <= 1) return;
  const add = (label, p, disabled = false) => nav.append(h("button", {
    type: "button", disabled, "aria-label": label === "‹" ? "Trang trước" : label === "›" ? "Trang sau" : `Trang ${label}`,
    "aria-current": p === page ? "page" : null,
    onclick: () => { state.params.page = String(p); writeUrl(state.params); loadProducts({ scroll: true }); },
  }, label));
  add("‹", page - 1, page <= 1);
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) add(String(p), p);
  add("›", page + 1, page >= totalPages);
}

async function loadProducts({ scroll = false } = {}) {
  skeleton();
  renderChips();
  try {
    const result = await getProducts({ ...state.params, page: Number(state.params.page) || 1, limit: 12 });
    grid.replaceChildren();
    if (!result.items.length) {
      grid.append(h("div", { class: "empty-state" }, h("h2", { text: "Không tìm thấy sản phẩm" }),
        h("p", { text: "Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác." })));
    } else {
      grid.append(...result.items.map((item) => productCard(item, {
        favorite: state.wishlist.has(item._id),
        showActions: !state.user || state.customer,
        onFavorite: (p, button) => toggleFavorite(p, button),
        onAdd: addItem,
      })));
    }
    $("#products-count").textContent = `${result.total} sản phẩm`;
    renderPagination(result.page, result.totalPages);
    if (scroll) $("#page-content").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    grid.replaceChildren(h("div", { class: "error-state", role: "alert" }, h("p", { text: error.message }),
      h("button", { class: "btn btn--primary", type: "button", onclick: () => loadProducts() }, "Thử lại")));
    $("#products-pagination").hidden = true;
  } finally { grid.setAttribute("aria-busy", "false"); }
}

async function toggleFavorite(product, button) {
  if (!state.customer) return openLoginPrompt("lưu sản phẩm yêu thích");
  button.disabled = true;
  try {
    if (state.wishlist.has(product._id)) { await removeWishlist(product._id); state.wishlist.delete(product._id); }
    else { await addWishlist(product._id); state.wishlist.add(product._id); }
    button.textContent = state.wishlist.has(product._id) ? "♥" : "♡";
    button.classList.toggle("is-favorite", state.wishlist.has(product._id));
    button.setAttribute("aria-pressed", String(state.wishlist.has(product._id)));
  } catch (error) { showToast(error.message, { error: true }); }
  finally { button.disabled = false; }
}

async function init() {
  $("#page-content").hidden = false;
  state.user = await mountShoppingChrome();
  state.params = readUrl();
  state.customer = isCustomer(state.user);
  try {
    const [categories, brands, shops] = await Promise.all([getCategories(), getBrands(), getShops()]);
    state.catalog = { categories, brands, shops };
    fill(form.elements.category, categories, "Tất cả danh mục");
    fill(form.elements.brand, brands, "Tất cả thương hiệu");
    fill(form.elements.shop, shops, "Tất cả gian hàng");
  } catch (error) { showToast(error.message, { error: true }); }
  if (state.customer) {
    try { (await getWishlist()).forEach((p) => state.wishlist.add(p._id)); } catch (error) { showToast(error.message, { error: true }); }
  }
  setFormValues();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.params = Object.fromEntries(PARAMS.map((key) => [key, form.elements[key]?.value.trim() || (key === "sort" ? "newest" : key === "page" ? "1" : "")]));
    state.params.page = "1";
    if (state.params.minPrice && state.params.maxPrice && Number(state.params.minPrice) > Number(state.params.maxPrice)) {
      showToast("Giá tối thiểu không thể lớn hơn giá tối đa.", { error: true }); return;
    }
    writeUrl(state.params);
    loadProducts();
    closeFilters();
  });
  $("#filter-reset").addEventListener("click", () => {
    state.params = { q: "", category: "", brand: "", shop: "", minPrice: "", maxPrice: "", sort: "newest", page: "1" };
    setFormValues(); writeUrl(state.params); loadProducts();
  });
  const filters = $("#product-filters"), scrim = $("#filter-scrim"), toggle = $("#filter-toggle");
  function closeFilters() { filters.classList.remove("is-open"); scrim.classList.remove("is-open"); scrim.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", () => { filters.classList.add("is-open"); scrim.hidden = false; scrim.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); });
  $("#filter-close").addEventListener("click", closeFilters);
  scrim.addEventListener("click", closeFilters);
  window.addEventListener("popstate", () => { state.params = readUrl(); setFormValues(); loadProducts(); });
  await loadProducts();
}

init();
