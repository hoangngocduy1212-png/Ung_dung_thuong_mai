import { getCart, addToCart } from "./cart-service.js";
import { request } from "./api.js";
import { $, h, formatMoney, makeImage } from "./utils.js";
import { mountShoppingChrome, notifyCartChanged } from "./shopping.js";
import { requireCustomerPage } from "./shopping.js";
import { showToast } from "./ui.js";

const main = $("#page-content");
let cartData;
let selected = new Set();

function showEmpty() {
  main.replaceChildren(h("div", { class: "empty-state" },
    h("h1", { text: "Giỏ hàng đang trống" }),
    h("p", { text: "Khám phá sản phẩm và thêm lựa chọn phù hợp vào giỏ." }),
    h("a", { class: "btn btn--primary", href: "./products.html", text: "Tiếp tục mua sắm" })));
}

function undoToast(item) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = h("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.append(toast);
  }
  const undo = h("button", { class: "text-button", type: "button", text: "Hoàn tác" });
  undo.addEventListener("click", async () => {
    undo.disabled = true;
    try {
      await addToCart(item.product, item.variant, item.quantity);
      showToast("Đã khôi phục sản phẩm vào giỏ");
      await loadCart();
      notifyCartChanged();
    } catch (error) { showToast(error.message, { error: true }); }
  });
  toast.replaceChildren(h("span", { text: "Đã xóa sản phẩm. " }), undo);
  toast.classList.remove("is-error");
  toast.classList.add("is-visible");
  clearTimeout(undoToast.timer);
  undoToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 6000);
}

