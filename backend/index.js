const express = require('express');
const app = express();
const hospitalAPIRoutes = require('./routes/hospitalAPI');
const superAdminAPIRoutes = require('./routes/super-adminAPI');
const { verifyToken } = require('./middlewares/auth');
const dotenv = require('dotenv');
const verificationAPI = require('./routes/verificationAPI');
const superAdminDashboardAPIRoutes = require('./routes/superAdmin-dashboardAPI');
const crudPatRoutes = require('./routes/crudPat');





dotenv.config();

app.use(express.json());

//Hospital profile routes
app.use('/api', hospitalAPIRoutes);

// super-admin profile routes
app.use('/api', superAdminAPIRoutes);

// Verification routes
app.use('/api', verificationAPI);

// Super Admin Dashboard routes
app.use('/api', superAdminDashboardAPIRoutes);
// CRUD Patient routes
app.use('/api', crudPatRoutes);

// token verification route
app.get('/test', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token fully working', role: req.user });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});