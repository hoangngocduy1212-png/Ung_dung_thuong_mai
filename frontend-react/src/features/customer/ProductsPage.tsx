import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { staggerContainerVariants, staggerItemVariants, ShimmerSkeleton, AddToCartFeedback } from '../../lib/motion';
import { catalogService } from '../../services/catalogService';
import { useCart } from '../../app/providers/CartProvider';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductImage } from '../../components/common/ProductImage';
import type { Product, Category, Brand } from '../../types/catalog';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  X,
  Filter,
} from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: undefined, max: undefined },
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: undefined },
];

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  // Filters from URL
  const q = searchParams.get('q') || '';
  const rawCategory = searchParams.get('category') || '';
  const brandId = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  // Ánh xạ slug hoặc tên danh mục sang ObjectId hợp lệ theo danh mục thực tế từ DB
  const resolvedCategoryId = useMemo(() => {
    if (!rawCategory) return '';
    if (/^[a-f\d]{24}$/i.test(rawCategory)) return rawCategory;

    const norm = (s: string) =>
      (s || '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

    const target = norm(rawCategory);
    const aliasMap: Record<string, string> = {
      phone: 'dienthoai',
      laptop: 'laptop',
      tablet: 'maytinhbang',
      audio: 'amthanh',
      wearable: 'thietbideo',
      accessories: 'phukien',
      pc: 'linhkienpc',
      desktop: 'maytinhban',
    };
    const mapped = aliasMap[target] || target;

    const match = categories.find((c) => {
      const n = norm(c.name);
      return n === target || n === mapped || n.includes(target) || target.includes(n);
    });

    return match ? match._id : rawCategory;
  }, [rawCategory, categories]);

  // Load Categories & Brands once
  useEffect(() => {
    Promise.allSettled([catalogService.getCategories(), catalogService.getBrands()]).then(
      ([catRes, brandRes]) => {
        if (catRes.status === 'fulfilled') {
          setCategories(Array.isArray(catRes.value) ? catRes.value : []);
        }
        if (brandRes.status === 'fulfilled') {
          setBrands(Array.isArray(brandRes.value) ? brandRes.value : []);
        }
      }
    );
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        limit,
        sort,
      };
      if (q) params.q = q;
      if (resolvedCategoryId) params.category = resolvedCategoryId;
      if (brandId) params.brand = brandId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await catalogService.getProducts(params);
      setProducts(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách sản phẩm từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, [q, resolvedCategoryId, brandId, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const params: Record<string, string | number | undefined> = {
      page,
      limit,
      sort,
    };
    if (q) params.q = q;
    if (resolvedCategoryId) params.category = resolvedCategoryId;
    if (brandId) params.brand = brandId;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    catalogService.getProducts(params)
      .then((data) => {
        if (!isCancelled) {
          setProducts(data?.items || []);
          setTotal(data?.total || 0);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          setError(err?.message || 'Không thể tải danh sách sản phẩm từ máy chủ.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [q, resolvedCategoryId, brandId, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const updateParam = (key: string, val: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (val === undefined || val === '') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    // Only reset page to 1 when changing filters or sorting, NOT when navigating pages
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handlePriceSelect = (min?: number, max?: number) => {
    const next = new URLSearchParams(searchParams);
    if (min !== undefined) next.set('minPrice', String(min));
    else next.delete('minPrice');
    if (max !== undefined) next.set('maxPrice', String(max));
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    try {
      setAddingId(product._id);
      // Fetch details to get first variant ID
      const detail = await catalogService.getProductById(product._id);
      const firstVariant = detail.variants?.[0];
      if (firstVariant) {
        const ok = await addToCart(product._id, firstVariant._id, 1);
        if (ok) {
          setShowAddedFeedback(true);
          setTimeout(() => setShowAddedFeedback(false), 2200);
        }
      }
    } catch {
      // Ignored
    } finally {
      setAddingId(null);
    }
  };

  const formatPrice = (price?: number) => {
    if (typeof price !== 'number') return 'Liên hệ';
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const currentCategory = categories.find((c) => c._id === resolvedCategoryId);

  return (
    <div className="max-w-[1366px] mx-auto px-4 lg:px-6 py-4 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4 font-mono">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-neutral-900 transition-colors">Sản phẩm</Link>
        {currentCategory && (
          <>
            <span>/</span>
            <span className="font-semibold text-neutral-900">{currentCategory.name}</span>
          </>
        )}
      </nav>

      {/* Category Hero Banner */}
      <section className="relative bg-neutral-100 rounded-2xl overflow-hidden mb-8 border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-[170px] p-6 md:p-8">
          <div className="md:col-span-8 z-10 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {currentCategory ? currentCategory.name : q ? `Kết quả tìm kiếm cho "${q}"` : 'Kho Thiết Bị Công Nghệ'}
            </h1>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed max-w-xl">
              Hiệu năng mạnh mẽ, thiết kế hiện đại, phù hợp cho học tập, làm việc và giải trí. Khám phá các dòng sản phẩm từ thương hiệu uy tín với chế độ bảo hành 12 tháng chính hãng.
            </p>
          </div>
          <div className="md:col-span-4 flex items-center justify-end font-mono text-xs text-neutral-400">
            <span>Tổng cộng {total} thiết bị sẵn có</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6 select-none bg-white p-5 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Filter className="w-4 h-4 text-[#FF5C00]" />
              <span>Bộ lọc tìm kiếm</span>
            </div>
            {(rawCategory || brandId || minPrice || maxPrice || q) && (
              <button
                onClick={handleClearAll}
                className="text-xs text-[#FF5C00] hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Filter: Danh mục */}
          <div className="border-b border-neutral-200 pb-5">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Danh mục
            </h3>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => updateParam('category', undefined)}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  !resolvedCategoryId ? 'bg-neutral-100 font-bold text-[#FF5C00]' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>Tất cả danh mục</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParam('category', c._id)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    resolvedCategoryId === c._id
                      ? 'bg-neutral-100 font-bold text-[#FF5C00]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Thương hiệu */}
          <div className="border-b border-neutral-200 pb-5">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Thương hiệu
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
              {brands.map((b) => (
                <label
                  key={b._id}
                  className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="brand"
                      checked={brandId === b._id}
                      onChange={() => updateParam('brand', brandId === b._id ? undefined : b._id)}
                      className="w-3.5 h-3.5 text-[#FF5C00] focus:ring-0 border-neutral-300"
                    />
                    <span>{b.name}</span>
                  </span>
                </label>
              ))}
              {brandId && (
                <button
                  onClick={() => updateParam('brand', undefined)}
                  className="text-[11px] text-[#FF5C00] hover:underline pt-1 block"
                >
                  Bỏ chọn thương hiệu
                </button>
              )}
            </div>
          </div>

          {/* Filter: Khoảng giá */}
          <div className="pb-2">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Khoảng giá
            </h3>
            <div className="space-y-2 text-xs">
              {PRICE_RANGES.map((r, i) => {
                const isSelected =
                  String(r.min ?? '') === minPrice && String(r.max ?? '') === maxPrice;
                return (
                  <label
                    key={i}
                    onClick={() => handlePriceSelect(r.min, r.max)}
                    className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 text-[#FF5C00] focus:ring-0 border-neutral-300"
                      />
                      <span>{r.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Products Container */}
        <section className="lg:col-span-9" data-purpose="product-list-container">
          {/* Sorting Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-xl border border-neutral-200 select-none text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 mr-1 text-sm">Sắp xếp theo:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'newest', label: 'Mới nhất' },
                  { id: 'popular', label: 'Bán chạy' },
                  { id: 'price_asc', label: 'Giá thấp đến cao' },
                  { id: 'price_desc', label: 'Giá cao đến thấp' },
                  { id: 'rating', label: 'Đánh giá cao' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateParam('sort', s.id)}
                    className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      sort === s.id
                        ? 'bg-[#FF5C00] text-white shadow-xs font-semibold'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-neutral-500 font-mono text-[11px]">
              Hiển thị {products.length} / {total} sản phẩm
            </span>
          </div>

          {/* Loading / Error / Empty / Grid States */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
              {[...Array(8)].map((_, i) => (
                <ShimmerSkeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm nào"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn một số tiêu chí lọc."
              onAction={handleClearAll}
              actionText="Xóa bộ lọc"
            />
          ) : (
            <>
              {/* Product Grid: 4 columns with Staggered Motion */}
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                data-purpose="product-grid"
              >
                {products.map((p) => (
                  <motion.article
                    key={p._id}
                    variants={staggerItemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-lg hover:border-neutral-300 transition-all duration-200 relative group cursor-pointer select-none"
                  >
                    <div className="w-full aspect-square flex items-center justify-center p-2 mb-3 bg-neutral-50 rounded-lg overflow-hidden">
                      <ProductImage
                        src={p.images}
                        alt={p.name}
                        category={p.category?.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 ease-out"
                      />
                    </div>

                    <div>
                      {p.brand && (
                        <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 mb-0.5 block">
                          {p.brand.name}
                        </span>
                      )}
                      <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2 min-h-[32px] group-hover:text-[#FF5C00] transition-colors mb-1">
                        {p.name}
                      </h4>
                      <div className="text-[#FF5C00] font-bold text-sm mb-1.5 font-mono">
                        {formatPrice(p.minPrice)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1">
                          <div className="flex text-amber-500 text-[10px]">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                          <span className="text-neutral-600 font-medium">
                            {p.ratingAvg ? p.ratingAvg.toFixed(1) : '5.0'}
                          </span>
                        </div>
                        <span>Đã bán {p.soldCount || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, p)}
                      disabled={addingId === p._id}
                      className="mt-3 w-full py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-[#FF5C00] hover:text-white text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{addingId === p._id ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
                    </button>
                  </motion.article>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-12 select-none" data-purpose="pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pNum = i + 1;
                    if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                      return (
                        <button
                          key={pNum}
                          onClick={() => updateParam('page', String(pNum))}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                            page === pNum
                              ? 'bg-[#FF5C00] text-white shadow-xs'
                              : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    }
                    if (pNum === page - 3 || pNum === page + 3) {
                      return (
                        <span key={pNum} className="px-1 text-neutral-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Floating Add-to-cart confirmation toast */}
      <AddToCartFeedback isVisible={showAddedFeedback} />
    </div>
  );
};
