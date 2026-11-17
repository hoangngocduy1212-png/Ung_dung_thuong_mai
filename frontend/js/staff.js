import { request } from "./api.js";
import { logout } from "./auth-service.js";
import { getToken, clearSession, setFlash } from "./session.js";
import { h, $, formatMoney } from "./utils.js";
import { openModal, showToast } from "./ui.js";
import { mountShoppingChrome } from "./shopping.js";
import { ORDER_STATUS_LABELS, COMPLAINT_STATUS_LABELS } from "./status-labels.js";
import { getStaffList, getStaffDetail, actOnComplaint, deleteStaffReview } from "./staff-service.js";

const sections = {
  complaints: ["Khiếu nại", "Tiếp nhận và hỗ trợ khách hàng, từ phản hồi đầu tiên đến kết quả cuối cùng.", "inbox"],
  customers: ["Khách hàng", "Tra cứu thông tin liên lạc, địa chỉ và các đơn hàng gần đây.", "users"],
  orders: ["Đơn hàng", "Tìm đơn hàng theo mã đơn, mã nhóm hoặc thông tin khách hàng.", "box"],
  reviews: ["Đánh giá sản phẩm", "Xem đánh giá theo sản phẩm và gỡ những nội dung cần xử lý.", "star"],
  history: ["Lịch sử xử lý", "Các khiếu nại bạn phụ trách đã hoàn tất, gồm cả đơn được admin xử lý.", "history"],
};
const paths = {
  inbox: 'M4 4h16v12h-5l-2 3h-2l-2-3H4z M4 12h5l2 3h2l2-3h5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  box: 'M12 3 3 8v9l9 5 9-5V8z M3 8l9 5 9-5 M12 13v9 M7.5 5.5l9 5',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
  history: 'M3 11a9 9 0 1 1 2.4 7 M3 4v7h7 M12 7v5l3 2',
  arrow: 'm9 5 7 7-7 7',
  refresh: 'M20 7a9 9 0 0 0-15-2L2 8 M2 2v6h6 M4 17a9 9 0 0 0 15 2l3-3 M22 22v-6h-6',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
};
let user;
let generation = 0;
let summaryGeneration = 0;
let signingOut = false;

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" })) svg.setAttribute(key, value);
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", paths[name] || paths.inbox);
  svg.append(path);
  return svg;
}

const button = (text, onClick, kind = "ghost") => h("button", { type: "button", class: `btn btn--${kind}`, onclick: onClick }, text);
const date = (value) => value ? new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";
const idOf = (value) => value?._id || value;
const badge = (status, labels = COMPLAINT_STATUS_LABELS) => h("span", { class: labels === ORDER_STATUS_LABELS ? `status status--${status}` : `account-badge account-badge--${status}`, text: labels[status] || status || "—" });
const note = (text, kind = "") => h("p", { class: `staff-note ${kind}`, text });

function href(section, params = {}) {
  const query = new URLSearchParams({ section });
  for (const [key, value] of Object.entries(params)) if (value !== "" && value != null) query.set(key, value);
  return `./staff.html?${query}`;
}
function currentHref(changes = {}) {
  const params = Object.fromEntries(new URLSearchParams(location.search));
  return href(params.section || "complaints", { ...params, ...changes });
}
const routeLink = (text, target, className = "staff-link") => h("a", { href: target, class: className, "data-route": "" }, text);

function navigate(target, replace = false) {
  history[replace ? "replaceState" : "pushState"]({}, "", target);
  window.scrollTo({ top: 0, behavior: "instant" });
  renderPage(true);
}
function readRoute() {
  const params = new URLSearchParams(location.search);
  const section = Object.hasOwn(sections, params.get("section")) ? params.get("section") : "complaints";
  const scope = section === "history" ? "history" : params.get("scope") === "mine" ? "mine" : "pool";
  return { section, scope, id: params.get("id"), q: params.get("q") || "", status: params.get("status") || "", rating: params.get("rating") || "", product: params.get("product") || "", page: Math.max(1, parseInt(params.get("page")) || 1) };
}

