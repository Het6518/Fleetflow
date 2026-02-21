const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Add a fuel log for a vehicle
 */
const createFuelLog = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  return prisma.fuelLog.create({
    data: {
      liters: data.liters,
      cost: data.cost,
      date: new Date(data.date),
      vehicleId: data.vehicleId,
    },
    include: { vehicle: { select: { id: true, name: true } } },
  });
};

/**
 * Get all fuel logs
 */
const getAllFuelLogs = async () => {
  return prisma.fuelLog.findMany({
    include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    orderBy: { date: 'desc' },
  });
};

/**
 * Get fuel logs for a specific vehicle
 */
const getFuelLogsByVehicle = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  return prisma.fuelLog.findMany({
    where: { vehicleId },
    orderBy: { date: 'desc' },
  });
};

module.exports = { createFuelLog, getAllFuelLogs, getFuelLogsByVehicle };
