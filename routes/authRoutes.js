const express = require("express")
const { register } = require("../controllers/authController")
const authRouter = express.Router()

authRouter.get("/", register)

module.exports = authRouter
