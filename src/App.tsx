import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { authService } from './features/auth/services/auth.service';

function App() {
  const { token, setAuth, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Validar si el token guardado sigue siendo válido en el backend
          const { user } = await authService.verifySession();
          setAuth(user, token);
        } catch {
          logout(); // Si falla (ej. expiró), limpiamos todo
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [token, setAuth, logout]);

  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center text-xl">Cargando OnlyFlans...</div>;
  }

  return <RouterProvider router={router} />;
}

export default App;