import { $, h, formatDate, formatMoney, makeImage } from "./utils.js";
import { updateStoredUser } from "./session.js";
import { mountShoppingChrome, requireCustomerPage } from "./shopping.js";
import { showToast, openModal, showUndoToast } from "./ui.js";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "./address-service.js";
import { getProfile, updateProfile, changePassword } from "./profile-service.js";
import { getWishlist, addWishlist, removeWishlist } from "./wishlist-service.js";
import { getMyVouchers, getAvailableVouchers, redeemVoucher, claimVoucher } from "./voucher-service.js";
import { getPoints } from "./points-service.js";
import { getMyComplaints, getMyComplaint, submitComplaint } from "./complaint-service.js";
import { getMyAfterSales } from "./aftersales-service.js";
import { getOrders, getOrder } from "./order-service.js";
import { getAllMyReviews } from "./review-service.js";
import { openReviewForm } from "./review-ui.js";
import { getProduct, getShops } from "./product-service.js";
import { addToCart } from "./cart-service.js";
import { productCard } from "./product-card.js";
import { AFTER_SALES_STATUS_LABELS, AFTER_SALES_TYPE_LABELS, COMPLAINT_STATUS_LABELS, POINT_TYPE_LABELS, VOUCHER_STATUS_LABELS } from "./status-labels.js";
import { notifyCartChanged } from "./shopping.js";

const main = $("#page-content");
const sections = [
  ["profile", "Hồ sơ cá nhân"], ["addresses", "Sổ địa chỉ"], ["security", "Đổi mật khẩu"],
  ["vouchers", "Voucher của tôi"], ["points", "Điểm thưởng"], ["wishlist", "Yêu thích"],
  ["reviews", "Đánh giá của tôi"], ["after-sales", "Hoàn tiền / Đổi hàng"], ["complaints", "Khiếu nại"],
];
const PHONE_RE = /^(0|\+84)\d{9,10}$/;
const state = { user: null, section: "profile", voucherStatus: "unused", reviewTab: "pending", addresses: [] };

function addressText(address) {
  return [address.detail, address.ward, address.district, address.province].filter(Boolean).join(", ");
}

function messageNode(error = false) {
  return h("p", { class: `account-message${error ? " is-error" : ""}`, role: error ? "alert" : "status", "aria-live": "polite" });
}

function field(label, name, { type = "text", value = "", required = false, maxLength, readOnly = false, rows } = {}) {
  const control = rows
    ? h("textarea", { name, rows: String(rows), maxlength: maxLength ? String(maxLength) : null, required, text: value })
    : h("input", { name, type, value, required, maxlength: maxLength ? String(maxLength) : null, readonly: readOnly, autocomplete: name === "phone" || name === "contactPhone" ? "tel" : name === "contactEmail" ? "email" : "off" });
  const error = h("small", { class: "account-field__error", dataset: { error: name }, role: "alert" });
  return h("label", { class: "account-field" }, label, control, error);
}

function sectionPanel(title, description, ...children) {
  return h("section", { class: "account-panel" }, h("h2", { text: title }), description ? h("p", { text: description }) : null, ...children);
}

function setFieldError(form, name, text) {
  const input = form.elements[name];
  const error = form.querySelector(`[data-error="${name}"]`);
  if (error) error.textContent = text || "";
  input?.setAttribute("aria-invalid", text ? "true" : "false");
}

function clearFieldErrors(form) {
  form.querySelectorAll("[data-error]").forEach((el) => { el.textContent = ""; });
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.setAttribute("aria-invalid", "false"));
}

function showLoadError(container, error, retry) {
  container.replaceChildren(h("div", { class: "error-state", role: "alert" },
    h("p", { text: error.message || "Không tải được dữ liệu." }),
    h("button", { class: "btn btn--primary", type: "button", text: "Thử lại", onclick: retry })));
}

function profileView() {
  const form = h("form", { class: "account-form" },
    field("Họ và tên", "fullName", { value: state.user?.fullName || "", required: true, maxLength: 80 }),
    field("Email", "email", { value: state.user?.email || "", readOnly: true }),
    field("Số điện thoại", "phone", { value: state.user?.phone || "", type: "tel", required: true }),
    messageNode(),
    h("div", { class: "account-actions" }, h("button", { class: "btn btn--primary", type: "submit", text: "Lưu hồ sơ" })));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const fullName = form.elements.fullName.value.trim();
    const phone = form.elements.phone.value.trim();
    if (fullName.length < 2 || fullName.length > 80) setFieldError(form, "fullName", "Họ và tên phải từ 2 đến 80 ký tự.");
    if (!PHONE_RE.test(phone)) setFieldError(form, "phone", "Số điện thoại không hợp lệ (0 hoặc +84, theo sau 9 đến 10 chữ số).");
    if (form.querySelector('[aria-invalid="true"]')) return;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      state.user = await updateProfile({ fullName, phone });
      updateStoredUser(state.user);
      form.querySelector(".account-message").textContent = "Đã cập nhật hồ sơ.";
    } catch (error) { form.querySelector(".account-message").textContent = error.message; form.querySelector(".account-message").classList.add("is-error"); }
    finally { submit.disabled = false; }
  });
  return sectionPanel("Thông tin cá nhân", "Email đăng nhập hiện không được phép thay đổi. Họ tên và số điện thoại được đồng bộ với thông tin giao hàng mới.", form);
}

