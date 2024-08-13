const express = require('express');
const { userRegister, userLogin, userLogout, userProfile, updateProfile, resetPassword, forgotPassword } = require('../controllers/userController');
const { requireSignIn } = require('../middlewares/authMiddleware');
const { sendOtp } = require('../utils/sendCode');
const upload = require('../middlewares/multer');
const userRoute = express.Router();

//Registration and login and logout
userRoute.post('/user-register', userRegister)
userRoute.post('/user-login',userLogin)
userRoute.post('/logout',userLogout)
userRoute.post('/reset-password',requireSignIn,resetPassword)

userRoute.post('/forgot-password',forgotPassword)

//profile
userRoute.post ('/user-profile',requireSignIn,upload.single('avatar'),userProfile)
userRoute.patch('/user-profile-update',requireSignIn,upload.single('avatar'),updateProfile)


//otp route
userRoute.post('/otp-request',sendOtp)
//,requireSignIn



module.exports = userRoute;