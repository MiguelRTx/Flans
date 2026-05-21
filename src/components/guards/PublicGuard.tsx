import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const PublicGuard = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'creator' ? '/creator/dashboard' : '/feed';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};