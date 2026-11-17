import { $, $$, h } from "./utils.js";
import { refreshProfile, ROLE_LABEL } from "./auth-service.js";
import { getCart, countCartItems } from "./cart-service.js";
import { clearSession } from "./session.js";
import { showToast, comingSoon } from "./ui.js";
import { getCategories, getBrands } from "./product-service.js";
import { ORDER_STATUS_LABELS, statusClass } from "./status-labels.js";

let cartChangeListenerBound = false;

async function updateCartBadge() {
  const badge = $("#shopping-chrome .cart__count");
  if (!badge) return;
  try { badge.textContent = String(countCartItems(await getCart())); }
  catch (error) { showToast(error.message, { error: true }); }
}

export function safeRedirectTarget(value) {
  if (!value || typeof value !== "string") return "./index.html";
  try {
    const target = new URL(value, location.href);
    if (target.origin !== location.origin || !target.pathname.startsWith(location.pathname.replace(/[^/]*$/, ""))) return "./index.html";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "./index.html";
  }
}

export function requireCustomerPage() {
  const main = $("#page-content");
  if (!main) return false;
  const setMessage = (message) => {
    main.replaceChildren(h("section", { class: "shop-state" },
      h("h1", { text: "Trang mua hàng" }),
      h("p", { text: message })));
    main.hidden = false;
  };
  (async () => {
    const token = localStorage.getItem("techstore.token") || sessionStorage.getItem("techstore.token");
    const user = token ? await refreshProfile() : null;
    if (!user) {
      const target = `${location.pathname}${location.search}${location.hash}`;
      location.replace(`./auth.html?tab=login&redirect=${encodeURIComponent(target)}`);
      return;
    }
    if (user.role !== "customer") {
      setMessage("Trang này dành cho khách hàng.");
      return;
    }
    main.hidden = false;
    document.dispatchEvent(new CustomEvent("shopping:authorized", { detail: { user } }));
  })().catch((error) => {
    setMessage(error.message || "Không thể xác minh tài khoản.");
  });
  main.hidden = true;
  return true;
}

function accountBlock(user, { onLogout } = {}) {
  const wrap = h("div", { class: "account-area shopping-account" });
  if (!user) {
    wrap.append(h("a", { class: "account-trigger", href: "./auth.html?tab=login", text: "Đăng nhập / Đăng ký" }));
    return wrap;
  }
  const userIcon = h("span", { class: "account-link__icon", "aria-hidden": "true" });
  userIcon.append(document.createRange().createContextualFragment('<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'));
  const trigger = h("button", { class: "account-trigger", type: "button", "aria-label": `Tài khoản ${user.fullName || user.email}`, "aria-haspopup": "menu", "aria-expanded": "false", "aria-controls": "shopping-account-menu" }, userIcon,
    h("span", { class: "account-link__copy" }, h("small", { text: "Xin chào," }), h("strong", { text: user.fullName || user.email })));
  const menuItems = [];
  const menuButton = (text, action) => h("button", { role: "menuitem", type: "button", onclick: () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); action(); } }, text);
  if (user.role === "customer") {
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=profile", text: "Tài khoản" }));
    menuItems.push(h("a", { role: "menuitem", href: "./orders.html", text: "Đơn hàng" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=addresses", text: "Sổ địa chỉ" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=security", text: "Đổi mật khẩu" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=vouchers", text: "Voucher của tôi" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=points" }, "Điểm thưởng", user.points != null ? h("span", { class: "account-menu__badge", text: `${Number(user.points).toLocaleString("vi-VN")} điểm` }) : null));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=wishlist", text: "Yêu thích" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=reviews", text: "Đánh giá của tôi" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=after-sales", text: "Hoàn tiền / Đổi hàng" }));
    menuItems.push(h("a", { role: "menuitem", href: "./account.html?section=complaints", text: "Khiếu nại" }));
  } else if (user.role === "cskh") {
    menuItems.push(h("a", { role: "menuitem", href: "./staff.html", text: "Vào khu vực CSKH" }));
  } else if (user.role === "seller") {
    menuItems.push(menuButton("Vào Seller Center", comingSoon));
  } else {
    menuItems.push(menuButton("Vào trang quản trị", comingSoon));
  }
  menuItems.push(menuButton("Đăng xuất", onLogout || (() => { clearSession(); location.replace("./index.html"); })));
  const menu = h("div", { class: "account-menu", id: "shopping-account-menu", role: "menu", hidden: true },
    h("div", { class: "account-menu__head" }, h("strong", { text: user.fullName || user.email }), h("small", { text: ROLE_LABEL[user.role] || "" })),
    ...menuItems);
  trigger.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    trigger.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", event => {
    if (!wrap.contains(event.target)) { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });
  wrap.append(trigger, menu);
  return wrap;
}

