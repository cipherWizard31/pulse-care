const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserTable, requireRole } = require('../middlewares/auth');

// Register a new super-admin
router.post('/super-admins', async (req, res) => {
    const { name, phone, address, document_link, email, password } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO super_admins (name, phone, address, document_link, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, address, document_link, email, password]
        );
        res.status(201).json({message: "Super Admin Registered Successfully!", user: {id: result.insertId, name, phone, address, document_link, email }});
    } catch (error) {
        console.error('Error registering super-admin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Log in a super-admin
router.post('/super-admins/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM super_admins WHERE email = ? AND password = ?', [email, password]);    
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = rows[0];
        res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Error logging in super-admin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }   
});