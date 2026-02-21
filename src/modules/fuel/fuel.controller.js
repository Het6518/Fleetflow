const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { fuelSchema } = require('../../validators/schemas');
const { createFuelLog, getAllFuelLogs, getFuelLogsByVehicle } = require('./fuel.service');

const create = catchAsync(async (req, res) => {
  const validated = fuelSchema.parse(req.body);
  const log = await createFuelLog(validated);
  sendSuccess(res, 201, 'Fuel log created successfully.', { log });
});

const getAll = catchAsync(async (req, res) => {
  const logs = await getAllFuelLogs();
  sendSuccess(res, 200, 'Fuel logs fetched.', { logs });
});

const getByVehicle = catchAsync(async (req, res) => {
  const logs = await getFuelLogsByVehicle(Number(req.params.vehicleId));
  sendSuccess(res, 200, 'Fuel logs fetched for vehicle.', { logs });
});

module.exports = { create, getAll, getByVehicle };
