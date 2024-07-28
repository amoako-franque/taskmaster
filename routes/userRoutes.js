const express = require('express');
const { userRegister, userLogin, userLogout, userProfile, updateProfile } = require('../controllers/userController');
const { requireSignIn } = require('../middlewares/authMiddleware');
const userRoute = express.Router();

//Registration and login and logout
userRoute.post('/user-register', userRegister)
userRoute.post('/user-login',userLogin)
userRoute.post('/logout',userLogout)

//profile
userRoute.post ('/user-profile',requireSignIn,userProfile)
userRoute.patch('/user-profile-update',requireSignIn,updateProfile)

//otp route



module.exports = userRoute;