import { getCart } from "./cart-service.js";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "./address-service.js";
import { checkout as placeOrder, payOrderGroup } from "./order-service.js";
import { getAvailableVouchers, getMyVouchers, redeemVoucher, claimVoucher } from "./voucher-service.js";
import { $, h, formatMoney, formatDate, makeImage } from "./utils.js";
import { mountShoppingChrome, statusLabels, orderStatusClass, notifyCartChanged } from "./shopping.js";
import { requireCustomerPage } from "./shopping.js";
import { openModal, showToast } from "./ui.js";

const main = $("#page-content");
const params = new URLSearchParams(location.search);
const itemIds = (params.get("items") || "").split(",").filter(Boolean);
const fingerprint = itemIds.sort().join(",") || "all";
const RESULT_KEY = "techstore.checkout.result";
const PENDING_KEY = "techstore.checkout.pending";
let state = { cart: null, addresses: [], vouchers: [], selectedVouchers: {}, selectedAddressId: null, oneTimeAddress: null, profile: null, pending: false };

function isSelected(item) { return !itemIds.length || itemIds.includes(item._id); }
function selectedCartItems() { return (state.cart?.items || []).filter(isSelected); }
function shopGroups() {
  const groups = new Map();
  for (const item of selectedCartItems()) {
    const key = item.shop?._id || "unknown";
    if (!groups.has(key)) groups.set(key, { shop: item.shop, items: [] });
    groups.get(key).items.push(item);
  }
  return groups;
}

function storedResult() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RESULT_KEY) || "null");
    return saved?.fingerprint === fingerprint ? saved : null;
  } catch { return null; }
}

function renderResult(result, paymentPending = false) {
  const orders = result.orders || [];
  const content = h("section", { class: "checkout-result", "aria-live": "polite" },
    h("span", { class: "section-kicker", text: "ĐẶT HÀNG THÀNH CÔNG" }),
    h("h1", { text: "Cảm ơn bạn đã đặt hàng" }),
    h("p", { text: `Mã nhóm đơn: ${result.groupCode}` }),
    ...orders.map((order) => h("div", { class: "checkout-result-order" },
      h("strong", { text: `${order.shop?.name || "Gian hàng"} · ${order.code}` }),
      h("p", { text: `${formatMoney(order.total)} · ${statusLabels[order.status] || order.status}` }))),
    h("p", { class: "checkout-warning", text: "Phí vận chuyển, giảm giá và tổng tiền trên đây là số máy chủ xác nhận. Điểm (nếu có) được cộng khi đơn hoàn tất." }),
    h("div", { class: "checkout-result-actions" }));
  const actions = content.querySelector(".checkout-result-actions");
  if (paymentPending) {
    const pay = h("button", { class: "btn btn--primary", type: "button", text: "Xác nhận thanh toán giả lập" });
    pay.addEventListener("click", async () => {
      pay.disabled = true;
      try {
        const response = await payOrderGroup(result.groupCode);
        const updated = { ...result, orders: response.orders };
        sessionStorage.setItem(RESULT_KEY, JSON.stringify({ fingerprint, ...updated }));
        renderResult(updated, false);
        showToast("Thanh toán giả lập thành công");
      } catch (error) {
        showToast(error.message, { error: true });
        if (error.status === 404) location.href = "./orders.html";
        else pay.disabled = false;
      }
    });
    actions.append(pay);
    content.append(h("p", { class: "checkout-warning", text: "Đây là thanh toán giả lập; chưa có cổng thanh toán thật." }));
  }
  actions.append(h("a", { class: "btn btn--ghost", href: "./orders.html", text: "Xem đơn hàng" }),
    h("a", { class: "btn btn--primary", href: "./products.html", text: "Tiếp tục mua sắm" }));
  main.replaceChildren(h("ol", { class: "checkout-steps", "aria-label": "Tiến trình thanh toán" },
    h("li", { text: "Giỏ hàng" }), h("li", { class: "is-current", text: "Thanh toán" }), h("li", { text: "Hoàn tất" })), content);
}

function addressText(address) {
  return [address.detail, address.ward, address.district, address.province].filter(Boolean).join(", ");
}

