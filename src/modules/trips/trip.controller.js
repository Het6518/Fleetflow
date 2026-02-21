const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { tripSchema, tripCompleteSchema } = require('../../validators/schemas');
const {
  createTrip,
  getAllTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require('./trip.service');

const create = catchAsync(async (req, res) => {
  const validated = tripSchema.parse(req.body);
  const trip = await createTrip(validated);
  sendSuccess(res, 201, 'Trip created successfully.', { trip });
});

const getAll = catchAsync(async (req, res) => {
  const trips = await getAllTrips();
  sendSuccess(res, 200, 'Trips fetched successfully.', { trips });
});

const getOne = catchAsync(async (req, res) => {
  const trip = await getTripById(Number(req.params.id));
  sendSuccess(res, 200, 'Trip fetched successfully.', { trip });
});

const dispatch = catchAsync(async (req, res) => {
  const trip = await dispatchTrip(Number(req.params.id));
  sendSuccess(res, 200, 'Trip dispatched successfully.', { trip });
});

const complete = catchAsync(async (req, res) => {
  const validated = tripCompleteSchema.parse(req.body);
  const trip = await completeTrip(Number(req.params.id), validated);
  sendSuccess(res, 200, 'Trip completed successfully.', { trip });
});

const cancel = catchAsync(async (req, res) => {
  const trip = await cancelTrip(Number(req.params.id));
  sendSuccess(res, 200, 'Trip cancelled successfully.', { trip });
});

module.exports = { create, getAll, getOne, dispatch, complete, cancel };
