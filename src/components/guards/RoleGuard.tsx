import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface RoleGuardProps {
  allowedRole: 'creator' | 'follower';
}

export const RoleGuard = ({ allowedRole }: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== allowedRole) {
    const redirectPath = user?.role === 'creator' ? '/creator/dashboard' : '/feed';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};