function addressIsDuplicate(candidate, exceptId) {
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
  return state.addresses.find((address) => String(address._id) !== String(exceptId || "") &&
    ["receiver", "phone", "detail", "ward", "district", "province"].every((key) => normalize(address[key]) === normalize(candidate[key])));
}

function addressFormModal(address = null) {
  const form = h("form", { class: "address-form" });
  const fieldErrors = {};
  const values = address || { receiver: state.profile?.fullName || "", phone: state.profile?.phone || "" };
  const fields = [
    ["receiver", "Họ tên người nhận", "text"], ["phone", "Số điện thoại", "tel"], ["detail", "Địa chỉ chi tiết", "text"],
    ["ward", "Phường / xã", "text"], ["district", "Quận / huyện", "text"], ["province", "Tỉnh / thành phố", "text"],
  ];
  fields.forEach(([name, label, type]) => {
    const input = h("input", { name, type, value: values[name] || "", required: ["receiver", "phone", "detail"].includes(name), autocomplete: name === "receiver" ? "name" : name === "phone" ? "tel" : "street-address" });
    const error = h("small", { class: "account-field__error", dataset: { error: name }, role: "alert" });
    fieldErrors[name] = error;
    form.append(h("label", { class: "account-field" }, label, input, error));
  });
  const saveBook = h("input", { type: "checkbox", name: "saveBook", checked: true });
  const makeDefault = h("input", { type: "checkbox", name: "isDefault", checked: !!address?.isDefault || !state.addresses.length });
  const saveOption = h("label", { class: "account-check" }, saveBook, "Lưu vào sổ địa chỉ");
  const defaultOption = h("label", { class: "account-check" }, makeDefault, "Đặt làm địa chỉ mặc định");
  const note = h("p", { class: "checkout-warning", text: "Địa chỉ dùng trực tiếp cho đơn này sẽ được lưu thành bản sao trong đơn hàng; thay đổi sổ địa chỉ không làm đổi đơn đã đặt." });
  form.append(saveOption, defaultOption, note);
  saveBook.addEventListener("change", () => { makeDefault.disabled = !saveBook.checked; });
  const error = h("p", { class: "form-error", role: "alert", "aria-live": "polite" });
  const save = h("button", { class: "btn btn--primary", type: "button", text: "Dùng địa chỉ này" });
  const close = openModal({ title: address ? "Sửa địa chỉ nhận hàng" : "Địa chỉ nhận hàng", content: form, actions: [save] });
  const validate = () => {
    Object.values(fieldErrors).forEach((el) => { el.textContent = ""; });
    const receiver = form.elements.receiver.value.trim();
    const phone = form.elements.phone.value.trim();
    const detail = form.elements.detail.value.trim();
    let valid = true;
    if (receiver.length < 2) { fieldErrors.receiver.textContent = "Tên người nhận phải có ít nhất 2 ký tự."; valid = false; }
    if (!/^(0|\+84)\d{9,10}$/.test(phone)) { fieldErrors.phone.textContent = "Số điện thoại không hợp lệ."; valid = false; }
    if (detail.length < 3) { fieldErrors.detail.textContent = "Địa chỉ chi tiết phải có ít nhất 3 ký tự."; valid = false; }
    return valid;
  };
  const submit = async () => {
    error.textContent = "";
    if (!validate()) return;
    save.disabled = true;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      receiver: String(data.receiver).trim(), phone: String(data.phone).trim(), detail: String(data.detail).trim(),
      ward: String(data.ward || "").trim(), district: String(data.district || "").trim(), province: String(data.province || "").trim(),
    };
    const isDefault = makeDefault.checked;
    try {
      if (saveBook.checked) {
        const duplicate = addressIsDuplicate(payload, address?._id);
        if (duplicate) {
          if (isDefault && !duplicate.isDefault) state.addresses = await updateAddress(duplicate._id, { isDefault: true });
          state.selectedAddressId = duplicate._id;
          state.oneTimeAddress = null;
        } else {
          state.addresses = address
            ? await updateAddress(address._id, { ...payload, isDefault })
            : await createAddress({ ...payload, isDefault });
          const saved = state.addresses.find((item) => String(item._id) === String(address?._id)) || state.addresses.at(-1);
          state.selectedAddressId = saved?._id || null;
          state.oneTimeAddress = null;
        }
      } else {
        state.selectedAddressId = null;
        state.oneTimeAddress = payload;
      }
      renderCheckout();
      close();
      showToast(saveBook.checked ? "Đã cập nhật địa chỉ nhận hàng" : "Địa chỉ chỉ áp dụng cho đơn này");
    } catch (requestError) {
      error.textContent = requestError.message;
      save.disabled = false;
    }
  };
  save.addEventListener("click", submit);
  form.addEventListener("submit", (event) => { event.preventDefault(); submit(); });
}

