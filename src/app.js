const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trip.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const fuelRoutes = require('./modules/fuel/fuel.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// ─────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetFlow API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────

app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
