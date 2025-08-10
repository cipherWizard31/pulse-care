const express = require('express');
const app = express();
const hospitalAPIRoutes = require('./routes/hospitalAPI');
const superAdminAPIRoutes = require('./routes/super-adminAPI');
const { verifyToken } = require('./middlewares/auth');

app.use(express.json());

//Hospital profile routes
app.use('/api', hospitalAPIRoutes);

// super-admin profile routes
app.use('/api', superAdminAPIRoutes);

// token verification route
app.get('/test', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token fully working', role: req.user });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