function chooseDefaultAddress() {
  return state.addresses.find((address) => address.isDefault) || state.addresses.at(-1) || null;
}

function deleteAddressInCheckout(address, closeChooser) {
  closeChooser();
  const remove = h("button", { class: "btn btn--primary", type: "button", text: "Xóa địa chỉ" });
  const keep = h("button", { class: "btn btn--ghost", type: "button", text: "Giữ lại" });
  const close = openModal({ title: "Xóa địa chỉ?", description: `Địa chỉ của ${address.receiver} sẽ bị xóa khỏi sổ. Đơn đã đặt vẫn giữ nguyên địa chỉ giao hàng.`, actions: [keep, remove] });
  keep.addEventListener("click", close);
  remove.addEventListener("click", async () => {
    remove.disabled = true;
    try {
      state.addresses = await deleteAddress(address._id);
      if (String(state.selectedAddressId) === String(address._id)) state.selectedAddressId = chooseDefaultAddress()?._id || null;
      close();
      renderCheckout();
      if (!state.addresses.length) addressFormModal();
    } catch (requestError) { showToast(requestError.message, { error: true }); remove.disabled = false; }
  });
}

function openAddressChooser() {
  const content = h("div", { class: "account-modal-content" });
  if (!state.addresses.length) content.append(h("p", { class: "account-list-empty", text: "Sổ địa chỉ chưa có địa chỉ nào." }));
  state.addresses.forEach((address) => {
    const radio = h("input", { type: "radio", name: "checkoutAddress", value: address._id, checked: String(state.selectedAddressId) === String(address._id) });
    const edit = h("button", { class: "text-button", type: "button", text: "Sửa" });
    const remove = h("button", { class: "text-button", type: "button", text: "Xóa" });
    const row = h("div", { class: "address-option" }, radio,
      h("span", {}, h("strong", { text: `${address.receiver} · ${address.phone}` }), h("small", { text: `${addressText(address)}${address.isDefault ? " · Mặc định" : ""}` }),
        h("span", { class: "account-actions" }, edit, remove)));
    radio.addEventListener("change", () => { state.selectedAddressId = address._id; state.oneTimeAddress = null; });
    edit.addEventListener("click", () => { close(); addressFormModal(address); });
    remove.addEventListener("click", () => deleteAddressInCheckout(address, close));
    content.append(row);
  });
  const select = h("button", { class: "btn btn--primary", type: "button", text: "Chọn địa chỉ" });
  const add = h("button", { class: "btn btn--ghost", type: "button", text: "Thêm địa chỉ mới" });
  const other = h("button", { class: "btn btn--ghost", type: "button", text: "Giao đến địa chỉ khác cho đơn này" });
  const close = openModal({ title: "Chọn địa chỉ giao hàng", description: "Chọn địa chỉ đã lưu, chỉnh sửa hoặc nhập địa chỉ khác cho đơn này.", content, actions: [select, add, other] });
  select.addEventListener("click", () => {
    const selected = content.querySelector('input[name="checkoutAddress"]:checked');
    if (!selected) { showToast("Vui lòng chọn một địa chỉ", { error: true }); return; }
    state.selectedAddressId = selected.value; state.oneTimeAddress = null; renderCheckout(); close();
  });
  add.addEventListener("click", () => { close(); addressFormModal(); });
  other.addEventListener("click", () => { close(); addressFormModal(); });
}

