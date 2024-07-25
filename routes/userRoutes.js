const express = require('express');
const { userRegister } = require('../controllers/userController');
const userRoute = express.Router();


userRoute.post('/user-register', userRegister)


module.exports = userRoute;