function addressPayload(form, isDefault) {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    receiver: String(data.receiver || "").trim(), phone: String(data.phone || "").trim(), detail: String(data.detail || "").trim(),
    ward: String(data.ward || "").trim(), district: String(data.district || "").trim(), province: String(data.province || "").trim(), isDefault,
  };
}

function duplicateAddress(candidate, exceptId) {
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
  return state.addresses.find((address) => String(address._id) !== String(exceptId || "") &&
    ["receiver", "phone", "detail", "ward", "district", "province"].every((key) => normalize(address[key]) === normalize(candidate[key])));
}

function validateAddress(form) {
  clearFieldErrors(form);
  const values = addressPayload(form, false);
  if (values.receiver.length < 2) setFieldError(form, "receiver", "Tên người nhận phải có ít nhất 2 ký tự.");
  if (!PHONE_RE.test(values.phone)) setFieldError(form, "phone", "Số điện thoại không hợp lệ.");
  if (values.detail.length < 3) setFieldError(form, "detail", "Địa chỉ chi tiết phải có ít nhất 3 ký tự.");
  return !form.querySelector('[aria-invalid="true"]');
}

function addressEditor(address = null, onSaved) {
  const form = h("form", { class: "account-form" },
    h("div", { class: "account-form-grid" },
      field("Họ tên người nhận", "receiver", { value: address?.receiver || state.user?.fullName || "", required: true }),
      field("Số điện thoại", "phone", { value: address?.phone || state.user?.phone || "", type: "tel", required: true }),
      field("Địa chỉ chi tiết", "detail", { value: address?.detail || "", required: true }),
      field("Phường / xã", "ward", { value: address?.ward || "" }),
      field("Quận / huyện", "district", { value: address?.district || "" }),
      field("Tỉnh / thành phố", "province", { value: address?.province || "" })),
    h("label", { class: "account-check" }, h("input", { type: "checkbox", name: "isDefault", checked: !!address?.isDefault || !state.addresses.length }), "Đặt làm địa chỉ mặc định"),
    messageNode(),
    h("div", { class: "account-actions" }, h("button", { class: "btn btn--primary", type: "submit", text: address ? "Lưu thay đổi" : "Thêm địa chỉ" })));
  form.addEventListener("input", (event) => { if (event.target.name) setFieldError(form, event.target.name, ""); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateAddress(form)) return;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    const data = addressPayload(form, form.elements.isDefault.checked);
    const duplicate = duplicateAddress(data, address?._id);
    try {
      if (duplicate) {
        if (data.isDefault && !duplicate.isDefault) await updateAddress(duplicate._id, { isDefault: true });
        await reloadAddresses();
        form.querySelector(".account-message").textContent = "Địa chỉ này đã có trong sổ; địa chỉ hiện có được giữ lại.";
        onSaved?.(duplicate);
      } else {
        state.addresses = address
          ? await updateAddress(address._id, data)
          : await createAddress(data);
        form.querySelector(".account-message").textContent = address ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.";
        onSaved?.(state.addresses.find((item) => item._id === address?._id) || state.addresses.at(-1));
      }
      renderSection();
    } catch (error) {
      form.querySelector(".account-message").textContent = error.message;
      form.querySelector(".account-message").classList.add("is-error");
      const match = error.message.match(/(?:receiver|phone|detail|ward|district|province):\s*([^;]+)/i);
      if (match) setFieldError(form, match[0].split(":")[0], match[1]);
    } finally { submit.disabled = false; }
  });
  return form;
}

async function reloadAddresses() {
  state.addresses = await getAddresses();
  return state.addresses;
}

