import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../features/auth/services/auth.service';
import { LayoutDashboard, FileText, BarChart3, LogOut, Target } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

const CREATOR_NAV_ITEMS = [
  { path: '/creator/dashboard', label: 'Mi Perfil', icon: LayoutDashboard },
  { path: '/creator/posts', label: 'Mis Publicaciones', icon: FileText },
  { path: '/creator/goals', label: 'Metas de Apoyo', icon: Target },
  { path: '/creator/reports', label: 'Ingresos', icon: BarChart3 },
];

export const CreatorLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <span className="text-3xl">🍮</span>
          <span className="text-xl font-bold tracking-tight">OnlyFlans</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {CREATOR_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">Modo {user?.role}</p>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro de que deseas salir de OnlyFlans? Tendrás que volver a iniciar sesión para gestionar tu contenido o apoyar a otros creadores."
        confirmLabel="Cerrar Sesión"
        cancelLabel="Permanecer"
        variant="warning"
        isLoading={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};