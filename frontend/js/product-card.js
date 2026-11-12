import { formatMoney, h, makeImage } from "./utils.js";

export function productCard(product, {
  favorite = false,
  showActions = true,
  onFavorite,
  onAdd,
} = {}) {
  const stock = Number(product.totalStock ?? 0);
  const out = stock <= 0;
  const multi = Number(product.variantCount ?? 0) > 1;
  const fav = showActions && onFavorite
    ? h("button", {
        class: `favorite${favorite ? " is-favorite" : ""}`,
        type: "button",
        "aria-label": favorite ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`,
        "aria-pressed": String(favorite),
        "data-id": product._id,
        onclick: (event) => onFavorite(product, event.currentTarget),
      }, favorite ? "♥" : "♡")
    : null;
  const add = showActions && onAdd
    ? h("button", {
        class: "add-cart",
        type: "button",
        disabled: out,
        onclick: (event) => onAdd(product, event.currentTarget),
      }, out ? "Hết hàng" : multi ? "Chọn phân loại" : "Thêm vào giỏ")
    : null;
  const imageLink = h("a", { href: `./product.html?id=${encodeURIComponent(product._id)}`, "aria-label": `Xem ${product.name}` }, makeImage(product.images?.[0], product.name));
  const title = h("a", { href: `./product.html?id=${encodeURIComponent(product._id)}`, text: product.name });
  return h("article", { class: "product-card" },
    h("div", { class: "product-card__image" }, imageLink, fav),
    h("div", { class: "product-card__body" },
      h("span", { class: "product-brand", text: (product.brand?.name || "").toUpperCase() }),
      h("h3", { title: product.name }, title),
      h("a", { class: "product-store", href: `./products.html?shop=${encodeURIComponent(product.shop?._id || "")}`, text: product.shop?.name ? `Bán bởi ${product.shop.name}` : "" }),
      Number(product.ratingCount) > 0
        ? h("div", { class: "product-rating", "aria-label": `${Number(product.ratingAvg || 0).toFixed(1)} trên 5 sao` }, "★".repeat(Math.round(product.ratingAvg || 0)) + "☆".repeat(5 - Math.round(product.ratingAvg || 0)), h("small", { text: `(${product.ratingCount})` }))
        : h("div", { class: "product-rating product-rating--none", text: "Chưa có đánh giá" }),
      h("div", { class: `product-stock${out ? " product-stock--out" : stock <= 5 ? " product-stock--low" : ""}` },
        h("span", { "aria-hidden": "true" }), out ? "Hết hàng" : `Còn ${stock} sản phẩm`),
      h("div", { class: "product-price" }, h("small", { text: "Từ" }), h("strong", { text: formatMoney(product.minPrice) })),
      add));
}