function addressesView() {
  const list = h("div", { class: "account-address-list" });
  const renderList = () => {
    list.replaceChildren();
    if (!state.addresses.length) list.append(h("p", { class: "account-list-empty", text: "Sổ địa chỉ chưa có địa chỉ nào." }));
    state.addresses.forEach((address) => {
      const edit = h("button", { class: "btn btn--ghost", type: "button", text: "Sửa" });
      edit.addEventListener("click", () => { const nextEditor = addressEditor(address); editor.replaceWith(nextEditor); editor = nextEditor; });
      const remove = h("button", { class: "btn btn--ghost", type: "button", text: "Xóa" });
      remove.addEventListener("click", () => confirmDeleteAddress(address));
      list.append(h("article", { class: "account-address" },
        h("div", { class: "account-address__head" }, h("strong", { text: `${address.receiver} · ${address.phone}` }), address.isDefault ? h("span", { class: "account-badge", text: "Mặc định" }) : null),
        h("p", { text: addressText(address) }),
        h("div", { class: "account-actions" }, edit, remove,
          !address.isDefault ? h("button", { class: "text-button", type: "button", text: "Đặt làm mặc định", onclick: async () => { try { state.addresses = await updateAddress(address._id, { isDefault: true }); renderSection(); } catch (error) { showToast(error.message, { error: true }); } } }) : null)));
    });
  };
  const add = h("button", { class: "btn btn--primary", type: "button", text: "Thêm địa chỉ" });
  let editor = addressEditor();
  editor.hidden = state.addresses.length > 0;
  add.addEventListener("click", () => {
    if (editor.hidden) editor.hidden = false;
    else if (!editor.isConnected) { editor = addressEditor(); list.after(editor); }
    editor.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  renderList();
  return sectionPanel("Sổ địa chỉ", "Địa chỉ mặc định sẽ được tự chọn ở bước thanh toán. Bạn có thể lưu nhiều địa chỉ, nhưng mỗi lần chỉ có tối đa một địa chỉ mặc định.", add, list, editor);
}

function passwordScore(password) {
  if (!password) return 0;
  let score = Number(password.length >= 6) + Number(password.length >= 10);
  score += Number(/[a-z]/.test(password) && /[A-Z]/.test(password));
  score += Number(/\d/.test(password) && /[^A-Za-z0-9]/.test(password));
  if (score < 1) score = 1;
  return Math.min(score, 4);
}

function securityView() {
  const meter = h("div", { class: "account-password-meter", dataset: { level: "0" } },
    h("span", { class: "account-password-meter__bars" }, ...[1, 2, 3, 4].map(() => h("i", {}))), h("small", { text: "Độ mạnh mật khẩu: chưa nhập" }));
  const form = h("form", { class: "account-form" },
    field("Mật khẩu hiện tại", "oldPassword", { type: "password", required: true }),
    field("Mật khẩu mới", "newPassword", { type: "password", required: true, maxLength: 100 }), meter,
    field("Nhập lại mật khẩu mới", "confirmPassword", { type: "password", required: true }),
    messageNode(), h("div", { class: "account-actions" }, h("button", { class: "btn btn--primary", type: "submit", text: "Đổi mật khẩu" })));
  form.elements.newPassword.addEventListener("input", () => {
    const score = passwordScore(form.elements.newPassword.value);
    meter.dataset.level = String(score);
    meter.querySelector("small").textContent = `Độ mạnh mật khẩu: ${["chưa nhập", "yếu", "trung bình", "khá", "mạnh"][score]}`;
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); clearFieldErrors(form);
    const oldPassword = form.elements.oldPassword.value;
    const newPassword = form.elements.newPassword.value;
    const confirmPassword = form.elements.confirmPassword.value;
    if (newPassword.length < 6 || newPassword.length > 100) setFieldError(form, "newPassword", "Mật khẩu mới phải từ 6 đến 100 ký tự.");
    if (confirmPassword !== newPassword) setFieldError(form, "confirmPassword", "Mật khẩu nhập lại không khớp.");
    if (form.querySelector('[aria-invalid="true"]')) return;
    const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try {
      const result = await changePassword(oldPassword, newPassword);
      form.reset(); meter.dataset.level = "0"; meter.querySelector("small").textContent = "Độ mạnh mật khẩu: chưa nhập";
      form.querySelector(".account-message").textContent = result.message || "Đã đổi mật khẩu.";
    } catch (error) {
      form.querySelector(".account-message").textContent = error.message;
      form.querySelector(".account-message").classList.add("is-error");
    } finally { button.disabled = false; }
  });
  return sectionPanel("Đổi mật khẩu", "Mật khẩu phải có ít nhất 6 ký tự. Phiên đăng nhập hiện tại vẫn hợp lệ sau khi đổi theo hành vi của backend.", form);
}

function voucherView() {
  const list = h("div", { class: "account-record-list", "aria-live": "polite" });
  const tabEntries = [["unused", "Chưa dùng"], ["used", "Đã dùng"], ["expired", "Hết hạn"], ["available", "Kho voucher"]];
  const tabs = h("div", { class: "account-tabs", role: "tablist", "aria-label": "Voucher của tôi" });
  tabEntries.forEach(([value, label]) => {
    const button = h("button", { class: "btn btn--ghost", type: "button", role: "tab", id: `voucher-tab-${value}`, "aria-controls": "account-voucher-list", "aria-selected": String(state.voucherStatus === value), tabindex: state.voucherStatus === value ? "0" : "-1", text: label });
    button.addEventListener("click", () => { state.voucherStatus = value; loadVouchersView(list, tabs); });
    tabs.append(button);
  });
  tabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const active = buttons.indexOf(document.activeElement);
    const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[index].focus(); buttons[index].click();
  });

  function voucherNode(voucher, { status, shopName = "", alreadyClaimed = false } = {}) {
    const expired = status === "expired" || new Date(voucher.endDate) <= new Date();
    const pointsVoucher = voucher.scope === "platform" && Number(voucher.pointsCost) > 0;
    const label = voucher.scope === "shop" ? `Gian hàng: ${shopName || "đơn vị phát hành"}` : "Toàn sàn";
    let action = null;
    if (status === "available") {
      const text = pointsVoucher ? `Đổi ${voucher.pointsCost} điểm` : alreadyClaimed ? "Đã nhận" : voucher.remaining <= 0 ? "Hết lượt" : "Nhận voucher";
      action = h("button", { class: "btn btn--ghost", type: "button", text, disabled: alreadyClaimed || voucher.remaining <= 0 || expired || (voucher.pointsCost > 0 && !pointsVoucher) });
      action.addEventListener("click", async () => {
        action.disabled = true;
        try {
          if (pointsVoucher) {
            const balance = await getPoints();
            if (Number(balance.points) < Number(voucher.pointsCost)) {
              showToast(`Bạn cần ${voucher.pointsCost} điểm; hiện có ${balance.points} điểm.`, { error: true });
              action.disabled = false;
              return;
            }
            const confirm = h("button", { class: "btn btn--primary", type: "button", text: `Đổi ${voucher.pointsCost} điểm` });
            const cancel = h("button", { class: "btn btn--ghost", type: "button", text: "Để sau" });
            const close = openModal({ title: "Xác nhận đổi voucher?", description: `Sẽ trừ ${voucher.pointsCost} điểm để nhận ${voucher.code}.`, actions: [cancel, confirm] });
            cancel.addEventListener("click", close);
            confirm.addEventListener("click", async () => {
              confirm.disabled = true;
              try { await redeemVoucher(voucher._id); close(); showToast("Đã đổi voucher bằng điểm"); await loadVouchersView(); }
              catch (error) { showToast(error.message, { error: true }); confirm.disabled = false; }
            });
          } else {
            await claimVoucher(voucher._id);
            showToast(`Đã nhận voucher ${voucher.code}`);
            await loadVouchersView();
          }
        } catch (error) { showToast(error.message, { error: true }); action.disabled = false; }
      });
    }
    const badge = status === "available"
      ? alreadyClaimed ? "Đã nhận" : expired ? VOUCHER_STATUS_LABELS.expired : voucher.remaining <= 0 ? "Hết lượt" : pointsVoucher ? `Đổi ${voucher.pointsCost} điểm` : "Có thể nhận"
      : status === "used" ? VOUCHER_STATUS_LABELS.used : expired ? VOUCHER_STATUS_LABELS.expired : VOUCHER_STATUS_LABELS.unused;
    return h("article", { class: "account-record" },
      h("div", { class: "account-record__head" }, h("strong", { text: `${voucher.title} · ${voucher.code}` }), h("span", { class: `account-badge account-badge--${status === "available" ? (alreadyClaimed ? "used" : "unused") : status}`, text: badge })),
      h("p", { text: `${label} · Giảm ${formatMoney(voucher.amount)} · Đơn tối thiểu ${formatMoney(voucher.minOrder)} · Hạn ${formatDate(voucher.endDate)}${pointsVoucher ? ` · Chi phí ${voucher.pointsCost} điểm` : ""}` }),
      action);
  }

  async function loadVouchersView(target = list, tabGroup = tabs) {
    tabGroup.querySelectorAll('[role="tab"]').forEach((button) => {
      const selected = button.id === `voucher-tab-${state.voucherStatus}`;
      button.setAttribute("aria-selected", String(selected)); button.tabIndex = selected ? 0 : -1;
    });
    target.replaceChildren(h("p", { class: "loading-line", text: "Đang tải voucher…" }));
    try {
      target.replaceChildren();
      if (state.voucherStatus === "available") {
        const [platform, shops] = await Promise.all([getAvailableVouchers(), getShops()]);
        const shopLists = await Promise.all(shops.map((shop) => getAvailableVouchers(shop._id)));
        const available = [...new Map([...platform, ...shopLists.flat()].map((voucher) => [String(voucher._id), voucher])).values()];
        const shopNames = new Map(shops.map((shop) => [String(shop._id), shop.name]));
        if (!available.length) target.append(h("p", { class: "account-list-empty", text: "Hiện không có voucher đang mở để nhận." }));
        available.forEach((voucher) => target.append(voucherNode(voucher, { status: "available", shopName: shopNames.get(String(voucher.shop)) || "", alreadyClaimed: voucher.alreadyClaimed })));
      } else {
        const apiStatus = state.voucherStatus === "used" ? "used" : "unused";
        const owned = await getMyVouchers(apiStatus);
        const vouchers = owned.filter((item) => state.voucherStatus === "used" ? item.status === "used" : state.voucherStatus === "expired" ? item.expired : !item.expired);
        if (!vouchers.length) target.append(h("p", { class: "account-list-empty", text: `Chưa có voucher ${state.voucherStatus === "expired" ? "hết hạn" : state.voucherStatus === "used" ? "đã dùng" : "chưa dùng"}.` }));
        vouchers.forEach((item) => target.append(voucherNode(item.voucher, { status: state.voucherStatus })));
      }
    } catch (error) { showLoadError(target, error, () => loadVouchersView()); }
  }
  loadVouchersView();
  return sectionPanel("Voucher của tôi", "Voucher giảm theo số tiền; cần nhận trước khi áp dụng. Voucher dùng để thanh toán có thể quay lại trạng thái chưa dùng nếu đơn bị hủy và voucher còn hạn.", tabs, list);
}

