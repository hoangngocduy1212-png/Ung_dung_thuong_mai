import { getOrders, getOrder, cancelOrder, confirmReceived, payOrderGroup } from "./order-service.js";
import { requestAfterSales } from "./aftersales-service.js";
import { getAllMyReviews } from "./review-service.js";
import { openReviewForm } from "./review-ui.js";
import { getPoints } from "./points-service.js";
import { AFTER_SALES_STATUS_LABELS, AFTER_SALES_TYPE_LABELS } from "./status-labels.js";
import { addToCart } from "./cart-service.js";
import { $, h, formatMoney, formatDate } from "./utils.js";
import { mountShoppingChrome, statusLabels, orderStatusClass } from "./shopping.js";
import { requireCustomerPage } from "./shopping.js";
import { openModal, showToast } from "./ui.js";
import { submitReview } from "./review-service.js";

const main = $("#page-content");
const state = { page: 1, totalPages: 1, status: "", limit: 10, busy: false };
const orderStatuses = ["cho_xac_nhan", "da_xac_nhan", "dang_giao", "da_giao", "hoan_tat", "da_huy", "da_tra_hang"];

function returnWindow(order) {
  if (!order.deliveredAt) return { eligible: false, reason: "Chưa có ngày giao hàng để tính thời hạn yêu cầu." };
  const deliveredAt = new Date(order.deliveredAt).getTime();
  if (Number.isNaN(deliveredAt)) return { eligible: false, reason: "Không có ngày giao hàng hợp lệ để tính thời hạn yêu cầu." };
  const remaining = 7 * 86400000 - (Date.now() - deliveredAt);
  if (remaining < 0) return { eligible: false, reason: "Đã quá 7 ngày kể từ ngày giao hàng." };
  return { eligible: true, days: Math.ceil(remaining / 86400000) };
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

function requestReturn(order, initialType = "hoan_tien") {
  const type = h("select", { name: "type", "aria-label": "Loại yêu cầu" },
    h("option", { value: "hoan_tien", text: "Hoàn tiền (trả hàng)" }),
    h("option", { value: "doi_hang", text: "Đổi hàng" }));
  type.value = initialType;
  const reason = h("input", { type: "text", maxlength: "120", required: true, placeholder: "Ví dụ: sản phẩm bị lỗi", "aria-label": "Lý do" });
  const description = h("textarea", { rows: "4", maxlength: "450", placeholder: "Mô tả thêm tình trạng sản phẩm", "aria-label": "Mô tả thêm" });
  const error = h("p", { class: "form-error", role: "alert", "aria-live": "assertive" });
  const content = h("div", { class: "review-form" },
    h("label", { class: "account-field" }, "Loại yêu cầu", type),
    h("label", { class: "account-field" }, "Lý do (bắt buộc)", reason),
    h("label", { class: "account-field" }, "Mô tả thêm", description),
    h("p", { class: "voucher-hint", text: "Yêu cầu áp dụng cho cả đơn; hệ thống hiện chưa hỗ trợ chọn từng sản phẩm hoặc tải ảnh minh chứng." }), error);
  const submit = h("button", { class: "btn btn--primary", type: "button", text: "Gửi yêu cầu" });
  const close = openModal({ title: "Yêu cầu sau bán hàng", description: `Đơn ${order.code}. Chỉ gửi một yêu cầu đang chờ cho mỗi đơn.`, content, actions: [submit] });
  submit.addEventListener("click", async () => {
    const reasonText = reason.value.trim();
    const descriptionText = description.value.trim();
    if (reasonText.length < 5) { error.textContent = "Lý do cần tối thiểu 5 ký tự."; reason.focus(); return; }
    const combinedReason = descriptionText ? `Lý do: ${reasonText}\nMô tả: ${descriptionText}` : reasonText;
    if (combinedReason.length > 500) { error.textContent = "Lý do và mô tả cộng lại không được vượt quá 500 ký tự."; return; }
    submit.disabled = true;
    try {
      await requestAfterSales(order._id, type.value, combinedReason);
      close(); showToast("Đã gửi yêu cầu, chờ gian hàng xử lý"); await loadOrders();
    } catch (requestError) { error.textContent = requestError.message; submit.disabled = false; }
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

async function showReview(order, item) {
  try {
    const reviews = await getAllMyReviews();
    const found = reviews.find((review) => String(review.order?._id) === String(order._id) && String(review.product?._id) === String(item.product));
    if (!found) { showToast("Đánh giá đã bị gỡ hoặc không còn khả dụng."); return; }
    const rating = Number(found.rating) || 0;
    const content = h("div", { class: "review-form" },
      h("p", { class: "product-rating", text: `${"★".repeat(rating)}${"☆".repeat(5 - rating)} · ${rating}/5` }),
      h("p", { text: found.content || "Không để lại nội dung." }),
      found.reply?.content ? h("div", { class: "review-reply" }, h("strong", { text: "Phản hồi người bán" }), h("p", { text: found.reply.content })) : null);
    openModal({ title: `Đánh giá ${item.productName || "sản phẩm"}`, description: `Đơn ${order.code}`, content });
  } catch (error) { showToast(error.message, { error: true }); }
}

async function reviewOrder(order, item) {
  try {
    const detail = await getOrder(order._id);
    if (detail.status !== "hoan_tat") { showToast("Chỉ đánh giá được khi đơn đã hoàn tất.", { error: true }); return; }
    if ((detail.reviewedProducts || []).includes(String(item.product))) return showReview(detail, item);
    openReviewForm(detail, item, loadOrders);
  } catch (error) { showToast(error.message, { error: true }); }
}

async function showDetails(order) {
  try {
    const detail = await getOrder(order._id);
    const reviews = (await getAllMyReviews()).filter((review) => String(review.order?._id) === String(detail._id));
    const history = h("ol", { class: "order-detail-history" },
      ...(detail.statusHistory || []).map((entry) => h("li", {}, `${statusLabels[entry.status] || entry.status} · ${formatDate(entry.at)}${entry.note ? ` · ${entry.note}` : ""}`)));
    const items = h("div", {}, ...(detail.items || []).map((item) =>
      h("div", { class: "order-detail-line" }, h("span", { text: `${item.productName} · ${item.variantName} × ${item.quantity}` }), h("strong", { text: formatMoney(item.price * item.quantity) }))));
    const totals = h("div", {},
      h("div", { class: "order-detail-line" }, h("span", { text: "Tạm tính" }), h("strong", { text: formatMoney(detail.subtotal) })),
      h("div", { class: "order-detail-line" }, h("span", { text: "Giảm giá" }), h("strong", { text: `−${formatMoney(detail.discount)}` })),
      h("div", { class: "order-detail-line" }, h("span", { text: "Phí vận chuyển" }), h("strong", { text: formatMoney(detail.shippingFee) })),
      h("div", { class: "order-detail-line" }, h("strong", { text: "Tổng thanh toán" }), h("strong", { text: formatMoney(detail.total) })));
    const afterSales = h("div", {}, ...(detail.afterSales || []).map((request) => h("article", { class: "account-record" },
      h("div", { class: "account-record__head" }, h("strong", { text: AFTER_SALES_TYPE_LABELS[request.type] || request.type }), h("span", { class: `account-badge account-badge--${request.status}`, text: AFTER_SALES_STATUS_LABELS[request.status] || request.status })),
      h("p", { text: request.reason || "" }), request.sellerNote ? h("p", { class: request.status === "bi_tu_choi" ? "account-seller-note" : "", text: `Ghi chú người bán: ${request.sellerNote}` }) : null)));
    const refundAccepted = (detail.afterSales || []).some((request) => request.type === "hoan_tien" && request.status === "da_chap_nhan");
    let refundOutcome = null;
    if (refundAccepted) {
      try {
        const points = await getPoints();
        const revoked = (points.history || []).filter((entry) => String(entry.order) === String(detail._id) && entry.type === "revoke").reduce((sum, entry) => sum + Math.abs(Number(entry.delta || 0)), 0);
        refundOutcome = h("section", { class: "account-compliance-note" },
          h("strong", { text: `Đơn: ${statusLabels[detail.status] || detail.status} · Thanh toán: ${detail.payment?.status === "refunded" ? "Đã hoàn" : "Đang cập nhật"}` }),
          h("p", { text: detail.status === "da_tra_hang" && detail.payment?.status === "refunded" ? `Điểm đã thu hồi theo lịch sử máy chủ: ${revoked}.` : "Điểm và trạng thái thanh toán lấy theo phản hồi máy chủ." }));
      } catch (error) { refundOutcome = h("p", { class: "form-error", text: error.message }); }
    }
    const reviewHistory = h("div", {}, ...(reviews.map((review) => h("article", { class: "account-record" },
      h("strong", { text: `${review.product?.name || "Sản phẩm"} · ${review.rating}/5` }),
      h("p", { text: review.content || "Không để lại nội dung." }),
      review.reply?.content ? h("p", { class: "account-review-reply", text: `Phản hồi người bán: ${review.reply.content}` }) : null))));
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
      ...(detail.afterSales?.length ? [h("section", { class: "shop-panel" }, h("h3", { text: "Yêu cầu sau bán hàng" }), afterSales)] : []),
      ...(refundOutcome ? [h("section", { class: "shop-panel" }, h("h3", { text: "Kết quả hoàn tiền" }), refundOutcome)] : []),
      ...(reviews.length ? [h("section", { class: "shop-panel" }, h("h3", { text: "Đánh giá của đơn" }), reviewHistory)] : []));
    openModal({ title: `Đơn ${detail.code}`, description: `${detail.shop?.name || "Gian hàng"} · ${statusLabels[detail.status] || detail.status}`, content: body });
  } catch (error) { showToast(error.message, { error: true }); }
}

function orderCard(order) {
  const status = h("span", { class: orderStatusClass(order.status), text: statusLabels[order.status] || order.status });
  const actions = h("div", { class: "order-card__actions" });
  const pendingRequest = (order.afterSales || []).find((request) => request.status === "cho_xu_ly");
  const returnStates = ["da_giao", "hoan_tat"];
  const returnEligibility = returnWindow(order);
  const addAction = (label, fn, cls = "btn btn--ghost") => {
    const button = h("button", { class: cls, type: "button", text: label });
    button.addEventListener("click", fn);
    actions.append(button);
  };
  addAction("Chi tiết", () => showDetails(order));
  if (order.status === "cho_xac_nhan") addAction("Hủy đơn", () => doCancel(order));
  if (order.status === "da_xac_nhan" && !pendingRequest) addAction("Gửi yêu cầu hủy", () => doCancelRequest(order));
  if (order.status === "dang_giao") actions.append(h("small", { text: "Đơn đang giao nên không thể hủy." }));
  if (order.status === "da_giao") {
    if (!pendingRequest) addAction("Đã nhận hàng", () => confirmReceivedAction(order), "btn btn--primary");
    if (pendingRequest) {
      addAction("Xem yêu cầu", () => showDetails(order));
      actions.append(h("small", { text: "Đơn đang có yêu cầu chờ xử lý." }));
    } else if (returnEligibility.eligible) {
      addAction("Yêu cầu hoàn tiền", () => requestReturn(order, "hoan_tien"));
      addAction("Yêu cầu đổi hàng", () => requestReturn(order, "doi_hang"));
      actions.append(h("small", { text: `Còn ${returnEligibility.days} ngày để yêu cầu.` }));
    } else {
      actions.append(h("small", { text: returnEligibility.reason }));
    }
    if (order.deliveredAt) actions.append(h("small", { text: "Đơn sẽ tự hoàn tất sau 3 ngày kể từ ngày giao." }));
  }
  if (order.status === "hoan_tat") {
    if (pendingRequest) {
      addAction("Xem yêu cầu", () => showDetails(order));
      actions.append(h("small", { text: "Đơn đang có yêu cầu chờ xử lý." }));
    } else if (returnEligibility.eligible) {
      addAction("Yêu cầu hoàn tiền", () => requestReturn(order, "hoan_tien"));
      addAction("Yêu cầu đổi hàng", () => requestReturn(order, "doi_hang"));
      actions.append(h("small", { text: `Còn ${returnEligibility.days} ngày để yêu cầu.` }));
    } else actions.append(h("small", { text: returnEligibility.reason }));
    const uniqueProducts = [...new Map((order.items || []).filter((item) => item.product).map((item) => [String(item.product), item])).values()];
    uniqueProducts.forEach((item) => {
      const reviewed = (order.reviewedProducts || []).includes(String(item.product));
      addAction(reviewed ? "Xem đánh giá" : "Đánh giá sản phẩm", () => reviewOrder(order, item));
    });
  } else if (!returnStates.includes(order.status)) {
    actions.append(h("small", { text: "Chỉ gửi yêu cầu hoàn tiền/đổi hàng sau khi đơn đã giao." }));
    if (pendingRequest) addAction("Xem yêu cầu", () => showDetails(order));
    if (order.status !== "hoan_tat") actions.append(h("small", { text: "Chỉ đánh giá sản phẩm khi đơn hoàn tất." }));
  }
  addAction("Khiếu nại", () => { location.href = `./account.html?section=complaints&orderCode=${encodeURIComponent(order.code)}`; });
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
  const orderId = new URLSearchParams(location.search).get("order");
  if (orderId) await showDetails({ _id: orderId });
}

document.addEventListener("shopping:authorized", (event) => init(event.detail?.user));
document.addEventListener("visibilitychange", () => { if (!document.hidden && !main.hidden) loadOrders(); });
requireCustomerPage();
