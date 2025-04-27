const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required().min(6).max(30),
  fullName: Joi.string().required().trim().min(2).max(50),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
  code: Joi.string().required().length(6),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateVerifyEmail = (req, res, next) => {
  const { error } = verifyEmailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
};
