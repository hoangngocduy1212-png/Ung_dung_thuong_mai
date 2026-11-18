import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import type { Product } from '../../types/catalog';
import { Scale, Plus, X, Star, ArrowRight } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  useEffect(() => {
    catalogService.getProducts({ limit: 4 }).then((res) => {
      const items = res.items || [];
      if (items.length >= 2) {
        setComparedProducts([items[0], items[1]]);
      } else {
        setComparedProducts(items);
      }
    });
  }, []);

  const handleRemove = (id: string) => {
    setComparedProducts(comparedProducts.filter((p) => p._id !== id));
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-6 pb-24 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
        <Link to="/" className="hover:text-neutral-900">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">So sánh sản phẩm</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#FF5C00] mb-1">
            <Scale className="w-4 h-4" />
            <span>ĐỐI CHIẾU PHẦN CỨNG CHI TIẾT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            So Sánh Thông Số Kỹ Thuật
          </h1>
        </div>

        <span className="text-xs text-neutral-500 font-mono">
          Đang so sánh {comparedProducts.length} / 3 sản phẩm
        </span>
      </div>

      {/* Comparison Table */}
      {comparedProducts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50 space-y-3">
          <p className="text-sm text-neutral-600">Chưa có sản phẩm nào được chọn để so sánh.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5C00] hover:underline"
          >
            <span>Duyệt danh sách sản phẩm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-2xl bg-white overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="p-4 w-48 text-neutral-500 uppercase tracking-wider font-mono">
                  Sản phẩm
                </th>
                {comparedProducts.map((p) => (
                  <th key={p._id} className="p-4 min-w-[240px] align-top relative">
                    <button
                      onClick={() => handleRemove(p._id)}
                      className="absolute top-3 right-3 text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Xóa khỏi so sánh"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="h-32 w-full flex items-center justify-center p-2 mb-2 bg-white rounded-lg border border-neutral-100">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80'}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <Link to={`/products/${p._id}`} className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-2 hover:text-[#FF5C00]">
                      {p.name}
                    </Link>
                    <div className="text-sm font-bold text-[#FF5C00] font-mono mt-1">
                      {p.minPrice ? p.minPrice.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
                    </div>
                  </th>
                ))}
                {comparedProducts.length < 3 && (
                  <th className="p-4 min-w-[200px] border-l border-dashed border-neutral-200 text-center align-middle">
                    <button
                      onClick={() => navigate('/products')}
                      className="p-4 border-2 border-dashed border-neutral-300 rounded-xl hover:border-[#FF5C00] text-neutral-500 hover:text-[#FF5C00] transition flex flex-col items-center gap-1 w-full cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold text-xs">Thêm sản phẩm</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="p-4 font-bold text-neutral-700 bg-neutral-50/50">Thương hiệu</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 font-mono text-neutral-800">
                    {p.brand?.name || 'Chính hãng'}
                  </td>
                ))}
                {comparedProducts.length < 3 && <td className="p-4" />}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-700 bg-neutral-50/50">Danh mục</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 text-neutral-800">
                    {p.category?.name || 'Thiết bị'}
                  </td>
                ))}
                {comparedProducts.length < 3 && <td className="p-4" />}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-700 bg-neutral-50/50">Đánh giá</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-neutral-900">{p.ratingAvg ? p.ratingAvg.toFixed(1) : '5.0'}</span>
                      <span className="text-neutral-400">({p.ratingCount || 0})</span>
                    </div>
                  </td>
                ))}
                {comparedProducts.length < 3 && <td className="p-4" />}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-700 bg-neutral-50/50">Đã bán</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 font-mono text-neutral-800">
                    {p.soldCount || 0} sản phẩm
                  </td>
                ))}
                {comparedProducts.length < 3 && <td className="p-4" />}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-700 bg-neutral-50/50">Bảo hành</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 text-emerald-700 font-semibold">
                    12 tháng chính hãng
                  </td>
                ))}
                {comparedProducts.length < 3 && <td className="p-4" />}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
