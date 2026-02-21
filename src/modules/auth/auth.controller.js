const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { registerUser, loginUser } = require('./auth.service');
const { registerSchema, loginSchema } = require('../../validators/schemas');

const register = catchAsync(async (req, res) => {
  const validated = registerSchema.parse(req.body);
  const user = await registerUser(validated);
  sendSuccess(res, 201, 'User registered successfully.', { user });
});

const login = catchAsync(async (req, res) => {
  const validated = loginSchema.parse(req.body);
  const result = await loginUser(validated);
  sendSuccess(res, 200, 'Login successful.', result);
});

module.exports = { register, login };