async function pointsView() {
  const panel = sectionPanel("Điểm thưởng", "Số dư và biến động điểm lấy trực tiếp từ máy chủ.", h("p", { class: "loading-line", text: "Đang tải điểm…" }));
  try {
    const data = await getPoints();
    const balance = h("p", { class: "account-points-balance", text: `${Number(data.points || 0).toLocaleString("vi-VN")} điểm` });
    const rows = h("div", { class: "account-record-list" });
    if (!data.history?.length) rows.append(h("p", { class: "account-list-empty", text: "Chưa có lịch sử biến động điểm." }));
    (data.history || []).forEach((entry) => rows.append(h("article", { class: "account-record" },
      h("div", { class: "account-record__head" }, h("strong", { text: POINT_TYPE_LABELS[entry.type] || entry.type }), h("strong", { text: `${entry.delta > 0 ? "+" : ""}${entry.delta} điểm` })),
      h("p", { text: `${formatDate(entry.createdAt)}${entry.note ? ` · ${entry.note}` : ""}` }),
      entry.order ? h("a", { class: "account-inline-link", href: `./orders.html?order=${encodeURIComponent(entry.order)}`, text: "Xem đơn liên quan" }) : null)));
    panel.replaceChildren(h("h2", { text: "Điểm thưởng" }), h("p", { text: "Quy tắc: 1 điểm / 10.000đ sau giảm giá, không tính phí giao hàng; cộng khi đơn hoàn tất và thu hồi khi hoàn tiền." }), balance, rows,
      h("a", { class: "btn btn--ghost", href: "./account.html?section=vouchers", text: "Voucher của tôi" }));
  } catch (error) { showLoadError(panel, error, () => renderSection()); }
  return panel;
}

