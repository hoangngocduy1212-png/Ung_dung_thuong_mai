import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { catalogService } from '../../services/catalogService';
import { customerService } from '../../services/customerService';
import { useCart } from '../../app/providers/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import type { Product, ProductVariant, ProductReview } from '../../types/catalog';
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prodData = await catalogService.getProductById(id);
        setProduct(prodData);
        if (prodData.variants && prodData.variants.length > 0) {
          setSelectedVariant(prodData.variants[0]);
        }

        // Reviews
        try {
          const revData = await catalogService.getProductReviews(id);
          setReviews(revData.items || []);
        } catch {
          setReviews([]);
        }

        // Similar products in same category
        if (prodData.category?._id) {
          try {
            const simData = await catalogService.getProducts({
              category: prodData.category._id,
              limit: 4,
            });
            setSimilarProducts((simData.items || []).filter((p) => p._id !== id));
          } catch {
            setSimilarProducts([]);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Không thể tải thông tin sản phẩm.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (quantity > v.stock) {
      setQuantity(Math.max(1, v.stock));
    }
  };

  const handleQuantityChange = (delta: number) => {
    const maxStock = selectedVariant ? selectedVariant.stock : 999;
    const next = quantity + delta;
    if (next >= 1 && next <= maxStock) {
      setQuantity(next);
    }
  };

  const handleAddToCart = async (buyNow: boolean = false) => {
    if (!product || !selectedVariant) return;
    setIsAdding(true);
    setAddSuccessMessage(null);
    try {
      const ok = await addToCart(product._id, selectedVariant._id, quantity);
      if (ok) {
        if (buyNow) {
          navigate('/checkout');
        } else {
          setAddSuccessMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
          setTimeout(() => setAddSuccessMessage(null), 3500);
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || !isAuthenticated) {
      if (!isAuthenticated) navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await customerService.removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await customerService.addToWishlist(product._id);
        setIsWishlisted(true);
      }
    } catch {
      // Ignored
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-20">
        <Loading message="Đang tải chi tiết sản phẩm..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-20">
        <ErrorState message={error || 'Sản phẩm không tồn tại.'} onRetry={() => navigate('/products')} />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  ];

  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice || 0;
  const currentStock = selectedVariant ? selectedVariant.stock : product.totalStock || 0;

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-4 pb-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-1.5 font-mono">
        <Link to="/" className="hover:text-[#FF5C00] transition-colors">Trang chủ</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category._id}`} className="hover:text-[#FF5C00] transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-neutral-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Top Detail Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12 items-start">
        {/* Left: Gallery Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnail Strip */}
          <div className="flex sm:flex-col gap-2.5 sm:w-20 overflow-x-auto sm:overflow-x-visible flex-shrink-0" data-purpose="thumbnail-strip">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`rounded-lg overflow-hidden border p-1 bg-white cursor-pointer aspect-square w-16 sm:w-20 flex items-center justify-center transition ${
                  selectedImageIndex === idx
                    ? 'border-2 border-[#FF5C00] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="object-contain w-full h-full" />
              </div>
            ))}
          </div>

          {/* Main Featured Image with Crossfade */}
          <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center justify-center border border-neutral-200 min-h-[420px] max-h-[520px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4, scale: 1.01 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="max-w-full max-h-[440px] object-contain hover:scale-105 transition-transform duration-300"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Info & Purchasing Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-5">
          {/* Header Title & Actions */}
          <div className="flex justify-between items-start gap-4">
            <div>
              {product.brand && (
                <Link
                  to={`/products?brand=${product.brand._id}`}
                  className="text-xs font-mono font-bold uppercase text-[#FF5C00] hover:underline block mb-1"
                >
                  {product.brand.name}
                </Link>
              )}
              <h1 className="text-2xl font-bold text-neutral-950 leading-snug tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-shrink-0">
              <motion.button
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500 shadow-xs'
                    : 'border-neutral-200 text-neutral-500 hover:text-red-500 hover:border-red-200'
                }`}
                title="Yêu thích"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Rating & Sales Status */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500 text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-neutral-800 ml-1">
                {product.ratingAvg ? product.ratingAvg.toFixed(1) : '5.0'}
              </span>
              <span className="text-neutral-400">({reviews.length || product.ratingCount || 0} đánh giá)</span>
            </div>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-600 font-mono">Đã bán {product.soldCount || 0}+</span>
          </div>

          {/* Price Section */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#FF5C00] font-mono tracking-tight">
                {currentPrice.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-neutral-400 text-sm line-through font-mono">
                {Math.round(currentPrice * 1.15).toLocaleString('vi-VN')} ₫
              </span>
              <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2 py-0.5 rounded font-mono">
                -13%
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Giá đã bao gồm VAT & Miễn phí vận chuyển toàn quốc</p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Lựa chọn cấu hình / Biến thể
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {product.variants.length} tùy chọn
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?._id === v._id;
                  return (
                    <motion.button
                      key={v._id}
                      onClick={() => handleVariantSelect(v)}
                      whileHover={{ y: -1, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={`rounded-lg p-2.5 text-left transition cursor-pointer border select-none ${
                        isSelected
                          ? 'border-2 border-[#FF5C00] bg-orange-50/50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div className="text-[11.5px] font-bold text-neutral-900 leading-tight">
                        {v.name}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#FF5C00] mt-1">
                        {v.price.toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Tồn kho: {v.stock}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-800">Số lượng</span>
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                <motion.button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  whileTap={{ scale: 0.88 }}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-neutral-900 font-mono">
                  {quantity}
                </span>
                <motion.button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= currentStock}
                  whileTap={{ scale: 0.88 }}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentStock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <div className={`text-xs font-bold ${currentStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {currentStock > 0 ? 'Còn hàng' : 'Tạm hết hàng'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {currentStock > 0 ? `Sẵn sàng giao (${currentStock} cái)` : 'Liên hệ hỗ trợ'}
                </div>
              </div>
            </div>
          </div>

          {/* Success Message Banner */}
          <AnimatePresence>
            {addSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{addSuccessMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3.5 pt-3">
            <motion.button
              onClick={() => handleAddToCart(false)}
              disabled={isAdding || currentStock <= 0}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.975 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition cursor-pointer select-none"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
            </motion.button>

            <motion.button
              onClick={() => handleAddToCart(true)}
              disabled={isAdding || currentStock <= 0}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.975 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center bg-white border-2 border-[#FF5C00] text-[#FF5C00] hover:bg-orange-50 disabled:border-neutral-300 disabled:text-neutral-400 font-bold py-3.5 px-4 rounded-xl transition cursor-pointer select-none"
            >
              <span className="text-sm">Mua ngay</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-800 shadow-xs border border-neutral-200">
            <Truck className="w-5 h-5 text-[#FF5C00]" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900">Giao hàng toàn quốc</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Nhận hàng từ 1 - 3 ngày</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-800 shadow-xs border border-neutral-200">
            <ShieldCheck className="w-5 h-5 text-[#FF5C00]" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900">Bảo hành chính hãng</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Cam kết phần cứng 12 tháng</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-800 shadow-xs border border-neutral-200">
            <RotateCcw className="w-5 h-5 text-[#FF5C00]" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900">Đổi trả dễ dàng</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Miễn phí đổi trong 7 ngày</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-800 shadow-xs border border-neutral-200">
            <Headphones className="w-5 h-5 text-[#FF5C00]" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900">Hỗ trợ 24/7</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Tư vấn kỹ thuật tận tâm</p>
          </div>
        </div>
      </section>

      {/* Shop Info Card */}
      {product.shop && (
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 mb-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold text-xl">
              {product.shop.logo ? (
                <img src={product.shop.logo} alt={product.shop.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Store className="w-6 h-6 text-[#FF5C00]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">{product.shop.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Gian hàng chính hãng
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-lg">
                {product.shop.description || 'Chuyên phân phối thiết bị công nghệ chính hãng tiêu chuẩn cao.'}
              </p>
            </div>
          </div>

          <Link
            to={`/products?shop=${product.shop._id}`}
            className="px-4 py-2 rounded-lg border border-neutral-300 hover:border-[#FF5C00] text-neutral-800 hover:text-[#FF5C00] text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Xem gian hàng</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* Description & Reviews Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Description Section (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
            Mô tả sản phẩm
          </h2>
          <div className="prose prose-sm max-w-none text-neutral-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {product.description || 'Đang cập nhật nội dung mô tả chi tiết cho sản phẩm.'}
          </div>
        </section>

        {/* Customer Reviews (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-base font-bold text-neutral-900">
              Đánh giá từ khách hàng ({reviews.length})
            </h2>
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-neutral-900">{product.ratingAvg ? product.ratingAvg.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">
              Chưa có đánh giá nào cho sản phẩm này. Khách hàng đã mua hàng có thể để lại nhận xét trong trang Lịch sử đơn hàng.
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">
                      {rev.customer?.fullName || 'Khách hàng'}
                    </span>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  {rev.variantName && (
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      Phân loại: {rev.variantName}
                    </span>
                  )}
                  <p className="text-neutral-700 leading-relaxed">{rev.content}</p>
                  {rev.reply && (
                    <div className="mt-2 p-2.5 rounded bg-white border border-neutral-200 text-[11px] text-neutral-600">
                      <span className="font-bold text-[#FF5C00] block mb-0.5">Phản hồi từ người bán:</span>
                      {rev.reply.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
            <h2 className="text-base font-bold text-neutral-900">Sản phẩm tương tự</h2>
            <Link
              to={`/products?category=${product.category?._id}`}
              className="text-xs text-[#FF5C00] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarProducts.map((sp) => (
              <div
                key={sp._id}
                onClick={() => navigate(`/products/${sp._id}`)}
                className="group cursor-pointer flex flex-col p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all"
              >
                <div className="w-full aspect-square rounded-lg bg-neutral-50 flex items-center justify-center p-2 mb-2 overflow-hidden">
                  <img
                    src={sp.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80'}
                    alt={sp.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-xs font-semibold text-neutral-900 line-clamp-1 group-hover:text-[#FF5C00] transition-colors">
                  {sp.name}
                </h3>
                <div className="flex text-amber-500 text-[10px] my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#FF5C00] font-mono mt-auto">
                  {sp.minPrice ? sp.minPrice.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
