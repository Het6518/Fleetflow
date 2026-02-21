const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Add a maintenance log – auto-sets vehicle status to IN_SHOP
 */
const createMaintenanceLog = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  if (vehicle.status === 'ON_TRIP') {
    throw new AppError('Cannot add maintenance to a vehicle that is currently on a trip.', 400);
  }

  const [log] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        description: data.description,
        cost: data.cost,
        date: new Date(data.date),
        vehicleId: data.vehicleId,
        completed: false,
      },
    }),
    prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'IN_SHOP' },
    }),
  ]);

  return log;
};

/**
 * Get all maintenance logs
 */
const getAllMaintenanceLogs = async () => {
  return prisma.maintenanceLog.findMany({
    include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    orderBy: { date: 'desc' },
  });
};

/**
 * Complete a maintenance log – sets vehicle back to AVAILABLE
 */
const completeMaintenanceLog = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!log) throw new AppError('Maintenance log not found.', 404);
  if (log.completed) throw new AppError('Maintenance log is already completed.', 400);

  const [updatedLog] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id },
      data: { completed: true },
    }),
    prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'AVAILABLE' },
    }),
  ]);

  return updatedLog;
};

module.exports = { createMaintenanceLog, getAllMaintenanceLogs, completeMaintenanceLog };