async function wishlistView() {
  const panel = sectionPanel("Sản phẩm yêu thích", "Danh sách yêu thích được đồng bộ với tài khoản của bạn.", h("p", { class: "loading-line", text: "Đang tải danh sách…" }));
  try {
    const products = await getWishlist();
    const list = h("div", { class: "product-grid shopping-product-grid account-wishlist-grid" });
    if (!products.length) list.append(h("div", { class: "account-list-empty" }, h("p", { text: "Danh sách yêu thích đang trống." }), h("a", { class: "btn btn--primary", href: "./products.html", text: "Khám phá sản phẩm" })));
    products.forEach((product) => {
      list.append(productCard(product, {
        favorite: true,
        onFavorite: async (chosen, button) => {
          button.disabled = true;
          try {
            await removeWishlist(chosen._id);
            await renderSection();
            showUndoToast("Đã bỏ khỏi yêu thích.", async () => { await addWishlist(chosen._id); await renderSection(); });
          } catch (error) { showToast(error.message, { error: true }); button.disabled = false; }
        },
        onAdd: async (chosen, button) => {
          if (!chosen.available) return;
          const variants = (chosen.variants || []).filter((variant) => Number(variant.stock) > 0);
          if (!variants.length) { showToast("Sản phẩm không còn bán", { error: true }); return; }
          const addVariant = async (variant) => {
            button.disabled = true;
            try { await addToCart(chosen._id, variant._id, 1); notifyCartChanged(); showToast("Đã thêm vào giỏ hàng"); }
            catch (error) { showToast(error.message, { error: true }); }
            finally { button.disabled = false; }
          };
          if (variants.length === 1) { await addVariant(variants[0]); return; }
          const group = h("fieldset", { class: "review-rating-options" }, h("legend", {}, "Chọn biến thể"), ...variants.map((variant, index) => {
            const input = h("input", { type: "radio", name: "wishlistVariant", value: variant._id, checked: index === 0, required: true });
            return h("label", {}, input, h("span", { text: `${variant.name} · ${formatMoney(variant.price)} · Còn ${variant.stock}` }));
          }));
          const add = h("button", { class: "btn btn--primary", type: "button", text: "Thêm vào giỏ" });
          const close = openModal({ title: chosen.name, description: "Chọn biến thể còn hàng.", content: group, actions: [add] });
          add.addEventListener("click", async () => {
            const selected = group.querySelector('input[name="wishlistVariant"]:checked');
            const variant = variants.find((entry) => entry._id === selected?.value);
            if (!variant) return;
            add.disabled = true;
            try { await addToCart(chosen._id, variant._id, 1); notifyCartChanged(); close(); showToast("Đã thêm vào giỏ hàng"); }
            catch (error) { showToast(error.message, { error: true }); add.disabled = false; }
          });
        },
      }));
    });
    panel.replaceChildren(h("h2", { text: "Sản phẩm yêu thích" }), h("p", { text: "Danh sách yêu thích được đồng bộ với tài khoản của bạn." }), list);
  } catch (error) { showLoadError(panel, error, () => renderSection()); }
  return panel;
}

