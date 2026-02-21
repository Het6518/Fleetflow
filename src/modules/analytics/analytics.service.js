const prisma = require('../../config/prisma');

/**
 * Calculate dashboard-level analytics across all vehicles
 */
const getDashboard = async () => {
  const [vehicles, trips, fuelLogs, maintenanceLogs, drivers] = await Promise.all([
    prisma.vehicle.findMany({ include: { fuelLogs: true, maintenanceLogs: true } }),
    prisma.trip.findMany({ include: { vehicle: true } }),
    prisma.fuelLog.aggregate({ _sum: { liters: true, cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.driver.findMany(),
  ]);

  const totalVehicles = vehicles.length;
  const totalTrips = trips.length;

  const tripsByStatus = {
    DRAFT: trips.filter((t) => t.status === 'DRAFT').length,
    DISPATCHED: trips.filter((t) => t.status === 'DISPATCHED').length,
    COMPLETED: trips.filter((t) => t.status === 'COMPLETED').length,
    CANCELLED: trips.filter((t) => t.status === 'CANCELLED').length,
  };

  const vehiclesByStatus = {
    AVAILABLE: vehicles.filter((v) => v.status === 'AVAILABLE').length,
    ON_TRIP: vehicles.filter((v) => v.status === 'ON_TRIP').length,
    IN_SHOP: vehicles.filter((v) => v.status === 'IN_SHOP').length,
    RETIRED: vehicles.filter((v) => v.status === 'RETIRED').length,
  };

  const driversByStatus = {
    ON_DUTY: drivers.filter((d) => d.status === 'ON_DUTY').length,
    ON_TRIP: drivers.filter((d) => d.status === 'ON_TRIP').length,
    OFF_DUTY: drivers.filter((d) => d.status === 'OFF_DUTY').length,
    SUSPENDED: drivers.filter((d) => d.status === 'SUSPENDED').length,
  };

  const totalFuelCost = fuelLogs._sum.cost || 0;
  const totalFuelLiters = fuelLogs._sum.liters || 0;
  const totalMaintenanceCost = maintenanceLogs._sum.cost || 0;
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  const totalRevenue = trips
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.revenue || 0), 0);

  const netProfit = totalRevenue - totalOperationalCost;

  return {
    summary: {
      totalVehicles,
      totalDrivers: drivers.length,
      totalTrips,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
      totalFuelLiters: parseFloat(totalFuelLiters.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
    },
    breakdown: {
      tripsByStatus,
      vehiclesByStatus,
      driversByStatus,
    },
  };
};

/**
 * Per-vehicle analytics: fuel efficiency, ROI, operational cost
 */
const getVehicleAnalytics = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      trips: { where: { status: 'COMPLETED' } },
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });
  if (!vehicle) {
    const AppError = require('../../utils/AppError');
    throw new AppError('Vehicle not found.', 404);
  }

  // Fuel totals
  const totalFuelLiters = vehicle.fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const totalFuelCost = vehicle.fuelLogs.reduce((sum, f) => sum + f.cost, 0);

  // Maintenance totals
  const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

  // Total operational cost
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  // Revenue from completed trips
  const totalRevenue = vehicle.trips.reduce((sum, t) => sum + (t.revenue || 0), 0);

  // Distance covered (km) from odometer readings across completed trips
  const totalKm = vehicle.trips.reduce((sum, t) => {
    if (t.startOdometer !== null && t.endOdometer !== null) {
      return sum + (t.endOdometer - t.startOdometer);
    }
    return sum;
  }, 0);

  // Fuel efficiency: km / liters
  const fuelEfficiency =
    totalFuelLiters > 0
      ? parseFloat((totalKm / totalFuelLiters).toFixed(2))
      : null;

  // ROI: (Revenue - Operational Cost) / Acquisition Cost
  const roi =
    vehicle.acquisitionCost > 0
      ? parseFloat(
        (((totalRevenue - totalOperationalCost) / vehicle.acquisitionCost) * 100).toFixed(2)
      )
      : null;

  return {
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      acquisitionCost: vehicle.acquisitionCost,
      odometer: vehicle.odometer,
    },
    analytics: {
      completedTrips: vehicle.trips.length,
      totalKmCovered: parseFloat(totalKm.toFixed(2)),
      totalFuelLiters: parseFloat(totalFuelLiters.toFixed(2)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      fuelEfficiencyKmPerLiter: fuelEfficiency,
      roiPercent: roi,
    },
  };
};

module.exports = { getDashboard, getVehicleAnalytics };
