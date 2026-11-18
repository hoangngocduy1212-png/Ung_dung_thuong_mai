import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { Category } from '../../types/catalog';
import {
  Layers,
  ChevronRight,
  Laptop,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
  Keyboard,
  Cpu,
  Home as HomeIcon,
  HardDrive,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-8 h-8 text-[#FF5C00]" />,
  'điện thoại': <Smartphone className="w-8 h-8 text-[#FF5C00]" />,
  'máy tính bảng': <Tablet className="w-8 h-8 text-[#FF5C00]" />,
  'âm thanh': <Headphones className="w-8 h-8 text-[#FF5C00]" />,
  'thiết bị đeo': <Watch className="w-8 h-8 text-[#FF5C00]" />,
  'phụ kiện': <Keyboard className="w-8 h-8 text-[#FF5C00]" />,
  'thiết bị thông minh': <Cpu className="w-8 h-8 text-[#FF5C00]" />,
  'nhà thông minh': <HomeIcon className="w-8 h-8 text-[#FF5C00]" />,
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh mục từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-16">
        <Loading message="Đang tải danh mục sản phẩm từ TECHSTORE..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-16">
        <ErrorState message={error} onRetry={fetchCategories} />
      </div>
    );
  }

  // Parent categories (no parent or parent is null)
  const parents = categories.filter((c) => !c.parent);
  const childrenMap = new Map<string, Category[]>();
  for (const c of categories) {
    if (c.parent) {
      const pId = String(c.parent);
      const list = childrenMap.get(pId) || [];
      list.push(c);
      childrenMap.set(pId, list);
    }
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-6 pb-20 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Tất cả danh mục</span>
      </nav>

      {/* Header Banner */}
      <div className="relative rounded-2xl bg-neutral-900 text-white p-8 md:p-10 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF5C00]/20 text-[#FF5C00] text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HỆ THỐNG DANH MỤC THIẾT BỊ CÔNG NGHỆ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Khám Phá Toàn Bộ Danh Mục
          </h1>
          <p className="text-neutral-300 text-sm leading-relaxed">
            Tìm kiếm thiết bị phù hợp từ hơn 8 nhóm ngành hàng phần cứng chính hãng, máy tính xách tay, thiết bị di động và phụ kiện cao cấp.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block">
          <Layers className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Category Grid */}
      {parents.length === 0 && categories.length === 0 ? (
        <EmptyState
          title="Chưa có danh mục nào"
          description="Hệ thống cơ sở dữ liệu hiện chưa có danh mục sản phẩm nào."
          onAction={fetchCategories}
          actionText="Tải lại"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(parents.length > 0 ? parents : categories).map((cat) => {
            const lower = cat.name.toLowerCase();
            const icon = CATEGORY_ICONS[lower] || <HardDrive className="w-8 h-8 text-[#FF5C00]" />;
            const subCategories = childrenMap.get(cat._id) || [];

            return (
              <Card
                key={cat._id}
                className="group p-6 border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      {icon}
                    </div>
                    <span className="font-mono text-xs text-neutral-400">
                      {subCategories.length > 0 ? `${subCategories.length} mục con` : 'Chính hãng'}
                    </span>
                  </div>

                  <Link to={`/products?category=${cat._id}`} className="block">
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#FF5C00] transition-colors mb-2">
                      {cat.name}
                    </h3>
                  </Link>

                  {/* Sub-categories */}
                  {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100">
                      {subCategories.slice(0, 5).map((sub) => (
                        <Link
                          key={sub._id}
                          to={`/products?category=${sub._id}`}
                          className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-[#FF5C00]">
                  <Link
                    to={`/products?category=${cat._id}`}
                    className="flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    <span>Khám phá sản phẩm</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
