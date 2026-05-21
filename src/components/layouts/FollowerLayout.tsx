import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../features/auth/services/auth.service';
import { Home, Search, Heart, Receipt, LogOut, Sparkles } from 'lucide-react';

const FOLLOWER_NAV_ITEMS = [
  { path: '/feed', label: 'Feed', icon: Home },
  { path: '/creators', label: 'Explorar', icon: Search },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/donations', label: 'Historial', icon: Receipt },
];

export const FollowerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 font-sans text-gray-900">
      {/* Navbar Superior — Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2.5 group cursor-default">
              <span className="text-2xl group-hover:animate-bounce transition-transform">🍮</span>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                OnlyFlans
              </span>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {FOLLOWER_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-200/50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/70'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Perfil & Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-800">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex justify-around border-t border-gray-100/60 py-1 px-2">
          {FOLLOWER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-3 text-xs font-semibold transition-all rounded-lg ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};