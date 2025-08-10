const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserRole } = require('../middlewares/auth');

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
router.post('/hospitals/approve', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
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

// approved hospitals
router.get('/hospitals/approved', verifyToken, verifyUserRole('super_admin'), async (req, res) => {
    try {
        const [hospitals] = await pool.query('SELECT * FROM hospitals WHERE isVerified = 1');
        res.status(200).json(hospitals);
    } catch (error) {
        console.error('Error fetching approved hospitals:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});