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

// Middleware to check wether the user is in the company or employee table
// This is used to determine the role of the user for RBAC
const verifyUserTable = async (req, res, next) => {

  try {
    const [companyRows] = await pool.query('SELECT id FROM company WHERE id = ?', [req.user.id]);
    if (companyRows.length > 0) {
      req.user.role = 'company';
      return next();
    }
    const [employeeRows] = await pool.query('SELECT id FROM patient WHERE id = ?', [req.user.id]);
    if (employeeRows.length > 0) {
      req.user.role = 'employee';
      return next();
    }
    return res.status(403).json({ message: 'User role not found in any table' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error during role check', error: err.message });
  }
};

// Role check middleware for Role Based Access Control (RBAC)
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: 'Access denied: role mismatch' });
  }
  next();
};


module.exports = { verifyToken, verifyUserTable, requireRole };