async function signOut() {
  if (signingOut) return;
  signingOut = true;
  const control = $("#shopping-account-menu button");
  if (control) { control.disabled = true; control.textContent = "Đang đăng xuất…"; }
  await logout();
  location.replace("./auth.html?tab=staff&view=login");
}

async function renderShell() {
  const nav = h("nav", { class: "account-nav staff-nav", "aria-label": "Chức năng CSKH" });
  for (const [key, [label, , symbol]] of Object.entries(sections)) {
    const item = routeLink(label, href(key), "staff-nav__link");
    item.prepend(icon(symbol));
    item.dataset.section = key;
    nav.append(item);
  }
  $("#staff-app").replaceChildren(
    h("nav", { class: "breadcrumbs", "aria-label": "Đường dẫn" }, h("a", { href: "./index.html", text: "Trang chủ" }), " / Chăm sóc khách hàng"),
    h("div", { class: "account-shell staff-shell" },
    h("aside", { class: "staff-sidebar" },
      h("p", { class: "section-kicker staff-sidebar__label", text: "CHỨC NĂNG CSKH" }), nav,
      h("div", { class: "staff-sidebar__foot" }, h("strong", { text: user.fullName }), h("p", { text: "Nhân viên chăm sóc khách hàng" }), h("a", { href: "./index.html", class: "staff-link", text: "Về trang mua sắm →" }))),
    h("div", { class: "staff-main" },
      h("div", { class: "staff-summary", id: "staff-summary", "aria-label": "Tổng quan khiếu nại" }),
      h("main", { class: "staff-workspace", id: "workspace", tabindex: "-1" }))),
  );
  await mountShoppingChrome(user, { variant: "support", onLogout: signOut });
  document.addEventListener("click", event => {
    const anchor = event.target.closest("a[data-route]");
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(anchor.getAttribute("href"));
  });
  window.addEventListener("popstate", () => renderPage(true));
  window.addEventListener("storage", () => { if (!getToken()) location.replace("./auth.html?tab=staff&view=login"); });
}

async function refreshSummary() {
  const version = ++summaryGeneration;
  const scopes = ["pool", "mine", "history"];
  const results = await Promise.allSettled(scopes.map(scope => getStaffList("complaints", { scope, limit: 1 })));
  if (version !== summaryGeneration) return;
  $("#staff-summary").replaceChildren(...scopes.map((scope, index) => {
    const [label, help] = [["Chờ tiếp nhận", "Khiếu nại mới của khách hàng"], ["Tôi phụ trách", "Đang xử lý hoặc đã chuyển admin"], ["Đã hoàn tất", "Lịch sử khiếu nại tôi phụ trách"]][index];
    const target = href(scope === "history" ? "history" : "complaints", scope === "history" ? {} : { scope });
    return h("a", { class: `shop-panel staff-metric staff-metric--${scope}`, href: target, "data-route": "" },
      h("span", { class: "staff-metric__icon" }, icon(["inbox", "users", "history"][index])),
      h("div", {}, h("span", { text: label }), h("strong", { text: results[index].status === "fulfilled" ? results[index].value.total : "—" }), h("small", { text: help })), icon("arrow"));
  }));
}

function heading(route) {
  return h("div", { class: "page-heading staff-page-heading" }, h("div", {}, h("span", { class: "section-kicker", text: "CHĂM SÓC KHÁCH HÀNG" }), h("h1", { text: sections[route.section][0] }), h("p", { text: sections[route.section][1] })),
    h("button", { class: "btn btn--ghost", type: "button", onclick: () => { renderPage(); refreshSummary(); } }, icon("refresh"), "Làm mới"));
}

