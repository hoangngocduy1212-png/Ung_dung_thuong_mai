import { getOrders, getOrder, cancelOrder, requestAfterSales, confirmReceived, payOrderGroup } from "./order-service.js";
import { addToCart } from "./cart-service.js";
import { $, h, formatMoney, formatDate } from "./utils.js";
import { mountShoppingChrome, statusLabels, orderStatusClass } from "./shopping.js";
import { requireCustomerPage } from "./shopping.js";
import { openModal, showToast } from "./ui.js";
import { submitReview } from "./review-service.js";

const main = $("#page-content");
const state = { page: 1, totalPages: 1, status: "", limit: 10, busy: false };
const orderStatuses = ["cho_xac_nhan", "da_xac_nhan", "dang_giao", "da_giao", "hoan_tat", "da_huy", "da_tra_hang"];

function isWithinReturnWindow(order) {
  const delivered = order.deliveredAt && new Date(order.deliveredAt).getTime();
  return delivered && Date.now() - delivered <= 7 * 86400000;
}

function progress(order) {
  const current = orderStatuses.indexOf(order.status);
  const steps = ["cho_xac_nhan", "da_xac_nhan", "dang_giao", "da_giao", "hoan_tat"];
  const active = steps.indexOf(order.status);
  return h("div", { class: "order-progress", "aria-label": `Trạng thái ${statusLabels[order.status] || order.status}` },
    ...steps.map((status, index) => h("span", { class: index <= active && active >= 0 ? "is-done" : "" }, h("span", { class: "sr-only", text: statusLabels[status] }))),
    current < 0 ? h("span", { class: "is-done" }) : null);
}

function reasonModal(title, minLength, onSubmit) {
  const textarea = h("textarea", { rows: "4", maxlength: "500", placeholder: "Nhập lý do", "aria-label": "Lý do" });
  const error = h("p", { class: "form-error", role: "alert", "aria-live": "polite" });
  const content = h("div", {}, textarea, error);
  const button = h("button", { class: "btn btn--primary", type: "button", text: "Gửi" });
  const close = openModal({ title, description: `Vui lòng nhập ít nhất ${minLength} ký tự.`, content, actions: [button] });
  button.addEventListener("click", async () => {
    const reason = textarea.value.trim();
    if (reason.length < minLength) { error.textContent = `Lý do cần ít nhất ${minLength} ký tự.`; return; }
    button.disabled = true;
    try { await onSubmit(reason); close(); }
    catch (e) { error.textContent = e.message; button.disabled = false; }
  });
}

async function doCancel(order) {
  reasonModal("Hủy đơn hàng", 3, async (reason) => {
    await cancelOrder(order._id, reason);
    showToast("Đã hủy đơn hàng");
    await loadOrders();
  });
}

async function doCancelRequest(order) {
  reasonModal("Gửi yêu cầu hủy", 5, async (reason) => {
    await requestAfterSales(order._id, "huy_don", reason);
    showToast("Đã gửi yêu cầu, chờ gian hàng xử lý");
    await loadOrders();
  });
}

async function requestReturn(order, type) {
  const title = type === "hoan_tien" ? "Yêu cầu hoàn tiền" : "Yêu cầu đổi hàng";
  reasonModal(title, 5, async (reason) => {
    await requestAfterSales(order._id, type, reason);
    showToast("Đã gửi yêu cầu, chờ gian hàng xử lý");
    await loadOrders();
  });
}

async function confirmReceivedAction(order) {
  const yes = h("button", { class: "btn btn--primary", type: "button", text: "Đã nhận hàng" });
  const close = openModal({
    title: "Xác nhận đã nhận hàng?",
    description: "Đơn sẽ chuyển sang Hoàn tất và điểm thưởng (nếu có) được cộng theo kết quả từ máy chủ.",
    actions: [yes],
  });
  yes.addEventListener("click", async () => {
    yes.disabled = true;
    try { await confirmReceived(order._id); close(); showToast("Đã xác nhận nhận hàng"); await loadOrders(); }
    catch (e) { close(); showToast(e.message, { error: true }); await loadOrders(); }
  });
}