/** Header/footer chung; variant="support" dùng nội dung dành cho nhân viên CSKH. */
export async function mountShoppingChrome(userOverride, options = {}) {
  const host = $("#shopping-chrome");
  if (!host) return null;
  const user = userOverride === undefined ? await refreshProfile() : userOverride;
  const support = options.variant === "support";
  const announcement = h("div", { class: "announcement" },
    h("div", { class: "container announcement__inner" },
      h("span", { text: support ? "Khu vực nội bộ dành cho nhân viên chăm sóc khách hàng" : "Phí vận chuyển cố định cho mỗi đơn hàng" }),
      h("a", { href: support ? "./index.html" : "./index.html#support", text: support ? "Về trang mua sắm →" : "Hỗ trợ khách hàng →" })));
  const icon = document.createElement("span");
  icon.className = "brand__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.append(document.createRange().createContextualFragment('<svg viewBox="0 0 48 48" fill="none"><rect x="9" y="9" width="30" height="22" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M5 36h38l-3.5 4H8.5L5 36Z" fill="currentColor"/><path d="M20 35h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'));
  const brand = h("a", { class: "brand", href: "./index.html", "aria-label": "TechStore - Trang chủ" },
    icon,
    h("span", { class: "brand__wordmark" }, "Tech", h("span", {}, "Store")));
  const search = h("form", { class: "search", role: "search" },
    h("input", { type: "search", name: "q", placeholder: "Tìm laptop, điện thoại, phụ kiện...", "aria-label": "Tìm kiếm sản phẩm" }),
    h("button", { class: "search__submit", type: "submit", text: "Tìm kiếm" }));
  search.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = search.elements.q.value.trim();
    location.href = `./products.html${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  });
  const cartIcon = h("span", { class: "cart__icon", "aria-hidden": "true" });
  cartIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.4" fill="currentColor"/><circle cx="18" cy="20" r="1.4" fill="currentColor"/></svg>';
  const cart = h("a", { class: "cart", href: "./cart.html", "aria-label": "Giỏ hàng" },
    cartIcon, h("span", { class: "cart__count", text: "0" }), h("span", { class: "cart__label", text: "Giỏ hàng" }));
  const mainHeader = h("div", { class: "site-header" },
    h("div", { class: "container header-main" }, brand,
      support ? h("div", { class: "support-header-title" }, h("span", { class: "section-kicker", text: "CHĂM SÓC KHÁCH HÀNG" }), h("strong", { text: "Trung tâm hỗ trợ" })) : search,
      accountBlock(user, options), support || (user && user.role !== "customer") ? null : cart));
  let nav;
  if (!support) {
    const navItems = [h("a", { href: "./products.html", text: "Tất cả sản phẩm" })];
    try {
      const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
      categories.filter((category) => !category.parent).forEach((category) => navItems.push(
        h("a", { href: `./products.html?category=${encodeURIComponent(category._id)}`, text: category.name })));
      brands.forEach((brand) => navItems.push(
        h("a", { href: `./products.html?brand=${encodeURIComponent(brand._id)}`, text: brand.name })));
    } catch (error) {
      showToast(error.message, { error: true });
    }
    nav = h("nav", { class: "category-nav", "aria-label": "Danh mục và thương hiệu" },
      h("div", { class: "container category-nav__inner" }, h("div", { class: "category-links" }, ...navItems)));
  }
  const footer = h("footer", { class: "site-footer" },
    h("div", { class: "container footer__inner" },
      h("a", { class: "brand brand--footer", href: "./index.html", text: "TechStore" }),
      h("p", { text: support ? "Chăm sóc khách hàng · Tiếp nhận, hỗ trợ và theo dõi khiếu nại." : "Giỏ hàng nhiều gian hàng được tách thành các đơn riêng; phí vận chuyển tính theo từng đơn." }),
      h("small", { text: "© 2026 TechStore." })));
  host.replaceChildren(announcement, mainHeader, ...(nav ? [nav] : []));
  $("#shopping-footer")?.replaceWith(footer);
  try {
    if (!support && user?.role === "customer") cart.querySelector(".cart__count").textContent = String(countCartItems(await getCart()));
  } catch (error) {
    showToast(error.message, { error: true });
  }
  if (!support && user?.role === "customer" && !cartChangeListenerBound) {
    document.addEventListener("cart:changed", updateCartBadge);
    cartChangeListenerBound = true;
  }
  return user;
}

document.addEventListener("points:changed", (event) => {
  const badgeText = `${Number(event.detail?.points || 0).toLocaleString("vi-VN")} điểm`;
  document.querySelectorAll(".account-menu__badge").forEach((badge) => { badge.textContent = badgeText; });
});

export const statusLabels = ORDER_STATUS_LABELS;
export const orderStatusClass = statusClass;

export function notifyCartChanged() {
  document.dispatchEvent(new CustomEvent("cart:changed"));
}

export function element(selector) { return $(selector); }
export function elements(selector) { return $$(selector); }