function filterForm(route) {
  const placeholder = { customers: "Tên, email hoặc số điện thoại", orders: "Mã đơn, mã nhóm, tên, email hoặc SĐT", reviews: "Tên sản phẩm", complaints: "Mã khiếu nại, mã đơn, tên hoặc SĐT", history: "Mã khiếu nại, mã đơn, tên hoặc SĐT" }[route.section];
  const search = h("input", { id: "staff-search", name: "q", type: "search", value: route.q, placeholder, maxlength: "200" });
  const form = h("form", { class: "staff-filters", role: "search", "aria-label": "Bộ lọc danh sách" },
    h("label", { class: "account-field staff-field staff-field--search" }, h("span", { text: "Tìm kiếm" }), h("span", { class: "staff-search-input" }, icon("search"), search)));
  if (route.section === "orders" || route.section === "reviews") {
    const reviews = route.section === "reviews";
    const select = h("select", { name: reviews ? "rating" : "status", id: "staff-filter" }, h("option", { value: "", text: reviews ? "Tất cả số sao" : "Tất cả trạng thái" }),
      ...Object.entries(reviews ? { 5: "5 sao", 4: "4 sao", 3: "3 sao", 2: "2 sao", 1: "1 sao" } : ORDER_STATUS_LABELS).map(([value, label]) => h("option", { value, text: label })));
    select.value = reviews ? route.rating : route.status;
    form.append(h("div", { class: "account-field staff-field" }, h("label", { for: "staff-filter", text: reviews ? "Số sao" : "Trạng thái" }), select));
  }
  form.append(h("button", { type: "submit", class: "btn btn--primary", text: "Tìm kiếm" }));
  if (route.q || route.status || route.rating || route.product) form.append(routeLink("Xóa bộ lọc", href(route.section, { scope: route.scope }), "btn btn--ghost"));
  if (route.product) form.append(h("span", { class: "staff-filter-chip", text: "Đang lọc theo sản phẩm đã chọn" }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    navigate(href(route.section, { scope: route.scope, product: route.product, ...values, q: values.q.trim() }));
  });
  return form;
}

function table(headers, rows, caption) {
  return h("div", { class: "staff-table-wrap", role: "region", "aria-label": caption, tabindex: "0" },
    h("p", { class: "staff-table-hint", text: "Cuộn ngang để xem đầy đủ bảng →" }),
    h("table", { class: "staff-table" }, h("caption", { class: "sr-only", text: caption }),
      h("thead", {}, h("tr", {}, ...headers.map(text => h("th", { scope: "col", text })))), h("tbody", {}, ...rows.map(cells => h("tr", {}, ...cells.map(cell => h("td", {}, cell)))))));
}
const primaryCell = (main, sub) => h("div", { class: "staff-cell" }, main, sub ? h("small", { text: sub }) : null);
function pagination(data) {
  return h("div", { class: "staff-pagination" },
    h("span", { text: data.total ? `${(data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.total)} / ${data.total} kết quả` : "0 kết quả" }),
    h("div", {}, data.page > 1 ? routeLink("← Trước", currentHref({ page: data.page - 1 }), "btn btn--ghost") : h("button", { class: "btn btn--ghost", disabled: true, text: "← Trước" }),
      h("span", { text: `Trang ${data.page} / ${data.totalPages}` }),
      data.page < data.totalPages ? routeLink("Sau →", currentHref({ page: data.page + 1 }), "btn btn--ghost") : h("button", { class: "btn btn--ghost", disabled: true, text: "Sau →" })));
}

function listRows(route, items) {
  if (route.section === "customers") return table(["Khách hàng", "Liên hệ", "Trạng thái", "Ngày tham gia", ""], items.map(c => [
    primaryCell(h("strong", { text: c.fullName }), `${Number(c.points || 0).toLocaleString("vi-VN")} điểm`), primaryCell(c.email, c.phone), badge(c.status, { active: "Hoạt động", locked: "Đã khóa" }), date(c.createdAt),
    routeLink("Xem khách hàng", currentHref({ id: c._id })),
  ]), "Danh sách khách hàng");
  if (route.section === "orders") return table(["Đơn hàng", "Khách hàng", "Gian hàng", "Tổng tiền", "Trạng thái", ""], items.map(o => [
    primaryCell(h("strong", { text: o.code }), date(o.createdAt)), primaryCell(o.customer?.fullName || "Khách hàng không còn tồn tại", o.customer?.phone), o.shop?.name || "—", formatMoney(o.total), badge(o.status, ORDER_STATUS_LABELS),
    routeLink("Xem đơn hàng", currentHref({ id: o._id })),
  ]), "Danh sách đơn hàng");
  return table(["Khiếu nại / Đơn hàng", "Khách hàng", "Nội dung", "Trạng thái", route.section === "history" ? "Hoàn tất lúc" : "Tiếp nhận lúc", ""], items.map(c => [
    primaryCell(h("strong", { text: c.code }), c.orderCode), primaryCell(c.contactName, c.contactPhone), h("span", { class: "staff-truncate", text: c.reason }), badge(c.status), date(route.section === "history" ? c.resolvedAt : c.createdAt),
    routeLink("Xem khiếu nại", currentHref({ id: c._id })),
  ]), "Danh sách khiếu nại");
}

