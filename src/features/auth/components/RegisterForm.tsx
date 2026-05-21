import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/useAuthStore';
import axios from 'axios';

export const RegisterForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'follower', // Valor por defecto para agilizar UX
    }
  });

  // Observamos el rol seleccionado para cambiar los estilos dinámicamente
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError(null);
  
      const response = await authService.register(data);
  
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
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Crea tu cuenta</h3>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Selector de Roles Avanzado (Radio Cards) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo usarás OnlyFlans?</label>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Tarjeta Seguidor */}
            <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg border-2 transition-all ${
              selectedRole === 'follower' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                value="follower" 
                className="sr-only" 
                {...register('role')} 
              />
              <span className="text-2xl mb-2">👀</span>
              <span className="font-semibold text-sm">Seguidor</span>
              <span className="text-xs text-gray-500 text-center mt-1">Apoya creadores</span>
            </label>

            {/* Tarjeta Creador */}
            <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg border-2 transition-all ${
              selectedRole === 'creator' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                value="creator" 
                className="sr-only" 
                {...register('role')} 
              />
              <span className="text-2xl mb-2">🎨</span>
              <span className="font-semibold text-sm">Creador</span>
              <span className="text-xs text-gray-500 text-center mt-1">Recibe flanes</span>
            </label>
          </div>
          {errors.role && <span className="mt-1 text-xs text-red-500">{errors.role.message}</span>}
        </div>

        <Input
          label="Nombre de Usuario"
          type="text"
          placeholder="tu_usuario_genial"
          {...register('username')}
          error={errors.username?.message}
        />

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
          placeholder="Mínimo 6 caracteres"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting} variant={selectedRole === 'creator' ? 'primary' : 'outline'}>
          Registrarse
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};