import Joi from "joi";

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});


export default emailSchema;