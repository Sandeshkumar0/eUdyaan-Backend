const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const { sequelize, connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');

// Connect to database
connectDB();

// Route files
const apiRoutes = require('./routes/index.js');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A simple root route to check if the API is running
app.get('/', (req, res) => {
  res.send('eUdayan API is running...');
});

// Mount routers
app.use('/api', apiRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database synchronized');
    const server = app.listen(
      PORT,
      console.log(`✅ Server running on port ${PORT}`)
    );

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
};

startServer();