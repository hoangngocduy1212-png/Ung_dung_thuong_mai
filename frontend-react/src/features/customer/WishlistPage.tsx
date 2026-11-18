import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { customerService } from '../../services/customerService';
import { useCart } from '../../app/providers/CartProvider';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { listItemVariants } from '../../lib/motion';
import type { Product } from '../../types/catalog';
import { Trash2, ShoppingCart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await customerService.getWishlist();
      setProducts(res.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await customerService.removeFromWishlist(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích.');
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      // Need a variant ID
      const firstVariantId = (product as any).variants?.[0]?._id;
      if (firstVariantId) {
        await addToCart(product._id, firstVariantId, 1);
      } else {
        navigate(`/products/${product._id}`);
      }
    } catch {
      navigate(`/products/${product._id}`);
    }
  };

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return 'Liên hệ';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Sản phẩm yêu thích ({products.length})
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Lưu trữ các thiết bị công nghệ bạn quan tâm để dễ dàng theo dõi giá và đặt hàng
        </p>
      </div>

      {loading ? (
        <div className="py-16">
          <Loading message="Đang tải danh sách yêu thích..." />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm yêu thích nào"
          description="Khám phá các thiết bị công nghệ hấp dẫn và nhấn vào biểu tượng trái tim để lưu lại."
          actionText="Khám phá ngay"
          onAction={() => navigate('/products')}
        />
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {products.map((p) => (
              <motion.div
                key={p._id}
                layout
                variants={listItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-neutral-300 hover:shadow-md transition-shadow relative group"
              >
                <button
                  onClick={() => handleRemove(p._id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors z-10 cursor-pointer shadow-xs active:scale-90"
                  title="Xóa khỏi yêu thích"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div
                  onClick={() => navigate(`/products/${p._id}`)}
                  className="w-full aspect-square rounded-lg bg-neutral-50 flex items-center justify-center p-2 mb-3 overflow-hidden cursor-pointer"
                >
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80'}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div>
                  <Link
                    to={`/products/${p._id}`}
                    className="text-xs font-bold text-neutral-900 line-clamp-2 min-h-[32px] hover:text-[#FF5C00] transition-colors block leading-snug"
                  >
                    {p.name}
                  </Link>
                  <div className="text-sm font-bold text-[#FF5C00] font-mono mt-1 mb-1.5">
                    {formatPrice(p.minPrice)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(p)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.97]"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Xem & Đặt mua</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