function reviewsList(route, items) {
  return h("div", { class: "staff-reviews" }, ...items.map(review => h("article", { class: "staff-review" },
    h("div", { class: "staff-review__header" }, h("div", {}, review.product?._id ? routeLink(review.product.name, href("reviews", { product: review.product._id })) : h("strong", { text: "Sản phẩm không còn tồn tại" }),
      h("small", { text: review.shop?.name || "—" })), h("span", { class: "staff-stars", "aria-label": `${review.rating} trên 5 sao`, text: `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}` })),
    h("p", { class: "staff-preserve", text: review.content || "Khách hàng không để lại nội dung." }),
    review.reply?.content ? h("blockquote", {}, h("strong", { text: "Phản hồi của gian hàng" }), h("p", { class: "staff-preserve", text: review.reply.content })) : null,
    h("div", { class: "staff-review__footer" }, h("span", {}, review.customer?._id ? routeLink(review.customer.fullName, href("customers", { id: review.customer._id })) : "Khách hàng không còn tồn tại", ` · ${date(review.createdAt)}`),
      button("Xóa đánh giá", () => confirmDeleteReview(review), "danger")),
  )));
}

function confirmDeleteReview(review) {
  const errorBox = h("p", { class: "staff-form-error", role: "alert" });
  const cancel = button("Giữ đánh giá", () => close());
  const confirm = button("Xác nhận xóa", async () => {
    confirm.disabled = cancel.disabled = true;
    confirm.textContent = "Đang xóa…";
    try {
      await deleteStaffReview(review._id);
      close();
      showToast("Đã xóa đánh giá và cập nhật điểm sản phẩm.");
      renderPage();
    } catch (error) {
      errorBox.textContent = error.message;
    } finally {
      confirm.disabled = cancel.disabled = false;
      confirm.textContent = "Xác nhận xóa";
    }
  }, "danger");
  const close = openModal({ title: "Xóa đánh giá này?", description: `Đánh giá của ${review.customer?.fullName || "khách hàng"} về ${review.product?.name || "sản phẩm"} sẽ bị ẩn khỏi sàn.`,
    content: h("div", {}, h("p", { class: "staff-preserve", text: review.content || `${review.rating} sao` }), errorBox), actions: [cancel, confirm] });
}

async function renderList(route, version) {
  const workspace = $("#workspace");
  const controls = h("section", { class: "shop-panel staff-panel" });
  if (route.section === "complaints") controls.append(h("nav", { class: "staff-tabs", "aria-label": "Nhóm khiếu nại" },
    ...[["pool", "Chờ tiếp nhận"], ["mine", "Tôi phụ trách"]].map(([scope, label]) => h("a", { href: href("complaints", { scope }), "data-route": "", "aria-current": route.scope === scope ? "page" : null, text: label }))));
  controls.append(filterForm(route));
  const results = h("div", { class: "staff-results", "aria-busy": "true" }, note("Đang tải danh sách…"));
  controls.append(results);
  workspace.append(controls);
  const resource = route.section === "history" ? "complaints" : route.section;
  const params = { q: route.q, page: route.page, limit: 10 };
  if (resource === "complaints") params.scope = route.scope;
  if (resource === "orders") params.status = route.status;
  if (resource === "reviews") Object.assign(params, { rating: route.rating, product: route.product });
  const data = await getStaffList(resource, params);
  if (version !== generation) return;
  if (route.page > data.totalPages) { navigate(currentHref({ page: data.totalPages }), true); return; }
  results.setAttribute("aria-busy", "false");
  results.replaceChildren(data.items.length ? (route.section === "reviews" ? reviewsList(route, data.items) : listRows(route, data.items)) :
    h("div", { class: "staff-empty", role: "status" }, icon(sections[route.section][2]), h("h2", { text: "Chưa có kết quả" }),
      h("p", { text: route.q || route.rating || route.product || route.status ? "Thử đổi từ khóa hoặc xóa bộ lọc để xem thêm kết quả." : route.section === "complaints" && route.scope === "pool" ? "Khi khách hàng gửi khiếu nại mới, bạn sẽ thấy tại đây." : "Các bản ghi phù hợp sẽ hiển thị tại đây." })), pagination(data));
}

