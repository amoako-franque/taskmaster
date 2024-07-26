const express = require('express');
const { userRegister, userLogin, userLogout } = require('../controllers/userController');
const userRoute = express.Router();


userRoute.post('/user-register', userRegister)
userRoute.post('/user-login',userLogin)
userRoute.post('/logout',userLogout)


module.exports = userRoute;