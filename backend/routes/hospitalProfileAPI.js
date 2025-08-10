const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserRole } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

// get logged-in hospital profile
router.get('/hospitals/profile', verifyToken, verifyUserRole('hospital'), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, phone, address, document_link, email FROM hospitals WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching hospital profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Update hospital profile
router.put('/hospitals/profile', verifyToken, verifyUserRole('hospital'), async (req, res) => {
    const { name, phone, address, document_link, email } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE hospitals SET name = ?, phone = ?, address = ?, document_link = ?, email = ? WHERE id = ?',
            [name, phone, address, document_link, email, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating hospital profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Delete a hospital profile
router.delete('/hospitals/profile', verifyToken, verifyUserRole('hospital'), async (req, res) => {
    const hospitalId = req.user.id;
    try {
        const [result] = await pool.query('DELETE FROM hospitals WHERE id = ?', [hospitalId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json({ message: 'Hospital profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting hospital profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});