function panel(title, ...children) { return h("section", { class: "shop-panel staff-panel staff-detail-panel" }, h("h2", { text: title }), ...children); }
function facts(entries) {
  return h("dl", { class: "staff-facts" }, ...entries.filter(([, value]) => value !== undefined).map(([label, value]) => h("div", {}, h("dt", { text: label }), h("dd", {}, value == null || value === "" ? "—" : value))));
}
function addressText(address) { return [address?.detail, address?.ward, address?.district, address?.province].filter(Boolean).join(", ") || "—"; }

function orderContent(order) {
  const payment = order.payment || {};
  return h("div", { class: "staff-detail-stack" },
    panel("Thông tin đơn hàng", facts([["Mã đơn", order.code], ["Mã nhóm", order.groupCode], ["Gian hàng", order.shop?.name], ["Ngày đặt", date(order.createdAt)], ["Trạng thái", badge(order.status, ORDER_STATUS_LABELS)], ["Khách hàng", order.customer?.fullName], ["Số điện thoại", order.customer?.phone], ["Email", order.customer?.email]])),
    panel("Sản phẩm trong đơn", table(["Sản phẩm", "Phân loại", "Đơn giá", "Số lượng", "Thành tiền"], (order.items || []).map(item => [item.productName || "—", item.variantName || "—", formatMoney(item.price), String(item.quantity), formatMoney(item.price * item.quantity)]), "Sản phẩm trong đơn"),
      facts([["Tiền hàng", formatMoney(order.subtotal)], ["Giảm giá", formatMoney(order.discount)], ["Phí giao hàng", formatMoney(order.shippingFee)], ["Tổng thanh toán", h("strong", { text: formatMoney(order.total) })], ["Voucher", order.voucherCode], ["Thanh toán", payment.method === "online" ? "Online" : "COD"], ["Tình trạng thanh toán", { unpaid: "Chưa thanh toán", paid: "Đã thanh toán", refunded: "Đã hoàn tiền" }[payment.status] || "—"]])),
    panel("Giao hàng", facts([["Người nhận", order.shippingAddress?.receiver], ["Số điện thoại", order.shippingAddress?.phone], ["Địa chỉ", addressText(order.shippingAddress)], ["Ghi chú", order.note || "Không có"]])),
    panel("Lịch sử trạng thái", ...(order.statusHistory?.length ? order.statusHistory.map(item => h("p", {}, badge(item.status, ORDER_STATUS_LABELS), ` ${date(item.at)}`, item.note ? h("span", { class: "staff-preserve", text: ` · ${item.note}` }) : null)) : [note("Chưa có lịch sử cập nhật trạng thái.")])),
  );
}

