const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserRole } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

// get logged-in super-admin profile
router.get('/super-admins/profile', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, phone, address, email FROM super_admins WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Super Admin not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching super-admin profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Update super-admin profile
router.put('/super-admins/profile', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
    const { name, phone, address, email } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE super_admins SET name = ?, phone = ?, address = ?, email = ? WHERE id = ?',
            [name, phone, address, email, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Super Admin not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating super-admin profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Register a new super-admin
router.post('/super-admins', async (req, res) => {
    const { name, phone, address, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const [result] = await pool.query(
            'INSERT INTO super_admins (name, phone, address, email, password) VALUES (?, ?, ?, ?, ?)',
            [name, phone, address, email, passwordHash]
        );
        res.status(201).json({ message: "Super Admin Registered Successfully!", user: { id: result.insertId, name, phone, address, email } });
    } catch (error) {
        console.error('Error registering super-admin:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


module.exports = router;