function reviewsView() {
  const list = h("div", { class: "account-record-list", id: "account-review-list", "aria-live": "polite" });
  const tabs = h("div", { class: "account-tabs", role: "tablist", "aria-label": "Đánh giá của tôi" });
  [["pending", "Chờ đánh giá"], ["completed", "Đã đánh giá"]].forEach(([value, label]) => {
    const tab = h("button", { class: "btn btn--ghost", type: "button", role: "tab", id: `review-tab-${value}`, "aria-controls": list.id, "aria-selected": String(state.reviewTab === value), tabindex: state.reviewTab === value ? "0" : "-1", text: label });
    tab.addEventListener("click", () => { state.reviewTab = value; loadReviewTab(); });
    tabs.append(tab);
  });
  tabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const active = buttons.indexOf(document.activeElement);
    const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[index].focus(); buttons[index].click();
  });
  const panel = sectionPanel("Đánh giá của tôi", "Chỉ đánh giá sản phẩm thuộc đơn hàng đã hoàn tất. Mỗi sản phẩm trong mỗi đơn chỉ đánh giá một lần.", tabs, list);

  async function loadReviewTab() {
    tabs.querySelectorAll('[role="tab"]').forEach((tab) => {
      const selected = tab.id === `review-tab-${state.reviewTab}`;
      tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    list.replaceChildren(h("p", { class: "loading-line", text: "Đang tải đánh giá…" }));
    try {
      if (state.reviewTab === "completed") {
        const records = await getAllMyReviews();
        list.replaceChildren();
        if (!records.length) list.append(h("p", { class: "account-list-empty", text: "Bạn chưa gửi đánh giá nào." }));
        records.forEach((review) => {
          const rating = Number(review.rating) || 0;
          list.append(h("article", { class: "account-record" },
            h("div", { class: "account-record__head" }, h("strong", { text: review.product?.name || "Sản phẩm không còn hiển thị" }), h("span", { class: "account-badge", text: `${"★".repeat(rating)}${"☆".repeat(5 - rating)} · ${rating}/5` })),
            h("p", { text: `${review.variantName || ""}${review.order?.code ? ` · Đơn ${review.order.code}` : ""} · ${formatDate(review.createdAt)}` }),
            h("p", { text: review.content || "Không để lại nội dung." }),
            review.reply?.content ? h("p", { class: "account-review-reply", text: `Phản hồi người bán: ${review.reply.content}` }) : null,
            review.product?._id ? h("a", { class: "account-inline-link", href: `./product.html?id=${encodeURIComponent(review.product._id)}`, text: "Xem sản phẩm" }) : null));
        });
      } else {
        const first = await getOrders({ page: 1, limit: 100 });
        const pages = [first];
        for (let page = 2; page <= first.totalPages; page++) pages.push(await getOrders({ page, limit: 100 }));
        const completed = pages.flatMap((page) => page.items).filter((order) => order.status === "hoan_tat");
        const details = await Promise.all(completed.map((order) => getOrder(order._id)));
        const pending = details.flatMap((order) => (order.items || [])
          .filter((item) => item.product && !(order.reviewedProducts || []).includes(String(item.product)))
          .map((item) => ({ order, item })));
        list.replaceChildren();
        if (!pending.length) list.append(h("div", { class: "account-list-empty" }, h("p", { text: "Không có sản phẩm nào đang chờ đánh giá." }), h("a", { class: "btn btn--ghost", href: "./orders.html", text: "Xem đơn hàng" })));
        pending.forEach(({ order, item }) => {
          const write = h("button", { class: "btn btn--primary", type: "button", text: "Viết đánh giá" });
          write.addEventListener("click", () => openReviewForm(order, item, loadReviewTab));
          list.append(h("article", { class: "account-record" },
            h("div", { class: "account-record__head" }, h("strong", { text: item.productName || "Sản phẩm" }), h("span", { class: "account-badge", text: "Chờ đánh giá" })),
            h("p", { text: `${item.variantName || ""} · Đơn ${order.code} · ${formatDate(order.createdAt)}` }), write));
        });
      }
    } catch (error) { showLoadError(list, error, loadReviewTab); }
  }

  loadReviewTab();
  return panel;
}

async function afterSalesView() {
  const panel = sectionPanel("Yêu cầu sau bán hàng", "Theo dõi yêu cầu hủy, hoàn tiền và đổi hàng đã gửi.", h("p", { class: "loading-line", text: "Đang tải yêu cầu…" }));
  try {
    const [records, points] = await Promise.all([getMyAfterSales(), getPoints()]);
    const list = h("div", { class: "account-record-list" });
    if (!records.length) list.append(h("p", { class: "account-list-empty", text: "Bạn chưa gửi yêu cầu sau bán hàng nào." }));
    records.forEach((record) => {
      const requestCard = h("article", { class: "account-record" },
        h("div", { class: "account-record__head" },
          h("strong", { text: `${AFTER_SALES_TYPE_LABELS[record.type] || record.type} · ${record.order?.code || "Đơn hàng"}` }),
          h("span", { class: `account-badge account-badge--${record.status}`, text: AFTER_SALES_STATUS_LABELS[record.status] || record.status })),
        h("p", { text: `${formatDate(record.createdAt)} · ${record.reason}` }),
        record.sellerNote ? h("p", { class: record.status === "bi_tu_choi" ? "account-seller-note" : "", text: `Ghi chú người bán: ${record.sellerNote}` }) : null);
      if (record.type === "hoan_tien" && record.status === "da_chap_nhan" && record.order?._id) {
        const outcome = h("p", { class: "account-compliance-note", text: "Đang xác minh trạng thái đơn và điểm đã thu hồi…" });
        requestCard.append(outcome);
        getOrder(record.order._id).then((order) => {
          const revoked = (points.history || []).filter((entry) => String(entry.order) === String(order._id) && entry.type === "revoke").reduce((sum, entry) => sum + Math.abs(Number(entry.delta || 0)), 0);
          outcome.textContent = order.status === "da_tra_hang" && order.payment?.status === "refunded"
            ? `Đơn đã chuyển “Đã trả hàng”, thanh toán “Đã hoàn”; điểm thu hồi theo lịch sử máy chủ: ${revoked}.`
            : "Yêu cầu đã được chấp nhận. Trạng thái đơn, thanh toán và điểm được cập nhật theo dữ liệu máy chủ.";
        }).catch((error) => { outcome.textContent = error.message; });
      }
      requestCard.append(h("a", { class: "account-inline-link", href: `./orders.html?order=${encodeURIComponent(record.order?._id || "")}`, text: "Xem đơn hàng" }));
      list.append(requestCard);
    });
    panel.replaceChildren(h("h2", { text: "Yêu cầu sau bán hàng" }), h("p", { text: "Theo dõi yêu cầu hủy, hoàn tiền và đổi hàng đã gửi." }), list,
      h("a", { class: "btn btn--ghost", href: "./orders.html", text: "Mở đơn hàng để gửi yêu cầu mới" }));
  } catch (error) { showLoadError(panel, error, () => renderSection()); }
  return panel;
}

function complaintStatus(status) {
  return COMPLAINT_STATUS_LABELS[status] || status;
}

async function complaintDetail(id) {
  try {
    const data = await getMyComplaint(id);
    const content = h("div", { class: "account-modal-content" },
      h("p", { text: `Mã khiếu nại: ${data.code} · Đơn hàng: ${data.orderCode} · ${complaintStatus(data.status)}` }),
      h("p", { text: data.reason }),
      ...(data.responses || []).map((response) => h("article", { class: "account-record" }, h("strong", { text: response.by?.fullName || "TechStore" }), h("p", { text: `${formatDate(response.at)} · ${response.content}` }))),
      data.result ? h("p", { class: "account-compliance-note", text: `Kết quả: ${data.result}` }) : null);
    openModal({ title: `Khiếu nại ${data.code}`, description: complaintStatus(data.status), content });
  } catch (error) { showToast(error.message, { error: true }); }
}

async function complaintsView() {
  const panel = sectionPanel("Khiếu nại", "Gửi yêu cầu đến bộ phận chăm sóc khách hàng và theo dõi phản hồi tại đây.", h("p", { class: "loading-line", text: "Đang tải khiếu nại…" }));
  try {
    const [records, firstOrders] = await Promise.all([getMyComplaints(), getOrders({ page: 1, limit: 100 })]);
    const orderPages = [firstOrders];
    for (let page = 2; page <= firstOrders.totalPages; page++) orderPages.push(await getOrders({ page, limit: 100 }));
    const orders = orderPages.flatMap((page) => page.items);
    const preselectedOrder = new URLSearchParams(location.search).get("orderCode");
    const form = h("form", { class: "account-form" },
      h("div", { class: "account-form-grid" },
        field("Họ tên liên hệ", "contactName", { value: state.user?.fullName || "", required: true }),
        field("Số điện thoại", "contactPhone", { value: state.user?.phone || "", type: "tel", required: true }),
        field("Email liên hệ (không bắt buộc)", "contactEmail", { value: state.user?.email || "", type: "email" }),
        h("label", { class: "account-field" }, "Mã đơn hàng",
          h("select", { name: "orderCode", required: true, ...(!orders.length ? { disabled: true } : {}) },
            h("option", { value: "", text: "Chọn đơn hàng" }), ...orders.map((order) => h("option", { value: order.code, text: `${order.code} · ${formatMoney(order.total)}` }))),
          h("small", { class: "account-field__error", dataset: { error: "orderCode" }, role: "alert" })),
        field("Nội dung khiếu nại (tối thiểu 10 ký tự)", "reason", { rows: 4, required: true, maxLength: 2000 })),
      messageNode(), h("button", { class: "btn btn--primary", type: "submit", text: "Gửi khiếu nại", disabled: !orders.length }));
    if (preselectedOrder && orders.some((order) => order.code === preselectedOrder)) form.elements.orderCode.value = preselectedOrder;
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); clearFieldErrors(form);
      const contactName = form.elements.contactName.value.trim();
      const contactPhone = form.elements.contactPhone.value.trim();
      const contactEmail = form.elements.contactEmail.value.trim();
      const orderCode = form.elements.orderCode.value;
      const reason = form.elements.reason.value.trim();
      if (contactName.length < 2) setFieldError(form, "contactName", "Tên liên hệ phải có ít nhất 2 ký tự.");
      if (!PHONE_RE.test(contactPhone)) setFieldError(form, "contactPhone", "Số điện thoại không hợp lệ.");
      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) setFieldError(form, "contactEmail", "Email không hợp lệ.");
      if (!orderCode) setFieldError(form, "orderCode", "Vui lòng chọn đơn hàng thuộc tài khoản của bạn.");
      if (reason.length < 10 || reason.length > 2000) setFieldError(form, "reason", "Lý do cần từ 10 đến 2000 ký tự.");
      if (form.querySelector('[aria-invalid="true"]')) return;
      const button = form.querySelector('[type="submit"]'); button.disabled = true;
      try {
        await submitComplaint({ contactName, contactPhone, ...(contactEmail ? { contactEmail } : {}), orderCode, reason });
        showToast("Đã gửi khiếu nại đến CSKH"); await renderSection();
      } catch (error) { form.querySelector(".account-message").textContent = error.message; form.querySelector(".account-message").classList.add("is-error"); button.disabled = false; }
    });
    const list = h("div", { class: "account-record-list" });
    if (!records.length) list.append(h("p", { class: "account-list-empty", text: "Chưa có khiếu nại nào." }));
    records.forEach((record) => {
      const details = h("button", { class: "text-button", type: "button", text: "Xem phản hồi" });
      details.addEventListener("click", () => complaintDetail(record._id));
      list.append(h("article", { class: "account-record" },
        h("div", { class: "account-record__head" }, h("strong", { text: `${record.code} · Đơn ${record.orderCode}` }), h("span", { class: `account-badge account-badge--${record.status}`, text: complaintStatus(record.status) })),
        h("p", { text: `${formatDate(record.createdAt)} · ${record.reason}` }), details));
    });
    panel.replaceChildren(h("h2", { text: "Khiếu nại" }), h("p", { text: "Gửi yêu cầu đến bộ phận chăm sóc khách hàng và theo dõi phản hồi tại đây." }),
      sectionPanel("Gửi khiếu nại", "Mã đơn phải thuộc tài khoản của bạn; lý do cần tối thiểu 10 ký tự.", form),
      sectionPanel("Lịch sử", "", list));
  } catch (error) { showLoadError(panel, error, () => renderSection()); }
  return panel;
}