function customerContent(customer) {
  return h("div", { class: "staff-detail-stack" },
    panel("Thông tin khách hàng", facts([["Họ tên", customer.fullName], ["Email", customer.email], ["Số điện thoại", customer.phone], ["Trạng thái", badge(customer.status, { active: "Hoạt động", locked: "Đã khóa" })], ["Điểm tích lũy", String(customer.points || 0)], ["Ngày tham gia", date(customer.createdAt)]])),
    panel("Địa chỉ nhận hàng", ...(customer.addresses?.length ? customer.addresses.map(address => h("div", { class: "staff-address" }, h("strong", { text: `${address.receiver} · ${address.phone}` }), address.isDefault ? badge("active", { active: "Mặc định" }) : null, h("p", { text: addressText(address) }))) : [note("Khách hàng chưa lưu địa chỉ.")])),
    panel("20 đơn hàng gần đây nhất", customer.recentOrders?.length ? table(["Mã đơn", "Gian hàng", "Trạng thái", "Tổng tiền", "Ngày đặt"], customer.recentOrders.map(order => [routeLink(order.code, href("orders", { id: order._id })), order.shop?.name || "—", badge(order.status, ORDER_STATUS_LABELS), formatMoney(order.total), date(order.createdAt)]), "Đơn hàng gần đây của khách") : note("Khách hàng chưa có đơn hàng."),
      routeLink("Tra cứu thêm đơn hàng của khách →", href("orders", { q: customer.email }))),
  );
}

function complaintForm(complaint) {
  const action = h("select", { id: "complaint-action", name: "action" }, h("option", { value: "respond", text: "Phản hồi khách hàng" }), h("option", { value: "resolve", text: "Hoàn tất khiếu nại" }), h("option", { value: "escalate", text: "Chuyển quản trị viên" }));
  const labelText = h("span", { text: "Nội dung phản hồi" });
  const input = h("textarea", { id: "complaint-message", name: "message", rows: "6", required: true, minlength: "2", maxlength: "2000", "aria-describedby": "complaint-help complaint-error" });
  const help = h("p", { id: "complaint-help", class: "staff-help" });
  const errorBox = h("p", { id: "complaint-error", class: "staff-form-error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn btn--primary", text: complaint.status === "moi" ? "Nhận xử lý & phản hồi" : "Gửi phản hồi" });
  const refresh = button("Tải lại trạng thái", () => { renderPage(); refreshSummary(); });
  refresh.hidden = true;
  const form = h("form", { class: "staff-action-form" }, h("h2", { text: "Xử lý khiếu nại" }),
    h("div", { class: "account-field staff-field" }, h("label", { for: "complaint-action", text: "Thao tác" }), action), h("label", { class: "account-field staff-field" }, labelText, input), help, errorBox, submit, refresh);
  function updateAction() {
    const isRespond = action.value === "respond";
    labelText.textContent = isRespond ? "Nội dung phản hồi" : action.value === "resolve" ? "Kết quả xử lý" : "Lý do chuyển quản trị viên";
    input.minLength = isRespond ? 2 : 3;
    input.setCustomValidity("");
    submit.textContent = isRespond ? complaint.status === "moi" ? "Nhận xử lý & phản hồi" : "Gửi phản hồi" : action.value === "resolve" ? "Hoàn tất khiếu nại" : "Chuyển quản trị viên";
    help.textContent = isRespond ? "Phản hồi đầu tiên sẽ nhận khiếu nại này về cho bạn. Khách hàng xem được nội dung phản hồi." : action.value === "resolve" ? "Kết quả được gửi cho khách hàng và lưu vào lịch sử xử lý của bạn." : "Ghi rõ vấn đề cần admin quyết định. Sau khi chuyển, bạn chỉ có thể theo dõi kết quả.";
  }
  action.addEventListener("change", updateAction);
  input.addEventListener("input", () => { input.setCustomValidity(""); input.removeAttribute("aria-invalid"); });
  updateAction();
  async function perform(selected, value) {
    const sourceUrl = location.href;
    submit.disabled = true;
    submit.textContent = "Đang gửi…";
    action.disabled = true;
    input.readOnly = true;
    errorBox.textContent = "";
    try {
      const body = { [selected === "respond" ? "content" : selected === "resolve" ? "result" : "note"]: value };
      await actOnComplaint(complaint._id, selected, body);
      showToast(selected === "respond" ? "Đã gửi phản hồi cho khách hàng." : selected === "resolve" ? "Đã hoàn tất và lưu vào lịch sử." : "Đã chuyển khiếu nại cho quản trị viên.");
      const section = selected === "resolve" ? "history" : "complaints";
      // Chỉ cập nhật trang chi tiết nếu người dùng vẫn đang xem trang đã gửi.
      if (location.href === sourceUrl) navigate(href(section, { scope: selected === "resolve" ? "history" : "mine", id: complaint._id }), true);
      refreshSummary();
    } catch (error) {
      errorBox.textContent = error.message;
      if ([400, 403, 404, 409].includes(error.status)) refresh.hidden = false;
    } finally {
      submit.disabled = false;
      action.disabled = false;
      input.readOnly = false;
      updateAction();
    }
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const selected = action.value;
    const value = input.value.trim();
    if (value.length < input.minLength) {
      input.setCustomValidity(`Vui lòng nhập ít nhất ${input.minLength} ký tự, không tính khoảng trắng ở đầu và cuối.`);
      input.setAttribute("aria-invalid", "true");
      input.reportValidity();
      return;
    }
    if (selected === "respond") { perform(selected, value); return; }
    const close = openModal({ title: selected === "resolve" ? "Hoàn tất khiếu nại?" : "Chuyển khiếu nại lên admin?", description: `Khiếu nại ${complaint.code}. ${selected === "resolve" ? "Sau khi hoàn tất, bạn sẽ xem lại trong lịch sử." : "Quản trị viên sẽ tiếp nhận và đưa ra quyết định cuối cùng."}`,
      content: h("p", { class: "staff-preserve", text: value }), actions: [button("Quay lại", () => close()), button("Xác nhận", () => { close(); perform(selected, value); }, "primary")] });
  });
  return form;
}

