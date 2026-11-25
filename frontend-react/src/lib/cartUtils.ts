/**
 * Normalised Cart Item representation that safely unifies both:
 * 1. Authenticated customer cartView item format from Backend:
 *    { _id, product: "id", variant: "id", productName, variantName, price, quantity, image, shop: { _id, name }, lineTotal }
 * 2. Nested/Guest item format:
 *    { _id, product: { _id, name, images, shop, minPrice }, variant: { _id, name, price }, quantity }
 */

export interface NormalizedCartItem {
  _id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  lineTotal: number;
  image: string;
  shopId: string;
  shopName: string;
  raw: any;
}

export function normalizeCartItem(item: any): NormalizedCartItem {
  if (!item) {
    return {
      _id: '',
      productId: '',
      variantId: '',
      productName: 'Sản phẩm TECHSTORE',
      variantName: '',
      price: 0,
      quantity: 1,
      lineTotal: 0,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
      shopId: 'default_shop',
      shopName: 'Cửa hàng TECHSTORE',
      raw: item,
    };
  }

  // ID extraction
  const _id = String(item._id || '');
  const productId = String(
    item.product?._id || (typeof item.product === 'string' ? item.product : '')
  );
  const variantId = String(
    item.variant?._id || (typeof item.variant === 'string' ? item.variant : '')
  );

  // Price extraction: prefer top-level price, then variant.price, then product.minPrice
  let price = 0;
  if (typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0) {
    price = item.price;
  } else if (typeof item.variant?.price === 'number' && !isNaN(item.variant.price) && item.variant.price >= 0) {
    price = item.variant.price;
  } else if (typeof item.product?.minPrice === 'number' && !isNaN(item.product.minPrice) && item.product.minPrice >= 0) {
    price = item.product.minPrice;
  }

  // Quantity extraction
  const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

  // Line total: prefer item.lineTotal, otherwise calculate
  let lineTotal = price * quantity;
  if (typeof item.lineTotal === 'number' && !isNaN(item.lineTotal) && item.lineTotal >= 0) {
    lineTotal = item.lineTotal;
  }

  // Name extraction
  const productName =
    item.productName ||
    item.product?.name ||
    item.name ||
    'Sản phẩm TECHSTORE';

  const variantName =
    item.variantName ||
    item.variant?.name ||
    '';

  // Image extraction
  const image =
    item.image ||
    item.product?.images?.[0] ||
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80';

  // Shop extraction
  let shopId = 'default_shop';
  let shopName = 'Cửa hàng TECHSTORE';

  if (item.shop && typeof item.shop === 'object') {
    if (item.shop._id) shopId = String(item.shop._id);
    if (item.shop.name) shopName = String(item.shop.name);
  } else if (item.product?.shop && typeof item.product.shop === 'object') {
    if (item.product.shop._id) shopId = String(item.product.shop._id);
    if (item.product.shop.name) shopName = String(item.product.shop.name);
  } else if (typeof item.product?.shop === 'string') {
    shopId = item.product.shop;
  }

  return {
    _id,
    productId,
    variantId,
    productName,
    variantName,
    price,
    quantity,
    lineTotal,
    image,
    shopId,
    shopName,
    raw: item,
  };
}

export function formatPriceVND(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0 ₫';
  return val.toLocaleString('vi-VN') + ' ₫';
}
