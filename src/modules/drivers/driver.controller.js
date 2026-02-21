const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { driverSchema, driverUpdateSchema } = require('../../validators/schemas');
const { createDriver, getAllDrivers, getDriverById, updateDriver } = require('./driver.service');

const create = catchAsync(async (req, res) => {
  const validated = driverSchema.parse(req.body);
  const driver = await createDriver(validated);
  sendSuccess(res, 201, 'Driver created successfully.', { driver });
});

const getAll = catchAsync(async (req, res) => {
  const drivers = await getAllDrivers();
  sendSuccess(res, 200, 'Drivers fetched successfully.', { drivers });
});

const getOne = catchAsync(async (req, res) => {
  const driver = await getDriverById(Number(req.params.id));
  sendSuccess(res, 200, 'Driver fetched successfully.', { driver });
});

const update = catchAsync(async (req, res) => {
  const validated = driverUpdateSchema.parse(req.body);
  const driver = await updateDriver(Number(req.params.id), validated);
  sendSuccess(res, 200, 'Driver updated successfully.', { driver });
});

module.exports = { create, getAll, getOne, update };
