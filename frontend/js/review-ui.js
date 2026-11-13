import { h } from "./utils.js";
import { openModal, showToast } from "./ui.js";
import { submitReview } from "./review-service.js";

export function openReviewForm(order, item, onSubmitted) {
  const ratingGroup = h("fieldset", { class: "review-rating-options" },
    h("legend", {}, "Số sao"),
    ...[5, 4, 3, 2, 1].map((rating, index) => {
      const input = h("input", { type: "radio", name: "rating", value: String(rating), checked: index === 0, required: true });
      return h("label", {}, input, h("span", { "aria-hidden": "true", text: `${"★".repeat(rating)}${"☆".repeat(5 - rating)}` }), h("span", { class: "sr-only", text: `${rating} sao` }));
    }));
  const content = h("textarea", { name: "content", maxlength: "1000", rows: "4", placeholder: "Chia sẻ trải nghiệm của bạn", "aria-label": "Nội dung đánh giá" });
  const error = h("p", { class: "form-error", role: "alert", "aria-live": "assertive" });
  const submit = h("button", { class: "btn btn--primary", type: "button", text: "Gửi đánh giá" });
  const close = openModal({
    title: "Đánh giá sản phẩm",
    description: `${item.productName || "Sản phẩm"} · ${item.variantName || ""} · Đơn ${order.code || ""}`,
    content: h("div", { class: "review-form" }, ratingGroup,
      h("label", { class: "account-field" }, "Nội dung đánh giá", content),
      h("p", { class: "voucher-hint", text: "Ảnh minh chứng chưa được API đánh giá hỗ trợ." }), error),
    actions: [submit],
  });
  submit.addEventListener("click", async () => {
    const rating = Number(ratingGroup.querySelector('input[name="rating"]:checked')?.value);
    if (!rating) { error.textContent = "Vui lòng chọn số sao."; return; }
    submit.disabled = true;
    try {
      await submitReview({ orderId: String(order._id), productId: String(item.product), rating, content: content.value.trim() });
      close();
      showToast("Đã gửi đánh giá");
      await onSubmitted?.();
    } catch (requestError) {
      error.textContent = requestError.message;
      submit.disabled = false;
    }
  });
  return close;
}
