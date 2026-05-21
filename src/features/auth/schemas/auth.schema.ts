import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),

  email: z.string().email('Debe ser un correo electrónico válido'),

  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),

  role: z.enum(['creator', 'follower'], {
    message: 'Debes seleccionar un rol',
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;