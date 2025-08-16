const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/crypto');
const { verifyToken } = require('../middlewares/auth');

// Middleware to verify token for all routes
router.use(verifyToken);

// 1. GET /patients (with filtering by name)
router.get('/patients', async (req, res) => {
  try {
    let query = 'SELECT id, first_name, last_name, dob FROM patients WHERE 1=1';
    const params = [];
    
    if (req.query.name) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${req.query.name}%`, `%${req.query.name}%`);
    }

    const [patients] = await pool.query(query, params);
    res.status(200).json(patients);

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  }
});

// 2. GET /patients/:id (details + medical history)
router.get('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [patientRows] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (patientRows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientRows[0];
    patient.national_id = decrypt(patient.national_id);

    // Fetch and decrypt medical history
    const [recordRows] = await pool.query('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date DESC', [id]);
    patient.medical_history = recordRows.map(record => ({
      ...record,
      diagnosis: decrypt(record.diagnosis),
      treatment: decrypt(record.treatment)
    }));
    
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  }
});

// 3. POST /patients (create a new patient)
router.post('/patients', async (req, res) => {
  try {
    const { first_name, last_name, dob, national_id } = req.body;
    if (!first_name || !last_name ||!dob || !national_id) {
      return res.status(400).json({ message: 'Please fill required fields.' });
    }

    const newPatient = {
      id: uuidv4(),
      first_name,
      last_name,
      dob,
      national_id: encrypt(national_id) 
    };

    await pool.query('INSERT INTO patients SET ?', newPatient);
    res.status(201).json({ message: 'Patient created successfully', id: newPatient.id });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY'){
      // Duplicate entry for national_id checker
      return res.status(409).json({ message: 'A Patient with this National ID already exists.' });
    }
    console.error('Error creating patient data:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  }
});

// 4. DELETE /patients/:id (delete a patient)
router.delete('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [id]); 
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  } 
});

// 5. POST /patients/:id/records (add new medical record)
router.post('/patients/:id/records', async (req, res) => {
    try {
        const { id: patient_id } = req.params;
        const hospital_id = req.user.id; 

        const { diagnosis, treatment, record_date, file_link } = req.body;
        if (!diagnosis || !treatment || !record_date) {
            return res.status(400).json({ message: 'Diagnosis, treatment, and record date are required.' });
        }

        const newRecord = {
            id: uuidv4(),
            patient_id,
            hospital_id,
            diagnosis: encrypt(diagnosis),    
            treatment: encrypt(treatment),    
            record_date,
            file_link
        };

        await pool.query('INSERT INTO medical_records SET ?', newRecord);
        res.status(201).json({ message: 'Medical record added successfully', id: newRecord.id });

    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'The specified patient does not exist.' });
        }
        console.error('Error adding medical record:', error);
        res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
    }
});

// 6. PUT /patients/:id/records/:recordId (update existing record)
router.put('/patients/:id/records/:recordId', async (req, res) => {
  try {
    const { id: patient_id, recordId } = req.params;
    const { diagnosis, treatment, record_date, file_link } = req.body;
    
    const fieldsToUpdate = {};
    if (diagnosis) fieldsToUpdate.diagnosis = encrypt(diagnosis);
    if (treatment) fieldsToUpdate.treatment = encrypt(treatment);
    if (record_date) fieldsToUpdate.record_date = record_date;
    if (file_link !== undefined) fieldsToUpdate.file_link = file_link;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields are given to update.' });
    }
    
    // Ensure the record belongs to the patient before updating
    const [result] = await pool.query('UPDATE medical_records SET ? WHERE id = ? AND patient_id = ?', [fieldsToUpdate, recordId, patient_id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Medical record not found or does not belong to this patient.' });
    }

    res.status(200).json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  }
});

// 7. DELETE /patients/:id/records/:recordId (delete a medical record)
router.delete('/patients/:id/records/:recordId', async (req, res) => {
  try {
    const { id: patient_id, recordId } = req.params;
    const [result] = await pool.query('DELETE FROM medical_records WHERE id = ? AND patient_id = ?', [recordId, patient_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Medical record not found or does not belong to this patient.' });
    }
    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ message: 'Oops!...We are having server error', error: error.message });
  } 
});

module.exports = router;