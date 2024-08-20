const user =  require ('../models/userModel')
const expressAsyncHandler = require("express-async-handler")
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const Profile = require('../models/userProfileModel')
const systemLogs = require('../middlewares/logger')


exports.userRegister = expressAsyncHandler(async (req,res) => {
    const { firstname, lastname, username, email, password, phoneNumber,role } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password,10)

        const alreadyExist = await user.findOne ({$or:[{username},{email}]})
     
        if(alreadyExist){
            return res.status(400).json({msg:"User already exist! log in"})
        }

        const newUser = new user({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            role
        });

       const successful = await newUser.save()

       res.status(200).json({
         msg: 'User successfully registered',
         successful });

    }catch(error){
        console.error(error)
        res.status(500).json({ message: 'Server error' },error);
    }
})


exports.userLogin = expressAsyncHandler(async (req,res) =>{
    const {username,email,password} = req.body

    try{
        if(!username && !email){
            return res.status(400).json({msg:"Provide email or username"})
        }

        if(!password){
            return res.status(400).json({msg:"provide password!"})
        }
        const userExist = await user.findOne({$or:[{username},{email}]})

        if(!userExist){
            return res.status(400).json({msg:"User not found! sign up"})
        }
        const correctPassword = await bcrypt.compare(password,userExist.password)

        if(!correctPassword){
            return res.status(401).json({msg:"Wrong password"})
        }

        const accessToken = jwt.sign({id:userExist.id}, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: '4000s' })

        // const refreshToken = jwt.sign({ id: userExist.id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '7d' })

        // userExist.refreshToken.push(refreshToken)
        // await userExist.save()


        res.status(200).json({
            msg:"Login success",
            accessToken,
            })

    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Server error",error})
    }
})

exports.userLogout = expressAsyncHandler(async (req,res) => {
    try{
        const token = req.headers.authorization?.split(' ')[1]

        if(token){
            console.log(`Token ${token} added to blacklist`)
        }

        res.status(200).json({msg:"Log out successful"})

    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Error logging out",error})
    }
})



exports.userProfile = expressAsyncHandler (async (req,res) =>{

    const userId = req.auth.id
       if (!req.auth) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const {bio, address,city,country}=req.body
    const avatar = req.cloudinaryUrl
   

    try{
        const existingProfile = await Profile.findOne({ userId });

        if (existingProfile) {
            return res.status(400).json({ msg: "Profile already exists for this user." });
        }

        const profile = new Profile({
            userId,
            bio,
            address,
            city,
            country,
            avatar
        })

        const createProfile = await profile.save()
        if(createProfile){
            createProfile.isProfile =true
        }
        await createProfile.save()

        res.status(200).json({msg:"Profile created successfully",createProfile})

    }catch(error){
        console.log(error)
        res.status(500).json({msg:"Server error",error})
    }
})

exports.updateProfile = expressAsyncHandler(async (req,res) =>{
    const userId = req.auth.id

    if (!req.auth) {
        systemLogs.error('Authentication required')
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { bio, address, city, country } = req.body;
    const avatar = req.cloudinaryUrl

    try {
   
        const profile = await Profile.findOne({userId });

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        
        if (bio) profile.bio = bio;
        if (address) profile.address = address;
        if (city) profile.city = city;
        if (country) profile.country = country;
        if (avatar) {
            profile.avatar = avatar; 
        }

        const updatedProfile = await profile.save();

        res.status(200).json({ msg: "Profile updated successfully", updatedProfile });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error updating profile", error });
    }

})

exports.resetPassword = expressAsyncHandler (async (req,res) => {
    const userId = req.auth.id
   const {otpCode,newPassword}=req.body

   try{
    if(!otpCode || !newPassword ){
        return res.status(400).json({msg:"Provide otp code and new password"})
    }

    const existingUser = await user.findById(userId)
    if (existingUser.otpCode !== otpCode || existingUser.otpCodeExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP code' });
      }

    
    const hashedPassword = await bcrypt.hash(newPassword,10)

    existingUser.password = hashedPassword;
    existingUser.otpCode = undefined;
    existingUser.otpCodeExpires = undefined;

    await existingUser.save();

    return res.status(200).json({ message: 'Password reset successful' });


   }catch(error){
    console.error(error)
    res.status(500).json({msg:"Internal server error", error})
   }
})


exports.forgotPassword =expressAsyncHandler(async(req,res)=>{
    const {newPassword,otpCode}=req.body

    try{
        if (!otpCode) {
            return res.status(400).json({ msg: "Provide an OTP code" });
          }
      
          const existingUser = await user.findOne({ otpCode });
      
          if (!existingUser) {
            return res.status(404).json({ msg: "User not found" });
          }
      
          if (existingUser.otpCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired' });
          }
      
        const hashedPassword = await bcrypt.hash(newPassword,10)

        existingUser.password = hashedPassword
        existingUser.otpCode = undefined
        existingUser.otpCodeExpires = undefined
    
        await existingUser.save()
    
        return res.status(200).json({ message: 'Password reset successful' })
    
    
    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Internal server error", error})
    }

})