async function payUnpaidGroup(order, button) {
  button.disabled = true;
  try {
    await payOrderGroup(order.groupCode);
    showToast("Thanh toán giả lập thành công");
    await loadOrders();
  } catch (error) {
    showToast(error.message, { error: true });
    button.disabled = false;
  }
}

async function buyAgain(order, button) {
  button.disabled = true;
  try {
    for (const item of order.items || []) {
      if (!item.product || !item.variant) throw new Error("Một số sản phẩm không còn bán.");
      await addToCart(String(item.product), String(item.variant), item.quantity);
    }
    showToast("Đã thêm các sản phẩm còn bán vào giỏ");
    location.href = "./cart.html";
  } catch (error) { showToast(error.message, { error: true }); button.disabled = false; }
}

async function reviewOrder(order) {
  try {
    const detail = await getOrder(order._id);
    const reviewed = new Set(detail.reviewedProducts || []);
    const reviewable = (detail.items || []).filter((item) => item.product && !reviewed.has(String(item.product)));
    if (!reviewable.length) {
      showToast("Bạn đã đánh giá các sản phẩm trong đơn này");
      return;
    }
    const uniqueProducts = [...new Map(reviewable.map((item) => [String(item.product), item])).values()];
    const product = h("select", { "aria-label": "Sản phẩm cần đánh giá" },
      ...uniqueProducts.map((item) => h("option", { value: String(item.product), text: `${item.productName} · ${item.variantName}` })));
    const rating = h("select", { "aria-label": "Số sao" },
      ...[5, 4, 3, 2, 1].map((value) => h("option", { value: String(value), text: `${value} sao` })));
    const content = h("textarea", { maxlength: "1000", rows: "4", placeholder: "Chia sẻ trải nghiệm của bạn", "aria-label": "Nội dung đánh giá" });
    const error = h("p", { class: "form-error", role: "alert", "aria-live": "polite" });
    const submit = h("button", { class: "btn btn--primary", type: "button", text: "Gửi đánh giá" });
    const close = openModal({ title: "Đánh giá sản phẩm", description: "Đánh giá chỉ áp dụng cho sản phẩm thuộc đơn hàng đã hoàn tất.", content: h("div", { class: "review-form" }, product, rating, content, error), actions: [submit] });
    submit.addEventListener("click", async () => {
      submit.disabled = true;
      try {
        await submitReview({ orderId: String(order._id), productId: product.value, rating: Number(rating.value), content: content.value.trim() });
        close();
        showToast("Đã gửi đánh giá");
      } catch (e) {
        error.textContent = e.message;
        submit.disabled = false;
      }
    });
  } catch (error) { showToast(error.message, { error: true }); }
}

