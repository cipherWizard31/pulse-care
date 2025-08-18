const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../config/db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No or malformed token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }

    req.user = decoded;
    next();
  });
};

const verifyUserRole = (requiredRole) => {
  return (req, res, next) => {
    // 1. Check if user has role data
    if (!req.user?.role) {
      return res.status(403).json({
        message: 'Role information missing',
        details: 'User authentication data does not contain role information'
      });
    }

    // 2. Verify role matches required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: 'Role mismatch error',
        details: {
          required: requiredRole,
          actual: req.user.role,
          suggestion: `This endpoint requires ${requiredRole} privileges`
        }
      });
    }

    // 3. Role matches - proceed
    next();
  };
};

module.exports = { verifyToken, verifyUserRole };