async function confirmDeleteAddress(address) {
  const cancel = h("button", { class: "btn btn--ghost", type: "button", text: "Giữ lại" });
  const remove = h("button", { class: "btn btn--primary", type: "button", text: "Xóa địa chỉ" });
  const close = openModal({ title: "Xóa địa chỉ?", description: `Địa chỉ của ${address.receiver} sẽ bị xóa khỏi sổ. Đơn đã đặt vẫn giữ nguyên địa chỉ giao hàng.`, actions: [cancel, remove] });
  cancel.addEventListener("click", close);
  remove.addEventListener("click", async () => {
    remove.disabled = true;
    try { state.addresses = await deleteAddress(address._id); close(); await renderSection(); showToast("Đã xóa địa chỉ"); }
    catch (error) { showToast(error.message, { error: true }); remove.disabled = false; }
  });
}

function renderShell() {
  const nav = h("nav", { class: "account-nav", "aria-label": "Mục tài khoản" }, ...sections.map(([key, label]) =>
    h("a", { href: `./account.html?section=${encodeURIComponent(key)}`, "aria-current": key === state.section ? "page" : null, text: label })));
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const next = new URL(link.href).searchParams.get("section");
    if (sections.some(([key]) => key === next)) {
      history.pushState(null, "", link.href);
      state.section = next;
      renderSection();
    }
  });
  main.replaceChildren(h("nav", { class: "breadcrumbs" }, h("a", { href: "./index.html", text: "Trang chủ" }), " / Tài khoản"),
    h("div", { class: "page-heading" }, h("div", {}, h("span", { class: "section-kicker", text: "TÀI KHOẢN KHÁCH HÀNG" }), h("h1", { text: "Tài khoản của tôi" }))),
    h("div", { class: "account-shell" }, nav, h("div", { id: "account-content", class: "account-content", "aria-live": "polite" })));
}