function complaintContent(complaint) {
  const open = ["moi", "dang_xu_ly"].includes(complaint.status);
  const timeline = (complaint.responses || []).map(response => ({ at: response.at, title: `${response.by?.fullName || "Nhân viên"} · ${response.role === "admin" ? "Quản trị viên" : "CSKH"}`, content: response.content }));
  if (complaint.escalatedAt) timeline.push({ at: complaint.escalatedAt, title: "Chuyển quản trị viên", content: complaint.escalateNote });
  timeline.sort((a, b) => new Date(a.at) - new Date(b.at));
  return h("div", { class: "staff-complaint-layout" },
    h("div", { class: "staff-detail-stack" },
      panel("Nội dung khiếu nại", h("div", { class: "staff-detail-title" }, h("strong", { text: complaint.code }), badge(complaint.status)),
        h("p", { class: "staff-preserve staff-reason", text: complaint.reason }), facts([["Gửi lúc", date(complaint.createdAt)], ["Mã đơn hàng", routeLink(complaint.orderCode, href("orders", { id: idOf(complaint.order) }))]])),
      panel("Thông tin liên hệ", facts([["Người liên hệ", complaint.contactName], ["Điện thoại", complaint.contactPhone], ["Email", complaint.contactEmail || "Chưa cung cấp"], ["Tài khoản khách hàng", complaint.customer?._id ? routeLink(complaint.customer.fullName, href("customers", { id: complaint.customer._id })) : "Không còn tồn tại"]])),
      panel("Trao đổi & tiến trình", ...(timeline.length ? timeline.map(item => h("article", { class: "staff-timeline-item" }, h("div", { class: "staff-timeline-head" }, h("strong", { text: item.title }), h("time", { text: date(item.at) })), h("p", { class: "staff-preserve", text: item.content }))) : [note("Chưa có phản hồi. Gửi phản hồi đầu tiên để nhận xử lý khiếu nại.")])),
      complaint.status === "da_xu_ly" ? panel("Kết quả cuối cùng", h("p", { class: "staff-preserve", text: complaint.result }), facts([["Hoàn tất lúc", date(complaint.resolvedAt)]])) : null),
    h("aside", { class: "staff-detail-stack staff-case-side", "aria-label": "Thao tác và đơn hàng liên quan" },
      h("section", { class: "shop-panel staff-panel staff-detail-panel" }, open ? complaintForm(complaint) : h("div", {}, h("h2", { text: complaint.status === "chuyen_admin" ? "Đang chờ quản trị viên" : "Khiếu nại đã hoàn tất" }), note(complaint.status === "chuyen_admin" ? "Khiếu nại đã được chuyển. Bạn có thể theo dõi tiến trình và kết quả tại đây." : "Kết quả và toàn bộ phản hồi được giữ lại để tra cứu."))),
      panel("Đơn hàng liên quan", complaint.orderDetail ? h("div", {}, facts([["Mã đơn", complaint.orderDetail.code], ["Gian hàng", complaint.orderDetail.shop?.name], ["Tổng tiền", formatMoney(complaint.orderDetail.total)], ["Trạng thái", badge(complaint.orderDetail.status, ORDER_STATUS_LABELS)]]), routeLink("Xem chi tiết đơn hàng →", href("orders", { id: complaint.orderDetail._id }))) : note("Không tìm thấy đơn hàng liên quan."))),
  );
}

