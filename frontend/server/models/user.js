const mongoose = require("mongoose");
const connection = mongoose.createConnection(process.env.DB);
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  language: { type: String, required: true },
  country: { type: String, required: true },
  gender: { type: String, required: true },
  "Account Type": { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

const User = connection.model("user", userSchema);

const validate = (data) => {
	const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    "Account Type": Joi.string().required().label("Account Type"),
    language: Joi.string().required().label("Language"),
    country: Joi.string().required().label("Country"),
    gender: Joi.string().required().label("Gender"),
    // password: passwordComplexity().required().label("Password"),
    password: Joi.required().label("Password"),
  });
	return schema.validate(data);
};

module.exports = { User, validate };