async function showDetails(order) {
  try {
    const detail = await getOrder(order._id);
    const history = h("ol", { class: "order-detail-history" },
      ...(detail.statusHistory || []).map((entry) => h("li", {}, `${statusLabels[entry.status] || entry.status} · ${formatDate(entry.at)}${entry.note ? ` · ${entry.note}` : ""}`)));
    const items = h("div", {}, ...(detail.items || []).map((item) =>
      h("div", { class: "order-detail-line" }, h("span", { text: `${item.productName} · ${item.variantName} × ${item.quantity}` }), h("strong", { text: formatMoney(item.price * item.quantity) }))));
    const totals = h("div", {},
      h("div", { class: "order-detail-line" }, h("span", { text: "Tạm tính" }), h("strong", { text: formatMoney(detail.subtotal) })),
      h("div", { class: "order-detail-line" }, h("span", { text: "Giảm giá" }), h("strong", { text: `−${formatMoney(detail.discount)}` })),
      h("div", { class: "order-detail-line" }, h("span", { text: "Phí vận chuyển" }), h("strong", { text: formatMoney(detail.shippingFee) })),
      h("div", { class: "order-detail-line" }, h("strong", { text: "Tổng thanh toán" }), h("strong", { text: formatMoney(detail.total) })));
    const afterSales = h("div", {}, ...(detail.afterSales || []).map((request) =>
      h("p", { text: `${{ huy_don: "Yêu cầu hủy", hoan_tien: "Yêu cầu hoàn tiền", doi_hang: "Yêu cầu đổi hàng" }[request.type] || request.type} · ${{ cho_xu_ly: "Chờ xử lý", da_chap_nhan: "Đã chấp nhận", bi_tu_choi: "Bị từ chối" }[request.status] || request.status}${request.reason ? ` · ${request.reason}` : ""}${request.sellerNote ? ` · Phản hồi: ${request.sellerNote}` : ""}` })));
    const body = h("div", { class: "order-detail-grid" },
      h("section", { class: "shop-panel" }, h("h3", { text: "Trạng thái đơn" }), progress(detail), history),
      h("section", { class: "shop-panel" },
        h("h3", { text: "Địa chỉ nhận hàng" }),
        h("p", { text: `${detail.shippingAddress?.receiver || ""} · ${detail.shippingAddress?.phone || ""}` }),
        h("p", { text: [detail.shippingAddress?.detail, detail.shippingAddress?.ward, detail.shippingAddress?.district, detail.shippingAddress?.province].filter(Boolean).join(", ") }),
        h("p", { text: `Thanh toán: ${detail.payment?.method === "cod" ? "COD" : "Online giả lập"} · ${detail.payment?.status === "paid" ? "Đã thanh toán" : detail.payment?.status === "refunded" ? "Đã hoàn" : "Chưa thanh toán"}` })),
      h("section", { class: "shop-panel" }, h("h3", { text: "Sản phẩm" }), items),
      h("section", { class: "shop-panel" }, h("h3", { text: `Tổng kết${detail.voucherCode ? ` · Voucher ${detail.voucherCode}` : ""}` }), totals,
        h("p", { text: `Điểm đã nhận: ${detail.pointsEarned || 0}` })),
      ...(detail.afterSales?.length ? [h("section", { class: "shop-panel" }, h("h3", { text: "Yêu cầu sau bán hàng" }), afterSales)] : []));
    openModal({ title: `Đơn ${detail.code}`, description: `${detail.shop?.name || "Gian hàng"} · ${statusLabels[detail.status] || detail.status}`, content: body });
  } catch (error) { showToast(error.message, { error: true }); }
}

function orderCard(order) {
  const status = h("span", { class: orderStatusClass(order.status), text: statusLabels[order.status] || order.status });
  const actions = h("div", { class: "order-card__actions" });
  const addAction = (label, fn, cls = "btn btn--ghost") => {
    const button = h("button", { class: cls, type: "button", text: label });
    button.addEventListener("click", fn);
    actions.append(button);
  };
  addAction("Chi tiết", () => showDetails(order));
  if (order.status === "cho_xac_nhan") addAction("Hủy đơn", () => doCancel(order));
  if (order.status === "da_xac_nhan") addAction("Gửi yêu cầu hủy", () => doCancelRequest(order));
  if (order.status === "dang_giao") actions.append(h("small", { text: "Đơn đang giao nên không thể hủy." }));
  if (order.status === "da_giao") {
    addAction("Đã nhận hàng", () => confirmReceivedAction(order), "btn btn--primary");
    if (isWithinReturnWindow(order)) {
      addAction("Yêu cầu hoàn tiền", () => requestReturn(order, "hoan_tien"));
      addAction("Yêu cầu đổi hàng", () => requestReturn(order, "doi_hang"));
    }
    if (order.deliveredAt) actions.append(h("small", { text: "Đơn sẽ tự hoàn tất sau 3 ngày kể từ ngày giao." }));
  }
  if (order.status === "hoan_tat") {
    if (isWithinReturnWindow(order)) { addAction("Yêu cầu hoàn tiền", () => requestReturn(order, "hoan_tien")); addAction("Yêu cầu đổi hàng", () => requestReturn(order, "doi_hang")); }
    addAction("Đánh giá sản phẩm", () => reviewOrder(order));
  }
  if (order.payment?.method === "online" && order.payment?.status !== "paid" && order.status !== "da_huy") {
    addAction("Thanh toán giả lập", (event) => payUnpaidGroup(order, event.currentTarget), "btn btn--primary");
  }
  addAction("Mua lại", (event) => buyAgain(order, event.currentTarget));
  return h("article", { class: "order-card" },
    h("div", { class: "order-card__head" }, h("strong", { text: `${order.shop?.name || "Gian hàng"} · ${order.code}` }), status),
    progress(order),
    h("p", { class: "order-card__products", text: (order.items || []).map((item) => `${item.productName} (${item.variantName}) × ${item.quantity}`).join(" · ") }),
    h("div", { class: "order-card__totals" },
      h("span", { text: `${formatDate(order.createdAt)} · ${order.payment?.method === "cod" ? "COD" : "Online giả lập"} · ${order.payment?.status === "paid" ? "Đã thanh toán" : order.payment?.status === "refunded" ? "Đã hoàn" : "Chưa thanh toán"}` }),
      h("strong", { text: formatMoney(order.total) })),
    actions);
}

