import Joi from "joi";

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[\d\s\-()+]+$/).required(),
});

export default contactSchema;
