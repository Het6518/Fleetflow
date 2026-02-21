const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { maintenanceSchema } = require('../../validators/schemas');
const {
  createMaintenanceLog,
  getAllMaintenanceLogs,
  completeMaintenanceLog,
} = require('./maintenance.service');

const create = catchAsync(async (req, res) => {
  const validated = maintenanceSchema.parse(req.body);
  const log = await createMaintenanceLog(validated);
  sendSuccess(res, 201, 'Maintenance log created. Vehicle set to IN_SHOP.', { log });
});

const getAll = catchAsync(async (req, res) => {
  const logs = await getAllMaintenanceLogs();
  sendSuccess(res, 200, 'Maintenance logs fetched.', { logs });
});

const complete = catchAsync(async (req, res) => {
  const log = await completeMaintenanceLog(Number(req.params.id));
  sendSuccess(res, 200, 'Maintenance completed. Vehicle set to AVAILABLE.', { log });
});

module.exports = { create, getAll, complete };
