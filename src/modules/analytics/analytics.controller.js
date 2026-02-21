const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { getDashboard, getVehicleAnalytics } = require('./analytics.service');

const dashboard = catchAsync(async (req, res) => {
  const data = await getDashboard();
  sendSuccess(res, 200, 'Dashboard analytics fetched.', data);
});

const vehicleAnalytics = catchAsync(async (req, res) => {
  const data = await getVehicleAnalytics(Number(req.params.id));
  sendSuccess(res, 200, 'Vehicle analytics fetched.', data);
});

module.exports = { dashboard, vehicleAnalytics };