function voucherOption(voucher, group, subtotal) {
  const v = voucher.voucher;
  const shop = group.shop;
  let reason = "";
  if (!v || voucher.status !== "unused") reason = "Voucher đã sử dụng";
  else if (voucher.expired || new Date(v.endDate) <= new Date()) reason = "Voucher đã hết hạn";
  else if (v.scope === "shop" && String(v.shop) !== String(shop?._id)) reason = "Chỉ dùng tại gian hàng khác";
  else if (subtotal < Number(v.minOrder || 0)) reason = `Đơn chưa đạt ${formatMoney(v.minOrder)}`;
  return { id: voucher._id, title: reason ? `${v?.code || "Voucher"} — ${reason}` : `${v.code} — giảm ${formatMoney(v.amount)} (từ ${formatMoney(v.minOrder)})`, disabled: !!reason, reason, amount: Number(v?.amount || 0) };
}

async function openPointVoucherPicker(shopId) {
  try {
    const [available, points] = await Promise.all([getAvailableVouchers(shopId), (await import("./api.js")).request("/customer/points")]);
    const candidates = available.filter((voucher) => voucher.scope === "platform" && voucher.pointsCost > 0);
    if (!candidates.length) { showToast("Hiện không có voucher toàn sàn để đổi điểm."); return; }
    const list = h("div", { class: "voucher-picker-list" });
    let selectedVoucher = candidates[0];
    candidates.forEach((v, index) => {
      const radio = h("input", { type: "radio", name: "pointVoucher", value: v._id, checked: index === 0, disabled: v.remaining <= 0 });
      radio.addEventListener("change", () => { selectedVoucher = v; });
      list.append(h("label", { class: "address-option" }, radio,
        h("span", {}, h("strong", { text: v.title }), h("small", { text: `Giảm ${formatMoney(v.amount)} · Đơn từ ${formatMoney(v.minOrder)} · Đổi ${v.pointsCost} điểm · Còn ${v.remaining} lượt` }))));
    });
    const error = h("p", { class: "form-error", role: "alert" });
    const confirm = h("button", { class: "btn btn--primary", type: "button", text: `Đổi voucher · ${points.points} điểm hiện có` });
    const close = openModal({ title: "Đổi voucher bằng điểm", description: "Chỉ voucher toàn sàn mới đổi được bằng điểm.", content: h("div", {}, list, error), actions: [confirm] });
    confirm.addEventListener("click", async () => {
      if (!selectedVoucher || selectedVoucher.pointsCost > points.points) { error.textContent = "Bạn không đủ điểm để đổi voucher này."; return; }
      confirm.disabled = true;
      try {
        await redeemVoucher(selectedVoucher._id);
        state.vouchers = await getMyVouchers("unused");
        renderCheckout();
        close();
        showToast("Đã đổi voucher bằng điểm");
      } catch (e) { error.textContent = e.message; confirm.disabled = false; }
    });
  } catch (error) { showToast(error.message, { error: true }); }
}

