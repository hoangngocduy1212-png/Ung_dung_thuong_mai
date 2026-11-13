import { h } from "./utils.js";

let toastTimer;
let undoToastTimer;

export function showToast(message, { error = false } = {}) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = h("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("is-error", error);
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

export const comingSoon = () => showToast("Tính năng đang phát triển");

export function showUndoToast(message, onUndo) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = h("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.append(toast);
  }
  const undo = h("button", { class: "text-button", type: "button", text: "Hoàn tác" });
  undo.addEventListener("click", async () => {
    undo.disabled = true;
    try { await onUndo(); toast.classList.remove("is-visible"); }
    catch (error) { showToast(error.message, { error: true }); }
  });
  toast.replaceChildren(h("span", { text: `${message} ` }), undo);
  toast.classList.remove("is-error");
  toast.classList.add("is-visible");
  clearTimeout(undoToastTimer);
  undoToastTimer = setTimeout(() => toast.classList.remove("is-visible"), 6000);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modal có role="dialog", khóa focus, đóng bằng Esc / nền / nút. */
export function openModal({ title, description, content, actions = [], onClose }) {
  const previouslyFocused = document.activeElement;
  const titleId = `modal-title-${Date.now()}`;
  const dialog = h("div", { class: "modal__dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabindex: "-1" },
    h("button", { class: "modal__close", type: "button", "aria-label": "Đóng" }, "×"),
    h("h2", { id: titleId, class: "modal__title", text: title }),
    description ? h("p", { class: "modal__desc", text: description }) : null,
    content || null,
    actions.length ? h("div", { class: "modal__actions" }, actions) : null,
  );
  const overlay = h("div", { class: "modal" }, dialog);
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    document.body.classList.remove("has-modal");
    if (previouslyFocused?.focus) previouslyFocused.focus();
    onClose?.();
  };
  function onKey(event) {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "Tab") {
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  overlay.addEventListener("mousedown", (event) => { if (event.target === overlay) close(); });
  dialog.querySelector(".modal__close").addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  document.body.classList.add("has-modal");
  (dialog.querySelector("[data-autofocus]") || dialog.querySelector(FOCUSABLE) || dialog).focus();
  return close;
}

/** Gợi ý đăng nhập cho khách vãng lai. */
export function openLoginPrompt(reason = "thực hiện thao tác này") {
  return openModal({
    title: "Đăng nhập để tiếp tục",
    description: `Bạn cần đăng nhập tài khoản khách hàng để ${reason}.`,
    actions: [
      h("a", { class: "btn btn--primary", href: "./auth.html?tab=login", "data-autofocus": "" }, "Đăng nhập"),
      h("a", { class: "btn btn--ghost", href: "./auth.html?tab=register" }, "Tạo tài khoản"),
    ],
  });
}
