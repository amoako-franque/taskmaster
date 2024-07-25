const mongoose = require("mongoose")
const validator = require("validator")

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		firstname: {
			type: String,
			required: true,
			minLength: 3,
			trim: true,
			validate: [
				validator.isAlphanumeric,
				"First Name can only have Alphanumeric values. No special characters allowed",
			],
		},

		lastname: {
			type: String,
			required: true,
			minLength: 3,
			trim: true,
			validate: [
				validator.isAlphanumeric,
				"Last Name can only have Alphanumeric values. No special characters allowed",
			],
		},
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isAlphanumeric(value)) {
					throw new Error("Username can only contain letters and numbers")
				}
			},
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Email is invalid. Please provide a valid email")
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 7,
			validate: [
				validator.isStrongPassword,
				"Password must be at least 8 characters long, with at least 1 uppercase and lowercase letters and at least 1 symbol",
			],
		},
		isVerified: { type: Boolean, required: true, default: false },
		phoneNumber: {
			type: String,
			trim: true,
			required: true,
		},
		address: String,
		city: String,
		bio: {
			type: String,
		},
		country: { type: String, default: "Ghana" },
		passwordChangedAt: Date,
		roles: {
			type: [String],
			default: ["USER"],
			enum: ["USER", "SKILLED", "ADMIN", "SUPER ADMIN"],
		  },

		refreshToken: [String],
	},
	{ timestamps: true }
)

userSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

const User = mongoose.model("User", userSchema)

module.exports = User
