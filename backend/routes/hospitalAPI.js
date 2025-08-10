const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyUserRole } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new hospital
router.post('/hospitals', async (req, res) => {
    const { name, phone, address, document_link, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const [result] = await pool.query(
            'INSERT INTO hospitals (name, phone, address, document_link, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, address, document_link, email, passwordHash]
        );
        res.status(201).json({message: "Hospital Registered Successfully!", user: {id: result.insertId, name, phone, address, document_link, email }});
    } catch (error) {
        console.error('Error registering hospital:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Login a hospital
router.post('/hospitals/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM hospitals WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        const hospital = rows[0];
        const isPasswordValid = await bcrypt.compare(password, hospital.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ id: hospital.id, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token, hospital: { id: hospital.id, name: hospital.name, phone: hospital.phone, address: hospital.address, document_link: hospital.document_link, email: hospital.email } });
    } catch (error) {
        console.error('Error logging in hospital:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }   
});

// test route to check protected access
router.get('/hospitals/test', verifyToken, verifyUserRole('hospital'), (req, res) => {
    res.status(200).json({ message: 'Protected route accessed successfully', role: req.user.role });
});


module.exports = router;