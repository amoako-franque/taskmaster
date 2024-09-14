const express = require('express');
const { userRegister, userLogin, userLogout, userProfile, updateProfile, resetPassword, forgotPassword, createJob, submitBid } = require('../controllers/userController');
const { requireSignIn } = require('../middlewares/authMiddleware');
const { sendOtp } = require('../utils/sendCode');
const { upload, uploadCloud } = require('../middlewares/multer');
const userRoute = express.Router();

//Registration and login and logout
userRoute.post('/user-register', userRegister)
userRoute.post('/user-login',userLogin)
userRoute.post('/logout',requireSignIn,userLogout)

//Password resetting 
userRoute.post('/reset-password',requireSignIn,resetPassword)
userRoute.post('/forgot-password',forgotPassword)

//profile
userRoute.post('/user-profile',requireSignIn,upload.single('avatar'),uploadCloud,userProfile)
userRoute.patch('/user-profile-update',requireSignIn,upload.single('avatar'),uploadCloud,updateProfile)


//job Creation
userRoute.post ('/create-job',requireSignIn,createJob)
userRoute.post('/submit-bid',requireSignIn,submitBid)




//otp route
userRoute.post('/otp-request',sendOtp)
//,requireSignIn


module.exports = userRoute;