async function renderSection() {
  const content = $("#account-content");
  if (!content) return;
  const [key, title] = sections.find(([section]) => section === state.section) || sections[0];
  document.title = `${title} — TechStore`;
  $(".account-nav").querySelectorAll("a").forEach((link) => {
    const active = new URL(link.href).searchParams.get("section") === key;
    link.setAttribute("aria-current", active ? "page" : "false");
    if (!active) link.removeAttribute("aria-current");
  });
  content.setAttribute("aria-busy", "true");
  content.replaceChildren(h("p", { class: "loading-line", text: "Đang tải…" }));
  try {
    let panel;
    if (key === "profile") panel = profileView();
    else if (key === "addresses") { await reloadAddresses(); panel = addressesView(); }
    else if (key === "security") panel = securityView();
    else if (key === "vouchers") panel = voucherView();
    else if (key === "points") panel = await pointsView();
    else if (key === "wishlist") panel = await wishlistView();
    else if (key === "reviews") panel = await reviewsView();
    else if (key === "after-sales") panel = await afterSalesView();
    else panel = await complaintsView();
    content.replaceChildren(panel);
  } catch (error) { showLoadError(content, error, () => renderSection()); }
  finally { content.setAttribute("aria-busy", "false"); }
}

async function init(user) {
  const chromeUser = await mountShoppingChrome(user);
  if (!user || user.role !== "customer") return;
  try {
    state.user = await getProfile();
    updateStoredUser(state.user);
  } catch (error) {
    state.user = chromeUser || user;
    showToast(error.message, { error: true });
  }
  const initialSection = new URLSearchParams(location.search).get("section");
  if (sections.some(([key]) => key === initialSection)) state.section = initialSection;
  renderShell();
  await renderSection();
}

document.addEventListener("shopping:authorized", (event) => init(event.detail?.user));
document.addEventListener("addresses:changed", async () => {
  try { await reloadAddresses(); } catch (error) { showToast(error.message, { error: true }); }
});
document.addEventListener("reviews:changed", () => { if (state.section === "reviews") renderSection(); });
window.addEventListener("popstate", () => {
  const section = new URLSearchParams(location.search).get("section");
  state.section = sections.some(([key]) => key === section) ? section : "profile";
  renderSection();
});
requireCustomerPage();