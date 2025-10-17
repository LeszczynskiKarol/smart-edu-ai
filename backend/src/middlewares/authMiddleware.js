// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Dla zwykłych użytkowników
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

// Dla adminów
exports.isAdmin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔐 isAdmin middleware - Token:', token ? 'YES' : 'NO');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    console.log('👤 User found:', user ? 'YES' : 'NO');
    console.log('👤 User role:', user?.role);

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only',
      });
    }

    console.log('✅ Admin access granted');
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message,
    });
  }
};
