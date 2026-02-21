const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Create a new trip (DRAFT status)
 */
const createTrip = async (data) => {
  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError('Vehicle not found.', 404);

  // Verify driver exists
  const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!driver) throw new AppError('Driver not found.', 404);

  const trip = await prisma.trip.create({
    data: {
      cargoWeight: data.cargoWeight,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      startOdometer: data.startOdometer,
      revenue: data.revenue,
      status: 'DRAFT',
    },
    include: { vehicle: true, driver: true },
  });

  return trip;
};

/**
 * Get all trips
 */
const getAllTrips = async () => {
  return prisma.trip.findMany({
    include: {
      vehicle: { select: { id: true, name: true, licensePlate: true } },
      driver: { select: { id: true, name: true, licenseNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single trip by ID
 */
const getTripById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  if (!trip) throw new AppError('Trip not found.', 404);
  return trip;
};

/**
 * Dispatch a trip – uses Prisma transaction for atomicity
 * Validates: vehicle AVAILABLE, driver ON_DUTY, license not expired, cargo fits
 */
const dispatchTrip = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw new AppError('Trip not found.', 404);
  if (trip.status !== 'DRAFT') {
    throw new AppError(`Cannot dispatch a trip with status: ${trip.status}.`, 400);
  }

  const { vehicle, driver } = trip;

  // Validate vehicle status
  if (vehicle.status !== 'AVAILABLE') {
    throw new AppError(`Vehicle is not available (current status: ${vehicle.status}).`, 400);
  }

  // Validate driver status
  if (driver.status !== 'ON_DUTY') {
    throw new AppError(`Driver is not on duty (current status: ${driver.status}).`, 400);
  }

  // Validate license expiry
  const today = new Date();
  if (new Date(driver.licenseExpiry) <= today) {
    throw new AppError('Driver license is expired. Cannot dispatch this trip.', 400);
  }

  // Validate cargo weight
  if (trip.cargoWeight > vehicle.maxCapacity) {
    throw new AppError(
      `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxCapacity} kg).`,
      400
    );
  }

  // Atomic transaction: update trip + vehicle + driver
  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: { status: 'DISPATCHED' },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'ON_TRIP' },
    }),
    prisma.driver.update({
      where: { id: driver.id },
      data: { status: 'ON_TRIP' },
    }),
  ]);

  return updatedTrip;
};

/**
 * Complete a trip – updates odometer on vehicle, sets statuses back
 */
const completeTrip = async (id, { endOdometer, revenue }) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw new AppError('Trip not found.', 404);
  if (trip.status !== 'DISPATCHED') {
    throw new AppError(`Cannot complete a trip with status: ${trip.status}.`, 400);
  }

  if (endOdometer !== undefined && trip.startOdometer !== null && endOdometer < trip.startOdometer) {
    throw new AppError('End odometer cannot be less than start odometer.', 400);
  }

  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endOdometer: endOdometer ?? undefined,
        revenue: revenue ?? trip.revenue,
      },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicle.id },
      data: {
        status: 'AVAILABLE',
        odometer: endOdometer ?? trip.vehicle.odometer,
      },
    }),
    prisma.driver.update({
      where: { id: trip.driver.id },
      data: { status: 'ON_DUTY' },
    }),
  ]);

  return updatedTrip;
};

/**
 * Cancel a trip (DRAFT or DISPATCHED)
 */
const cancelTrip = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw new AppError('Trip not found.', 404);
  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    throw new AppError(`Cannot cancel a trip with status: ${trip.status}.`, 400);
  }

  const updates = [
    prisma.trip.update({ where: { id }, data: { status: 'CANCELLED' } }),
  ];

  // If trip was dispatched, free up vehicle and driver
  if (trip.status === 'DISPATCHED') {
    updates.push(
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_DUTY' } })
    );
  }

  const [updatedTrip] = await prisma.$transaction(updates);
  return updatedTrip;
};

module.exports = { createTrip, getAllTrips, getTripById, dispatchTrip, completeTrip, cancelTrip };
