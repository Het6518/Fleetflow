const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Create a new vehicle (MANAGER only)
 */
const createVehicle = async (data) => {
  const vehicle = await prisma.vehicle.create({
    data: {
      name: data.name,
      licensePlate: data.licensePlate,
      maxCapacity: data.maxCapacity,
      odometer: data.odometer || 0,
      acquisitionCost: data.acquisitionCost,
      status: 'AVAILABLE',
    },
  });
  return vehicle;
};

/**
 * Get all vehicles
 */
const getAllVehicles = async () => {
  return prisma.vehicle.findMany({
    include: {
      _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single vehicle by ID
 */
const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      maintenanceLogs: { orderBy: { date: 'desc' }, take: 5 },
      fuelLogs: { orderBy: { date: 'desc' }, take: 5 },
    },
  });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);
  return vehicle;
};

/**
 * Update a vehicle
 */
const updateVehicle = async (id, data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  return prisma.vehicle.update({
    where: { id },
    data,
  });
};

/**
 * Delete a vehicle (only if AVAILABLE and no active trips)
 */
const deleteVehicle = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  if (vehicle.status === 'ON_TRIP') {
    throw new AppError('Cannot delete a vehicle that is currently on a trip.', 400);
  }

  const activeTrips = await prisma.trip.count({
    where: { vehicleId: id, status: { in: ['DISPATCHED'] } },
  });
  if (activeTrips > 0) {
    throw new AppError('Cannot delete a vehicle with active trips.', 400);
  }

  await prisma.vehicle.delete({ where: { id } });
  return { deleted: true };
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