async function loadOrders() {
  if (state.busy) return;
  state.busy = true;
  const list = $("#orders-list");
  list.setAttribute("aria-busy", "true");
  list.replaceChildren(h("p", { class: "loading-line", text: "Đang tải đơn hàng…" }));
  try {
    const result = await getOrders({ page: state.page, limit: state.limit, status: state.status });
    state.totalPages = result.totalPages || 1;
    const groups = new Map();
    result.items.forEach((order) => {
      if (!groups.has(order.groupCode)) groups.set(order.groupCode, []);
      groups.get(order.groupCode).push(order);
    });
    list.replaceChildren();
    if (!result.items.length) list.append(h("div", { class: "empty-state" }, h("h2", { text: "Chưa có đơn hàng" }), h("a", { class: "btn btn--primary", href: "./products.html", text: "Khám phá sản phẩm" })));
    for (const [groupCode, orders] of groups) {
      list.append(h("section", { class: "order-group" },
        h("div", { class: "order-group__head" }, h("h2", { text: `Đặt ngày ${formatDate(orders[0].createdAt)} · Mã nhóm ${groupCode}` }), h("span", { text: `${orders.length} đơn` })),
        ...orders.map(orderCard)));
    }
    const pagination = $("#orders-pagination");
    pagination.hidden = state.totalPages <= 1;
    pagination.replaceChildren();
    if (state.totalPages > 1) {
      const prev = h("button", { type: "button", disabled: state.page <= 1, text: "‹", "aria-label": "Trang trước", onclick: () => { state.page--; loadOrders(); } });
      const label = h("span", { text: `Trang ${state.page} / ${state.totalPages}` });
      const next = h("button", { type: "button", disabled: state.page >= state.totalPages, text: "›", "aria-label": "Trang sau", onclick: () => { state.page++; loadOrders(); } });
      pagination.append(prev, label, next);
    }
  } catch (error) {
    list.replaceChildren(h("div", { class: "error-state", role: "alert" }, h("p", { text: error.message }), h("button", { class: "btn btn--primary", type: "button", onclick: () => loadOrders(), text: "Thử lại" })));
  } finally { state.busy = false; list.setAttribute("aria-busy", "false"); }
}

function renderShell() {
  const statusFilter = h("select", { "aria-label": "Lọc theo trạng thái" },
    h("option", { value: "", text: "Tất cả trạng thái" }),
    ...Object.entries(statusLabels).map(([value, label]) => h("option", { value, text: label })));
  statusFilter.value = state.status;
  statusFilter.addEventListener("change", () => { state.status = statusFilter.value; state.page = 1; loadOrders(); });
  const refresh = h("button", { class: "btn btn--ghost", type: "button", text: "Làm mới", onclick: () => loadOrders() });
  main.replaceChildren(
    h("nav", { class: "breadcrumbs" }, h("a", { href: "./index.html", text: "Trang chủ" }), " / Đơn hàng"),
    h("div", { class: "page-heading" }, h("div", {}, h("span", { class: "section-kicker", text: "TÀI KHOẢN KHÁCH HÀNG" }), h("h1", { text: "Đơn hàng của tôi" }))),
    h("div", { class: "orders-toolbar" }, statusFilter, refresh),
    h("div", { id: "orders-list", "aria-live": "polite" }),
    h("nav", { class: "pagination", id: "orders-pagination", "aria-label": "Phân trang đơn hàng", hidden: true }));
}

async function init(user) {
  await mountShoppingChrome(user);
  renderShell();
  await loadOrders();
}

document.addEventListener("shopping:authorized", (event) => init(event.detail?.user));
document.addEventListener("visibilitychange", () => { if (!document.hidden && !main.hidden) loadOrders(); });
requireCustomerPage();
