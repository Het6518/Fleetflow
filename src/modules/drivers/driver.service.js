const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Create a new driver
 */
const createDriver = async (data) => {
  return prisma.driver.create({
    data: {
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      safetyScore: data.safetyScore ?? 100,
      status: data.status || 'ON_DUTY',
    },
  });
};

/**
 * Get all drivers
 */
const getAllDrivers = async () => {
  return prisma.driver.findMany({
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single driver by ID
 */
const getDriverById = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  if (!driver) throw new AppError('Driver not found.', 404);
  return driver;
};

/**
 * Update a driver
 */
const updateDriver = async (id, data) => {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw new AppError('Driver not found.', 404);

  const updateData = { ...data };
  if (data.licenseExpiry) {
    updateData.licenseExpiry = new Date(data.licenseExpiry);
  }

  return prisma.driver.update({ where: { id }, data: updateData });
};

module.exports = { createDriver, getAllDrivers, getDriverById, updateDriver };