function renderCheckout() {
  const groups = shopGroups();
  const items = selectedCartItems();
  const subtotal = items.filter((item) => item.available).reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const savedAddress = state.addresses.find((address) => String(address._id) === String(state.selectedAddressId));
  const activeAddress = state.oneTimeAddress || savedAddress;
  const addressCard = activeAddress
    ? h("article", { class: "checkout-address-card" },
        h("div", { class: "checkout-address-card__head" },
          h("strong", { text: `${activeAddress.receiver} · ${activeAddress.phone}` }),
          state.oneTimeAddress
            ? h("span", { class: "account-badge", text: "Chỉ dùng đơn này" })
            : savedAddress?.isDefault ? h("span", { class: "account-badge", text: "Mặc định" }) : null),
        h("p", { text: addressText(activeAddress) }),
        h("button", { class: "btn btn--ghost", type: "button", text: "Thay đổi", onclick: openAddressChooser }))
    : h("div", { class: "checkout-address-empty" },
        h("p", { text: "Chưa có địa chỉ giao hàng. Thêm địa chỉ để tiếp tục đặt hàng." }),
        h("button", { class: "btn btn--primary", type: "button", text: "Thêm địa chỉ nhận hàng", onclick: openAddressChooser }));

  const shopNodes = [...groups.entries()].map(([shopId, group]) => {
    const lines = group.items.map((item) => h("div", { class: "checkout-line" },
      h("span", { text: `${item.productName || "Sản phẩm"} · ${item.variantName || ""} × ${item.quantity}` }),
      h("strong", { text: formatMoney(item.lineTotal) })));
    const groupSubtotal = group.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    const eligible = state.vouchers.map((v) => voucherOption(v, group, groupSubtotal));
    const selector = h("select", { class: "voucher-select", "aria-label": `Chọn voucher cho ${group.shop?.name || "gian hàng"}` },
      h("option", { value: "", text: "Không dùng voucher" }),
      ...eligible.map((v) => h("option", { value: v.id, disabled: v.disabled, text: v.title })));
    selector.value = state.selectedVouchers[shopId] || "";
    selector.addEventListener("change", () => { state.selectedVouchers[shopId] = selector.value; renderCheckout(); });
    const redeem = h("button", { class: "text-button", type: "button", text: "Đổi voucher toàn sàn bằng điểm" });
    redeem.addEventListener("click", () => openPointVoucherPicker(shopId));
    const codeInput = h("input", { class: "voucher-code-input", type: "text", maxlength: "40", placeholder: "Nhập mã giảm giá", autocomplete: "off", "aria-label": `Mã giảm giá cho ${group.shop?.name || "gian hàng"}` });
    const applyBtn = h("button", { class: "btn btn--ghost", type: "button", text: "Áp dụng" });
    const codeMsg = h("p", { class: "voucher-hint", role: "status", "aria-live": "polite" });
    const applyCode = async () => {
      const code = codeInput.value.trim().toUpperCase();
      if (!code) { codeMsg.textContent = "Vui lòng nhập mã giảm giá."; return; }
      applyBtn.disabled = true;
      codeMsg.textContent = "Đang kiểm tra mã…";
      try {
        let owned = state.vouchers.find((u) => String(u.voucher?.code).toUpperCase() === code);
        if (!owned) {
          const available = await getAvailableVouchers(shopId === "unknown" ? undefined : shopId);
          const found = available.find((v) => String(v.code).toUpperCase() === code);
          if (!found) throw new Error("Mã giảm giá không tồn tại hoặc không áp dụng được cho gian hàng này.");
          await claimVoucher(found._id);
          state.vouchers = await getMyVouchers("unused");
          owned = state.vouchers.find((u) => String(u.voucher?._id) === String(found._id));
        }
        if (!owned) throw new Error("Không thể áp dụng mã này.");
        const opt = voucherOption(owned, group, groupSubtotal);
        if (opt.disabled) throw new Error(opt.reason);
        state.selectedVouchers[shopId] = owned._id;
        renderCheckout();
        showToast(`Đã áp dụng mã ${code}`);
      } catch (e) { codeMsg.textContent = e.message; applyBtn.disabled = false; }
    };
    applyBtn.addEventListener("click", applyCode);
    codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } });
    return h("article", { class: "checkout-shop" },
      h("h3", { text: group.shop?.name || "Gian hàng không còn hoạt động" }),
      ...lines,
      h("div", { class: "checkout-line" }, h("strong", { text: "Tạm tính tiền hàng" }), h("strong", { text: formatMoney(groupSubtotal) })),
      h("label", { class: "filter-field" }, "Nhập mã giảm giá", h("div", { class: "voucher-code-row" }, codeInput, applyBtn)),
      codeMsg,
      h("label", { class: "filter-field" }, "Hoặc chọn voucher đã nhận", selector),
      redeem);
  });

  const paymentCod = h("input", { type: "radio", name: "paymentMethod", value: "cod", checked: true });
  const paymentOnline = h("input", { type: "radio", name: "paymentMethod", value: "online" });
  const note = h("textarea", { id: "seller-note", maxlength: "500", placeholder: "Lời nhắn cho người bán (không bắt buộc)", rows: "3" });
  const place = h("button", { class: "btn btn--primary", type: "button", text: "Đặt hàng", disabled: !activeAddress });
  const error = h("p", { class: "form-error", id: "checkout-error", role: "alert", "aria-live": "assertive" });
  const estimatedDiscount = Object.entries(state.selectedVouchers).reduce((sum, [shopId, voucherId]) => {
    const owned = state.vouchers.find((v) => v._id === voucherId)?.voucher;
    if (!owned) return sum;
    const groupSubtotal = groups.get(shopId)?.items.reduce((acc, item) => acc + Number(item.lineTotal || 0), 0) || 0;
    return sum + Math.min(Number(owned.amount || 0), groupSubtotal);
  }, 0);
  const summary = h("aside", { class: "checkout-summary" },
    h("h2", { text: "Tóm tắt tạm tính" }),
    h("div", { class: "cart-total-line" }, h("span", { text: "Tiền hàng (từ dữ liệu giỏ)" }), h("strong", { text: formatMoney(subtotal) })),
    h("div", { class: "cart-total-line" }, h("span", { text: "Giảm giá dự kiến" }), h("strong", { text: formatMoney(estimatedDiscount) })),
    h("p", { class: "checkout-warning", text: "Phí vận chuyển và tổng thanh toán do máy chủ xác nhận khi đặt hàng. Mỗi gian hàng thành một đơn, phí ship được tính riêng." }),
    h("p", { class: "voucher-hint", text: "Điểm được máy chủ cộng khi đơn hoàn tất; số điểm thực nhận hiển thị trong tài khoản." }),
    error, place);
  const checkoutContent = h("div", { class: "checkout-layout" },
    h("div", {},
      h("section", { class: "checkout-section" }, h("h2", { text: "1. Địa chỉ nhận hàng" }), addressCard,
        h("p", { class: "voucher-hint", text: "Đơn hàng lưu ảnh chụp địa chỉ tại thời điểm đặt; sửa sổ địa chỉ không ảnh hưởng đơn cũ." })),
      h("section", { class: "checkout-section" }, h("h2", { text: `2. Đơn hàng (${groups.size} gian hàng)` }), h("div", { class: "checkout-products" }, ...shopNodes)),
      h("section", { class: "checkout-section checkout-payment" },
        h("h2", { text: "3. Phương thức thanh toán" }),
        h("label", {}, paymentCod, "Thanh toán khi nhận hàng (COD)"),
        h("label", {}, paymentOnline, "Thanh toán online giả lập"),
        h("p", { class: "checkout-warning", text: "Nếu chọn online, sau khi đặt đơn sẽ có bước xác nhận thanh toán giả lập." }),
        h("label", { class: "filter-field" }, "Ghi chú cho người bán", note))),
    summary);
  main.replaceChildren(
    h("nav", { class: "breadcrumbs" }, h("a", { href: "./cart.html", text: "Giỏ hàng" }), " / Thanh toán"),
    h("ol", { class: "checkout-steps", "aria-label": "Tiến trình thanh toán" },
      h("li", { text: "Giỏ hàng" }), h("li", { class: "is-current", text: "Thanh toán" }), h("li", { text: "Hoàn tất" })),
    checkoutContent);

  place.addEventListener("click", async () => {
    if (state.pending) return;
    const addressId = state.selectedAddressId && state.addresses.some((address) => String(address._id) === String(state.selectedAddressId))
      ? state.selectedAddressId : null;
    const invalid = items.filter((item) => !item.available);
    if (invalid.length) { error.textContent = "Có sản phẩm không còn bán hoặc hết hàng. Vui lòng quay lại giỏ để xóa hoặc sửa."; return; }
    if (!addressId && !state.oneTimeAddress) { error.textContent = "Vui lòng thêm và chọn địa chỉ nhận hàng."; place.disabled = true; return; }
    if (!items.length) { error.textContent = "Không có sản phẩm nào được chọn."; return; }
    const paymentMethod = main.querySelector('input[name="paymentMethod"]:checked')?.value || "cod";
    const voucherPayload = Object.fromEntries(Object.entries(state.selectedVouchers).filter(([, value]) => value));
    const payload = {
      cartItemIds: items.map((item) => item._id), ...(addressId ? { addressId } : { address: state.oneTimeAddress }),
      paymentMethod, note: note.value.trim(), vouchers: voucherPayload,
    };
    place.disabled = true; place.setAttribute("aria-busy", "true"); place.textContent = "Đang đặt hàng…";
    state.pending = true;
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ fingerprint, at: Date.now() }));
    try {
      const result = await placeOrder(payload);
      const save = { fingerprint, ...result };
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(save));
      sessionStorage.removeItem(PENDING_KEY);
      notifyCartChanged();
      renderResult(save, paymentMethod === "online");
    } catch (e) {
      error.textContent = `${e.message} Nếu lệnh đã được máy chủ nhận, hãy kiểm tra Đơn hàng trước khi thử lại.`;
      place.disabled = false; place.removeAttribute("aria-busy"); place.textContent = "Đặt hàng";
      if (e.status > 0 && e.status < 500) { state.pending = false; sessionStorage.removeItem(PENDING_KEY); }
      if (e.status === 409 || /tồn kho|hết hàng|ngừng bán/i.test(e.message)) {
        error.append(" ", h("a", { href: "./cart.html", text: "Quay lại giỏ hàng" }));
      }
    }
  });
}

