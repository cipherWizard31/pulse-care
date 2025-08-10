const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserTable, requireRole, verifyUserRole } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new super-admin
router.post('/super-admins', async (req, res) => {
    const { name, phone, address, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10); 
    try {
        const [result] = await pool.query(
            'INSERT INTO super_admins (name, phone, address, email, password) VALUES (?, ?, ?, ?, ?)',
            [name, phone, address, email, passwordHash]
        );
        res.status(201).json({message: "Super Admin Registered Successfully!", user: {id: result.insertId, name, phone, address, email }});
    } catch (error) {
        console.error('Error registering super-admin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Login for super-admin
router.post('/super-admins/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [rows] = await pool.query('SELECT * FROM super_admins WHERE email = ?', [email]);
      const superAdmin = rows[0];
  
      if (!superAdmin) {
        return res.status(401).json({ message: 'Invalid email' });
      }
  
      const isMatch = await bcrypt.compare(password, superAdmin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign(
        { id: superAdmin.id, role: 'super_admin', email: superAdmin.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        superAdmin: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name
        }
      });
  
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });


// get all unverified hospitals
router.get('/hospitals/unverified', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
    try {
        const [hospitals] = await pool.query('SELECT * FROM hospitals WHERE isVerified = 0');
        res.status(200).json(hospitals);
    } catch (error) {
        console.error('Error fetching unverified hospitals:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Accept a hospital registration request
router.post('/hospitals/accept', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
    const hospitalId  = req.body.id;

    try {
        const [result] = await pool.query(
            'UPDATE hospitals SET isVerified = 1 WHERE id = ?',
            [hospitalId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Hospital not found or already accepted' });
        }
        res.status(200).json({ message: 'Hospital registration accepted successfully' });
    }
    catch (error) {
        console.error('Error accepting hospital registration:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Test route to check protected access
router.get('/super-admins/test', verifyToken, verifyUserRole('super_admin'),  (req, res) => {
    res.status(200).json({ message: 'Protected route accessed successfully', role: req.user.role });
});
module.exports = router;