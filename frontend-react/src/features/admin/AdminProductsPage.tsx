import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import type { Product, Category, Brand } from '../../types/catalog';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchMeta = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getBrands(),
      ]);
      setCategories(catRes || []);
      setBrands(brandRes || []);
    } catch (err: any) {
      console.error('Fetch meta error:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 15 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;

      const res = await catalogService.getProducts(params);
      setProducts(res.items || []);
      setTotalProducts(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / 15) || 1);
    } catch (err: any) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Giám sát Sản phẩm Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tra cứu và giám sát danh mục hàng hóa đang lưu hành trên toàn bộ các gian hàng ({totalProducts} sản phẩm).
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
            />
            <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <div className="w-48">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none bg-white"
          >
            <option value="">-- Tất cả ngành hàng --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none bg-white"
          >
            <option value="">-- Thương hiệu --</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('');
            setSelectedBrand('');
            setPage(1);
          }}
          className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-900"
        >
          Đặt lại
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Không tìm thấy sản phẩm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Sản phẩm</th>
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4">Ngành hàng</th>
                  <th className="py-3 px-4">Thương hiệu</th>
                  <th className="py-3 px-4 text-right">Giá khởi điểm</th>
                  <th className="py-3 px-4 text-center">Biến thể</th>
                  <th className="py-3 px-4 text-center">Đánh giá</th>
                  <th className="py-3 px-4 text-center">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const categoryName = typeof p.category === 'object' ? p.category?.name : 'N/A';
                  const brandName = typeof p.brand === 'object' ? p.brand?.name : '—';
                  const shopName = typeof p.shop === 'object' ? p.shop?.name : 'N/A';

                  return (
                    <tr key={p._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-9 h-9 object-cover rounded border border-neutral-200 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 bg-neutral-100 rounded border border-neutral-200 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-neutral-900 block line-clamp-1 max-w-[280px]">{p.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400">ID: {p._id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-800">
                        {shopName}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {categoryName}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">
                        {brandName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {(p.minPrice ?? 0).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-neutral-600">
                        {p.variants?.length || 1}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-amber-500 font-semibold">★ {p.ratingAvg || 5.0}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/products/${p._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-neutral-400 hover:text-neutral-900 inline-block"
                          title="Mở xem trên Storefront"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs">
            <span className="text-neutral-500 font-mono">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
