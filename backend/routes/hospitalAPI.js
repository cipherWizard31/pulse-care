const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// Register a new hospital
router.post('/hospitals', async (req, res) => {
    const { name, phone, address, document_link, email, password } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO hospitals (name, phone, address, document_link, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, address, document_link, email, password]
        );
        res.status(201).json({message: "Hospital Registered Successfully!", user: {id: result.insertId, name, phone, address, document_link, email }});
    } catch (error) {
        console.error('Error registering hospital:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


module.exports = router;