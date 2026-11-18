import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#78889b] mb-4">
        <Compass className="w-8 h-8 text-[#1267d5]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#17283e] mb-2">404</h1>
      <h2 className="text-xl font-bold text-[#17283e] mb-2">Trang không tồn tại</h2>
      <p className="text-sm text-[#78889b] max-w-sm mb-6">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Về Trang Chủ
        </Button>
      </Link>
    </div>
  );
};