async function renderDetail(route, version) {
  const resource = route.section === "history" ? "complaints" : route.section;
  const detail = await getStaffDetail(resource, route.id);
  if (version !== generation) return;
  const workspace = $("#workspace");
  workspace.querySelector(".staff-loading")?.remove();
  workspace.append(h("div", { class: "staff-detail-top" }, routeLink("← Quay lại danh sách", currentHref({ id: "" })), h("span", { text: resource === "complaints" ? detail.code : resource === "customers" ? detail.fullName : detail.code })),
    resource === "complaints" ? complaintContent(detail) : resource === "customers" ? customerContent(detail) : orderContent(detail));
}

async function renderPage(focus = false) {
  const version = ++generation;
  const route = readRoute();
  const workspace = $("#workspace");
  document.title = `${sections[route.section][0]} — CSKH TechStore`;
  document.querySelectorAll(".staff-nav__link").forEach(link => { if (link.dataset.section === route.section) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); });
  workspace.replaceChildren(heading(route));
  if (focus) workspace.focus({ preventScroll: true });
  try {
    if (route.id && route.section !== "reviews") {
      workspace.append(h("p", { class: "staff-loading", role: "status", text: "Đang tải chi tiết…" }));
      await renderDetail(route, version);
    } else await renderList(route, version);
  } catch (error) {
    if (version !== generation) return;
    workspace.querySelector(".staff-loading")?.remove();
    const results = workspace.querySelector(".staff-results");
    if (results) { results.replaceChildren(); results.setAttribute("aria-busy", "false"); }
    const alert = h("div", { class: "staff-error", role: "alert" }, h("h2", { text: "Không tải được dữ liệu" }), h("p", { text: error.message }), button("Thử lại", () => renderPage()));
    if (route.id) alert.append(routeLink("Quay lại danh sách", currentHref({ id: "" }), "btn btn--ghost"));
    (results || workspace).append(alert);
  }
}

async function init() {
  if (!getToken()) { location.replace("./auth.html?tab=staff&view=login"); return; }
  try {
    const data = await request("/auth/me", { redirectOn401: false });
    user = data.user;
    if (user.role !== "cskh") {
      $("#staff-app").replaceChildren(h("main", { class: "staff-access", role: "alert" }, h("h1", { text: "Khu vực dành cho nhân viên CSKH" }), h("p", { text: "Tài khoản hiện tại không có quyền truy cập khu vực này." }), h("a", { class: "btn btn--primary", href: "./index.html", text: "Về trang chủ" }), button("Đăng xuất", signOut)));
      return;
    }
    await renderShell();
    renderPage();
    refreshSummary();
  } catch (error) {
    if ([401, 403].includes(error.status)) {
      clearSession();
      setFlash(error.message);
      location.replace("./auth.html?tab=staff&view=login");
    } else $("#staff-app").replaceChildren(h("main", { class: "staff-access", role: "alert" }, h("h1", { text: "Chưa kết nối được máy chủ" }), h("p", { text: error.message }), button("Thử kết nối lại", init)));
  }
}

init();
