const express = require('express');
const app = express();
const hospitalAPIRoutes = require('./routes/hospitalAPI');
const superAdminAPIRoutes = require('./routes/super-adminAPI');

app.use(express.json());

//Hospital profile routes
app.use('/api', hospitalAPIRoutes);

// super-admin profile routes
app.use('/api', superAdminAPIRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