function render() {
  const groups = new Map();
  for (const item of cartData.items || []) {
    const shopId = item.shop?._id || "unknown";
    if (!groups.has(shopId)) groups.set(shopId, { name: item.shop?.name || "Gian hàng không còn hoạt động", items: [] });
    groups.get(shopId).items.push(item);
  }
  const usable = (cartData.items || []).filter((item) => item.available);
  const checkedIds = usable.map((item) => item._id).filter((itemId) => selected.has(itemId));
  const subtotal = usable.filter((item) => selected.has(item._id)).reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const sections = [...groups.entries()].map(([shopId, group]) => h("section", { class: "cart-shop-group", dataset: { shop: shopId } },
    h("h2", { text: group.name }),
    ...group.items.map((item) => {
      const available = !!item.available;
      const checkbox = h("input", { type: "checkbox", checked: selected.has(item._id), disabled: !available, "aria-label": `Chọn ${item.productName || "sản phẩm"}` });
      checkbox.addEventListener("change", () => { checkbox.checked ? selected.add(item._id) : selected.delete(item._id); render(); });
      const qty = h("input", { type: "number", min: "1", max: "99", value: String(item.quantity), disabled: !available, "aria-label": `Số lượng ${item.productName || ""}`, dataset: { item: item._id } });
      qty.addEventListener("change", async () => {
        const quantity = Number(qty.value);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(99, item.stock)) {
          qty.value = String(item.quantity);
          showToast(`Số lượng phải từ 1 đến ${Math.min(99, item.stock)}.`, { error: true }); return;
        }
        qty.disabled = true;
        try {
          cartData = await request(`/customer/cart/items/${encodeURIComponent(item._id)}`, { method: "PATCH", body: { quantity } });
          await loadCart(false);
          notifyCartChanged();
        } catch (error) { showToast(error.message, { error: true }); qty.value = String(item.quantity); qty.disabled = false; }
      });
      const remove = h("button", { class: "text-button", type: "button", text: "Xóa", "aria-label": `Xóa ${item.productName || "sản phẩm"}` });
      remove.addEventListener("click", async () => {
        remove.disabled = true;
        try {
          await request(`/customer/cart/items/${encodeURIComponent(item._id)}`, { method: "DELETE" });
          selected.delete(item._id);
          showToast("Đã xóa sản phẩm");
          undoToast(item);
          await loadCart(false);
          notifyCartChanged();
        } catch (error) { showToast(error.message, { error: true }); remove.disabled = false; }
      });
      return h("article", { class: `cart-item${available ? "" : " cart-item--unavailable"}` },
        checkbox,
        makeImage(item.image, item.productName || "Ảnh sản phẩm"),
        h("div", {},
          h("h3", { text: item.productName || "Sản phẩm không còn bán" }),
          h("p", { text: `Phân loại: ${item.variantName || "Không xác định"}` }),
          !available ? h("p", { class: "cart-item__status", text: "Không còn bán hoặc đã hết hàng; vui lòng xóa khỏi giỏ." }) : null,
          h("span", { class: "cart-item__price", text: formatMoney(item.price) })),
        h("div", { class: "cart-item__controls" }, qty, h("strong", { text: formatMoney(item.lineTotal) }), remove));
    }),
    h("p", { class: "cart-shop-subtotal", text: `Tạm tính gian hàng: ${formatMoney(group.items.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0))}` })));
  const allToggle = h("label", { class: "cart-select-all" },
    h("input", { type: "checkbox", checked: usable.length > 0 && usable.every((item) => selected.has(item._id)), "aria-label": "Chọn tất cả mặt hàng còn bán" }),
    " Chọn tất cả mặt hàng còn bán");
  allToggle.querySelector("input").addEventListener("change", (event) => {
    selected = event.target.checked ? new Set(usable.map((item) => item._id)) : new Set();
    render();
  });
  const countShops = groups.size;
  const summary = h("aside", { class: "cart-summary" },
    h("h2", { text: "Tóm tắt đơn hàng" }),
    h("div", { class: "cart-total-line" }, h("span", { text: `Tiền hàng (${checkedIds.length} sản phẩm)` }), h("strong", { text: formatMoney(subtotal) })),
    h("p", { text: `Phí vận chuyển và giảm giá sẽ được máy chủ xác nhận ở bước đặt hàng. Giỏ có ${countShops} gian hàng nên sẽ tách thành tối đa ${countShops} đơn; phí vận chuyển tính riêng từng đơn.` }),
    h("a", { class: "btn btn--primary", href: checkedIds.length ? `./checkout.html?items=${encodeURIComponent(checkedIds.join(","))}` : "#", "aria-disabled": String(!checkedIds.length), onclick: (event) => { if (!checkedIds.length) event.preventDefault(); }, text: "Tiến hành thanh toán" }));
  main.replaceChildren(
    h("nav", { class: "breadcrumbs" }, h("a", { href: "./index.html", text: "Trang chủ" }), " / Giỏ hàng"),
    h("div", { class: "page-heading" }, h("div", {}, h("span", { class: "section-kicker", text: "MUA SẮM" }), h("h1", { text: "Giỏ hàng" }))),
    h("p", { class: "cart-notice", text: "Đơn hàng có sản phẩm từ nhiều gian hàng sẽ được tách thành từng đơn riêng. Phí vận chuyển được tính cho mỗi đơn." }),
    allToggle,
    h("div", { class: "cart-layout" },
      h("div", { class: "cart-groups" }, ...(sections.length ? sections : [h("div", { class: "empty-state" }, h("p", { text: "Giỏ hàng đang trống." }), h("a", { class: "btn btn--primary", href: "./products.html", text: "Tiếp tục mua sắm" }))])),
      summary));
}

async function loadCart(clearSelection = true) {
  try {
    cartData = await getCart();
    const validIds = new Set(cartData.items.map((item) => item._id));
    selected = new Set([...selected].filter((itemId) => validIds.has(itemId)));
    if (clearSelection || !selected.size) selected = new Set(cartData.items.filter((item) => item.available).map((item) => item._id));
    render();
  } catch (error) {
    main.replaceChildren(h("div", { class: "error-state", role: "alert" }, h("p", { text: error.message }),
      h("button", { class: "btn btn--primary", type: "button", onclick: () => loadCart() }, "Thử lại")));
  }
}

document.addEventListener("shopping:authorized", async (event) => {
  await mountShoppingChrome(event.detail?.user);
  await loadCart();
});
requireCustomerPage();
