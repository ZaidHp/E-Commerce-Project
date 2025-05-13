const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

function generateAuthToken(user_id) {
  const accessToken = jwt.sign(
    { id: user_id },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
  return accessToken;
}

function generateRefreshToken(user_id) {
  const refreshToken = jwt.sign(
    { id: user_id },
    process.env.JWTREFRESHKEY,
    { expiresIn: "30d" }
  );
  return refreshToken;
}

const validateUser = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().required().label("First Name"),
    last_name: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    user_type: Joi.string().valid("customer", "business").required().label("User Type"),
    business_name: Joi.when("user_type", {
      is: "business",
      then: Joi.string().required().label("Business Name"),
      otherwise: Joi.optional(),
    }),
    license_image_url: Joi.when("user_type", {
      is: "business",
      then: Joi.string().required().label("License Image URL"),
      otherwise: Joi.optional(),
    }),
  });

  return schema.validate(data);
};

module.exports = {
  generateAuthToken,
  generateRefreshToken,
  validateUser,
};
