import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export const LoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);
      const response = await authService.login(data.email, data.password);
      setAuth(response.user, response.token);

      navigate(
        response.user.role === 'creator'
          ? '/creator/dashboard'
          : '/feed'
      );
  
    } catch (error: unknown) {
  
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.error ||
          'Error al conectar con el servidor'
        );
      } else {
        setServerError('Error inesperado');
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo 🍮</h1>
        <p className="text-gray-500 mt-2">Inicia sesión para continuar en OnlyFlans</p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting}>
          Ingresar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};