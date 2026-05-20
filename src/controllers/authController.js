const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');

const JWT_SECRET = process.env.JWT_SECRET || 'onlyflans_secret';

const authController = {
 
  async register(req, res, next) {
    try {
      const { username, email, password, role } = req.body;
      if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'Todos los campos son requeridos: username, email, password, role' });
      }
      if (!['creator', 'follower'].includes(role)) {
        return res.status(400).json({ error: 'El rol debe ser "creator" o "follower"' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const existing = User.findByEmailOrUsername(email, username);
      if (existing) {
        return res.status(409).json({ error: 'El email o username ya está registrado' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const userId = User.create({ username, email, password_hash, role });

      if (role === 'creator') {
        CreatorProfile.create(userId, username);
      }

      const token = jwt.sign({ id: userId, username, role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: { id: userId, username, email, role },
      });
    } catch (error) {
      next(error);
    }
  },


  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Sesión iniciada correctamente',
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  },

  
  
  logout(req, res) {
    return res.json({ message: 'Sesión cerrada correctamente. Por favor elimina el token del cliente.' });
  },


  me(req, res) {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ user });
  },
};

module.exports = authController;