async function init(user) {
  state.profile = await mountShoppingChrome(user);
  const prior = storedResult();
  if (prior) {
    renderResult(prior, prior.orders.some((o) => o.payment?.method === "online" && o.payment?.status === "unpaid"));
    return;
  }
  const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
  if (pending?.fingerprint === fingerprint && Date.now() - pending.at < 5 * 60 * 1000) {
    main.hidden = false;
    main.replaceChildren(h("div", { class: "checkout-result" },
      h("h1", { text: "Đang xác minh đơn hàng" }),
      h("p", { text: "Yêu cầu đặt hàng trước đó chưa nhận được phản hồi xác nhận. Để tránh đặt trùng, hãy kiểm tra danh sách đơn hàng trước khi thực hiện lại." }),
      h("a", { class: "btn btn--primary", href: "./orders.html", text: "Kiểm tra đơn hàng" }),
      h("button", { class: "btn btn--ghost", type: "button", text: "Tôi đã kiểm tra, thử lại" })));
    main.querySelector("button").addEventListener("click", () => {
      sessionStorage.removeItem(PENDING_KEY);
      state.pending = false;
      init();
    });
    return;
  }
  try {
    [state.cart, state.addresses, state.vouchers] = await Promise.all([getCart(), getAddresses(), getMyVouchers("unused")]);
    state.selectedAddressId = chooseDefaultAddress()?._id || null;
    const valid = state.cart.items.filter(isSelected);
    if (!valid.length) {
      main.hidden = false;
      main.replaceChildren(h("div", { class: "empty-state" }, h("h1", { text: "Không có sản phẩm để thanh toán" }), h("a", { class: "btn btn--primary", href: "./cart.html", text: "Quay lại giỏ hàng" })));
      return;
    }
    renderCheckout();
    if (!state.addresses.length) addressFormModal();
  } catch (error) {
    main.hidden = false;
    main.replaceChildren(h("div", { class: "error-state", role: "alert" }, h("p", { text: error.message }), h("button", { class: "btn btn--primary", type: "button", onclick: () => init(), text: "Thử lại" })));
  }
}

document.addEventListener("shopping:authorized", (event) => init(event.detail?.user));
document.addEventListener("addresses:changed", async () => {
  try {
    const selectedBefore = state.selectedAddressId;
    state.addresses = await getAddresses();
    if (selectedBefore && !state.addresses.some((address) => String(address._id) === String(selectedBefore))) {
      state.selectedAddressId = chooseDefaultAddress()?._id || null;
    }
    if (state.addresses.some((address) => String(address._id) === String(state.selectedAddressId))) state.oneTimeAddress = null;
    if (main.querySelector(".checkout-layout")) renderCheckout();
  } catch (error) { showToast(error.message, { error: true }); }
});
requireCustomerPage();
