const moneyFormatter = new Intl.NumberFormat("vi-VN");

export const formatMoney = (value) => `${moneyFormatter.format(Math.round(Number(value) || 0))}đ`;

export function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN");
}

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Tạo phần tử DOM an toàn (chỉ dùng textContent). */
export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value == null) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function debounce(fn, wait = 300) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef4fa"/><rect x="140" y="95" width="120" height="85" rx="10" fill="none" stroke="#9db8d6" stroke-width="8"/><path d="M110 205h180l-14 18H124z" fill="#9db8d6"/></svg>'
  );

/** Gắn ảnh có lazy-loading và ảnh dự phòng khi lỗi. */
export function makeImage(src, alt) {
  const img = h("img", { alt: alt || "", loading: "lazy", decoding: "async" });
  img.addEventListener("error", () => {
    img.onerror = null;
    img.src = PLACEHOLDER_IMAGE;
  }, { once: true });
  img.src = src || PLACEHOLDER_IMAGE;
  return img;
}
