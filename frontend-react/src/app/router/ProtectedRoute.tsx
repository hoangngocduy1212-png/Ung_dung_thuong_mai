import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { ROLE_LABELS, ROLE_HOME_PATHS } from '../../lib/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen message="Đang xác thực phiên đăng nhập..." />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const userRoleHome = ROLE_HOME_PATHS[user.role] || '/';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#17283e] mb-2">Truy cập bị từ chối (403)</h2>
        <p className="text-sm text-[#78889b] max-w-md mb-4">
          Tài khoản của bạn có vai trò{' '}
          <Badge role={user.role} size="sm" className="inline-block mx-1" />
          nhưng trang này yêu cầu quyền{' '}
          <span className="font-semibold text-[#17283e]">
            {allowedRoles.map((r) => ROLE_LABELS[r] || r).join(' hoặc ')}
          </span>
          .
        </p>

        <div className="flex items-center gap-3">
          <Link to={userRoleHome}>
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Về trang vai trò của bạn ({ROLE_LABELS[user.role]})
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Về Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
