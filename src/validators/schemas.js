const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const vehicleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  maxCapacity: z.number().positive('Max capacity must be positive'),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
});

const vehicleUpdateSchema = vehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});

const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for license expiry',
  }),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(['ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
});

const driverUpdateSchema = driverSchema.partial();

const tripSchema = z.object({
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  vehicleId: z.number().int().positive('Vehicle ID is required'),
  driverId: z.number().int().positive('Driver ID is required'),
  revenue: z.number().min(0).optional(),
  startOdometer: z.number().min(0).optional(),
});

const tripCompleteSchema = z.object({
  endOdometer: z.number().min(0, 'End odometer must be non-negative'),
  revenue: z.number().min(0, 'Revenue must be non-negative').optional(),
});

const maintenanceSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  cost: z.number().positive('Cost must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  vehicleId: z.number().int().positive('Vehicle ID is required'),
});

const fuelSchema = z.object({
  liters: z.number().positive('Liters must be positive'),
  cost: z.number().positive('Cost must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  vehicleId: z.number().int().positive('Vehicle ID is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  driverSchema,
  driverUpdateSchema,
  tripSchema,
  tripCompleteSchema,
  maintenanceSchema,
  fuelSchema,
};
