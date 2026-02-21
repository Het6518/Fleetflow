const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { vehicleSchema, vehicleUpdateSchema } = require('../../validators/schemas');
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require('./vehicle.service');

const create = catchAsync(async (req, res) => {
  const validated = vehicleSchema.parse(req.body);
  const vehicle = await createVehicle(validated);
  sendSuccess(res, 201, 'Vehicle created successfully.', { vehicle });
});

const getAll = catchAsync(async (req, res) => {
  const vehicles = await getAllVehicles();
  sendSuccess(res, 200, 'Vehicles fetched successfully.', { vehicles });
});

const getOne = catchAsync(async (req, res) => {
  const vehicle = await getVehicleById(Number(req.params.id));
  sendSuccess(res, 200, 'Vehicle fetched successfully.', { vehicle });
});

const update = catchAsync(async (req, res) => {
  const validated = vehicleUpdateSchema.parse(req.body);
  const vehicle = await updateVehicle(Number(req.params.id), validated);
  sendSuccess(res, 200, 'Vehicle updated successfully.', { vehicle });
});

const remove = catchAsync(async (req, res) => {
  await deleteVehicle(Number(req.params.id));
  sendSuccess(res, 200, 'Vehicle deleted successfully.', {});
});

module.exports = { create, getAll, getOne, update, remove };
