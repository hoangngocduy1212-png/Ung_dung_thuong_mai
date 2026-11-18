import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import type { Category, Product } from '../../types/catalog';
import {
  ArrowRight,
  Star,
  Laptop,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
  Keyboard,
  Cpu,
  Home as HomeIcon,
  Sparkles,
  Flame,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-7 h-7 text-neutral-800" />,
  'điện thoại': <Smartphone className="w-7 h-7 text-neutral-800" />,
  'máy tính bảng': <Tablet className="w-7 h-7 text-neutral-800" />,
  'âm thanh': <Headphones className="w-7 h-7 text-neutral-800" />,
  'thiết bị đeo': <Watch className="w-7 h-7 text-neutral-800" />,
  'phụ kiện': <Keyboard className="w-7 h-7 text-neutral-800" />,
  'thiết bị thông minh': <Cpu className="w-7 h-7 text-neutral-800" />,
  'nhà thông minh': <HomeIcon className="w-7 h-7 text-neutral-800" />,
};

const DEFAULT_CATEGORIES = [
  { name: 'Laptop', slug: 'laptop', icon: <Laptop className="w-7 h-7 text-neutral-700" /> },
  { name: 'Điện thoại', slug: 'phone', icon: <Smartphone className="w-7 h-7 text-neutral-700" /> },
  { name: 'Máy tính bảng', slug: 'tablet', icon: <Tablet className="w-7 h-7 text-neutral-700" /> },
  { name: 'Âm thanh', slug: 'audio', icon: <Headphones className="w-7 h-7 text-neutral-700" /> },
  { name: 'Thiết bị đeo', slug: 'wearable', icon: <Watch className="w-7 h-7 text-neutral-700" /> },
  { name: 'Phụ kiện', slug: 'accessories', icon: <Keyboard className="w-7 h-7 text-neutral-700" /> },
  { name: 'Thiết bị thông minh', slug: 'smart-device', icon: <Cpu className="w-7 h-7 text-neutral-700" /> },
  { name: 'Nhà thông minh', slug: 'smart-home', icon: <HomeIcon className="w-7 h-7 text-neutral-700" /> },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, bestRes, newRes] = await Promise.allSettled([
          catalogService.getCategories(),
          catalogService.getProducts({ sort: 'popular', limit: 4 }),
          catalogService.getProducts({ sort: 'newest', limit: 4 }),
        ]);

        if (catsRes.status === 'fulfilled') {
          setCategories(Array.isArray(catsRes.value) ? catsRes.value : []);
        }
        if (bestRes.status === 'fulfilled') {
          setBestsellers(bestRes.value.items || []);
        }
        if (newRes.status === 'fulfilled') {
          setNewArrivals(newRes.value.items || []);
        }
      } catch {
        // Fallback to empty
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price?: number) => {
    if (typeof price !== 'number') return 'Liên hệ';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-6 pt-4 pb-16 space-y-10">
      {/* 1. HERO SECTION BANNER */}
      <section className="relative w-full rounded-2xl overflow-hidden shadow-sm" data-purpose="hero-banner">
        <div className="relative w-full min-h-[340px] md:min-h-[380px] bg-gradient-to-r from-[#0C0D0F] via-[#16171B] to-[#121316] flex items-center px-8 sm:px-14 py-10">
          {/* Left Typography & CTA */}
          <div className="max-w-md z-10 text-white space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono font-medium text-[#FF5C00]">
              <Sparkles className="w-3 h-3" />
              <span>MONOLITH HARDWARE 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.15] tracking-tight">
              Công nghệ<br />kiến tạo tương lai
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base font-normal leading-relaxed">
              Khám phá thiết bị phù hợp, nâng tầm trải nghiệm công việc và giải trí mỗi ngày.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#FF5C00] hover:bg-[#E55200] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white text-sm font-medium transition-colors"
              >
                <span>Xem danh mục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Hardware Visual Composite */}
          <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none flex items-center justify-end pr-8 overflow-hidden opacity-40 md:opacity-100">
            <div className="relative w-full h-full flex items-center justify-end">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80"
                alt="High-Tech Laptop"
                className="w-[50%] max-w-[380px] object-cover rounded-xl shadow-2xl drop-shadow-[0_20px_25px_rgba(255,92,0,0.15)] translate-y-3 z-10 border border-neutral-700/50"
              />
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                alt="Headphones"
                className="w-[30%] max-w-[210px] object-cover rounded-xl shadow-2xl z-20 -ml-10 filter brightness-95 border border-neutral-700/50"
              />
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute top-6 right-8 text-right font-mono text-[10px] tracking-widest text-neutral-500 uppercase leading-relaxed pointer-events-none select-none hidden lg:block">
            ENGINEERING<br />PERFORMANCE<br />PRECISION
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section data-purpose="featured-categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-neutral-900 tracking-tight">Danh mục nổi bật</h2>
            <span className="text-xs text-neutral-400 font-mono">({categories.length || DEFAULT_CATEGORIES.length})</span>
          </div>
          <Link
            to="/categories"
            className="text-xs font-medium text-neutral-600 hover:text-[#FF5C00] flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.length > 0
            ? categories.slice(0, 8).map((cat) => {
                const lower = cat.name.toLowerCase();
                const icon = CATEGORY_ICONS[lower] || <Cpu className="w-7 h-7 text-neutral-700" />;
                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className="bg-[#F8F9FA] hover:bg-[#F0F2F5] transition-all duration-200 rounded-xl p-3.5 flex flex-col items-center justify-center group border border-transparent hover:border-neutral-200 hover:-translate-y-0.5 text-center min-h-[105px]"
                  >
                    <div className="h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 text-[#FF5C00]">
                      {icon}
                    </div>
                    <span className="text-xs text-neutral-800 font-medium group-hover:text-[#FF5C00] line-clamp-1">
                      {cat.name}
                    </span>
                  </Link>
                );
              })
            : DEFAULT_CATEGORIES.map((item, idx) => (
                <Link
                  key={idx}
                  to={`/products?category=${item.slug}`}
                  className="bg-[#F8F9FA] hover:bg-[#F0F2F5] transition-all duration-200 rounded-xl p-3.5 flex flex-col items-center justify-center group border border-transparent hover:border-neutral-200 hover:-translate-y-0.5 text-center min-h-[105px]"
                >
                  <div className="h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 text-[#FF5C00]">
                    {item.icon}
                  </div>
                  <span className="text-xs text-neutral-800 font-medium group-hover:text-[#FF5C00] line-clamp-1">
                    {item.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* 3. DUAL PRODUCT COLUMNS: BESTSELLERS & NEW ARRIVALS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-purpose="bestseller-and-new-arrivals">
        {/* Left: Sản phẩm bán chạy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF5C00]" />
              <h2 className="text-[17px] font-bold text-neutral-900 tracking-tight">Sản phẩm bán chạy</h2>
            </div>
            <Link
              to="/products?sort=popular"
              className="text-xs font-medium text-neutral-500 hover:text-[#FF5C00] flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bestsellers.length > 0 ? (
              bestsellers.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => navigate(`/products/${prod._id}`)}
                  className="bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-xl p-3 flex flex-col items-center text-center group cursor-pointer border border-transparent hover:border-neutral-200 transition-all hover:-translate-y-0.5"
                >
                  <div className="h-24 w-full flex items-center justify-center mb-2 overflow-hidden rounded-lg bg-white p-2">
                    <img
                      src={
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={prod.name}
                      className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-[12px] font-medium text-neutral-900 line-clamp-2 mb-1 min-h-[32px] group-hover:text-[#FF5C00]">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-center text-[#FF5C00] text-[10px] space-x-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                    <span className="text-neutral-400 text-[10px] ml-1">({prod.soldCount || 0})</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-900 mt-auto font-mono">
                    {formatPrice(prod.minPrice)}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-4 py-8 text-center text-xs text-neutral-400">
                Đang tải dữ liệu sản phẩm bán chạy...
              </div>
            )}
          </div>
        </div>

        {/* Right: Sản phẩm mới */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-800" />
              <h2 className="text-[17px] font-bold text-neutral-900 tracking-tight">Sản phẩm mới</h2>
            </div>
            <Link
              to="/products?sort=newest"
              className="text-xs font-medium text-neutral-500 hover:text-[#FF5C00] flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {newArrivals.length > 0 ? (
              newArrivals.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => navigate(`/products/${prod._id}`)}
                  className="bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-xl p-3 flex flex-col items-center text-center group cursor-pointer border border-transparent hover:border-neutral-200 transition-all hover:-translate-y-0.5"
                >
                  <div className="h-24 w-full flex items-center justify-center mb-2 overflow-hidden rounded-lg bg-white p-2">
                    <img
                      src={
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={prod.name}
                      className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-[12px] font-medium text-neutral-900 line-clamp-2 mb-1 min-h-[32px] group-hover:text-[#FF5C00]">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-center text-[#FF5C00] text-[10px] space-x-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                    <span className="text-neutral-400 text-[10px] ml-1">({prod.soldCount || 0})</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-900 mt-auto font-mono">
                    {formatPrice(prod.minPrice)}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-4 py-8 text-center text-xs text-neutral-400">
                Đang tải dữ liệu sản phẩm mới...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
