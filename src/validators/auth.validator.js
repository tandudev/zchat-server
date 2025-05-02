const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Invalid email format',
    'string.required': 'Email is required',
  }),
  password: Joi.string().required().min(6).max(30).messages({
    'string.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must be less than 30 characters',
  }),
  fullName: Joi.string().required().trim().min(2).max(50).messages({
    'string.required': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must be less than 50 characters',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Invalid email format',
    'string.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.required': 'Password is required',
  }),
});

const verifyEmailSchema = Joi.object({
  code: Joi.string().required().length(6).messages({
    'string.required': 'Verification code is required',
    'string.length': 'Verification code must be 6 characters long',
  }),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(err => err.message);
    return res.status(400).json({ errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(err => err.message);
    return res.status(400).json({ errors });
  }
  next();
};

const validateVerifyEmail = (req, res, next) => {
  const { error } = verifyEmailSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(err => err.message);
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
};
