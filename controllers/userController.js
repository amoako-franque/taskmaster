const user =  require ('../models/userModel')
const expressAsyncHandler = require("express-async-handler")
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const Profile = require('../models/userProfileModel')
const systemLogs = require('../middlewares/logger')
const { access } = require('fs')
const tokenBlacklist =require('../models/tokenBlacklistModel')
const Job =require('../models/jobModel')
const Bid = require ('../models/bidModel')
const rateLimit = require('express-rate-limit');
const { generateTokens } = require('../utils/tokenUtils');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

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


exports.userLogin = [
  loginLimiter,
  expressAsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Input validation
      if ((!username && !email) || !password) {
        return res.status(400).json({ msg: "Please provide email/username and password" });
      }

      // Find user
      const userExist = await user.findOne({ $or: [{ username }, { email }] });
      if (!userExist) {
        systemLogs.warn(`Login attempt for non-existent user: ${username || email}`);
        return res.status(404).json({ msg: "User not found. Please sign up." });
      }

      // Password verification
      const correctPassword = await bcrypt.compare(password, userExist.password);
      if (!correctPassword) {
        systemLogs.warn(`Failed login attempt for user: ${userExist.username}`);
        return res.status(401).json({ msg: "Invalid credentials" });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(userExist);

      // Update user's tokens and last login
      await user.findByIdAndUpdate(userExist._id, {
        $push: { accessToken, refreshToken },
        lastLogin: new Date()
      });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      systemLogs.info(`User logged in: ${userExist.username}`);

      res.status(200).json({
        msg: "Login successful",
        user: {
          id: userExist._id,
          username: userExist.username,
          email: userExist.email,
          role: userExist.role
        },
        accessToken
      });

    } catch (error) {
      systemLogs.error(`Login error: ${error.message}`);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  })
];


exports.userLogout = expressAsyncHandler(async (req,res) => {
    try{
        const token = req.headers.authorization?.split(' ')[1]

        if(!token){
            return res.status(401).json({msg:"Access token required"})
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY)
        const userId = decoded.id

        const loggedUser= await  user.findById(userId)
        // if (!loggedUser){
        //     return res.status(404).json({ msg: "User not found" })
        // }

        
        loggedUser.accessToken = loggedUser.accessToken.filter(at => at !== token);

        if(req.body.refreshToken){
            loggedUser.refreshToken = loggedUser.refreshToken.filter(rt => rt !== req.body.refreshToken)
        } else{
            loggedUser.refreshToken =[]
        }
        await loggedUser.save()

        const decodedToken = jwt.decode(token)
        const expiresAt = new Date(decodedToken.exp * 1000)
        console.log('Token expiration time (UTC):', expiresAt.toUTCString())

        const blacklistedToken = new tokenBlacklist({
            token,
            expiresAt
        });

        await blacklistedToken.save()

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
   const {newPassword}=req.body

   try{
    if( !newPassword ){
        return res.status(400).json({msg:"Provide new password"})
    }

    const existingUser = await user.findById(userId)
   

    
    const hashedPassword = await bcrypt.hash(newPassword,10)

    existingUser.password = hashedPassword;

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

exports.createJob = expressAsyncHandler(async(req,res)=>{
    const {jobDescription,minPrice,maxPrice,location}=req.body

    try{

        const newJob = new Job({
            jobDescription,
            minPrice,
            maxPrice,
            location,
            createdBy: req.auth.username
        })

        const savedJob = await newJob.save();

        res.status(201).json({ msg: "Job created successfully", job: savedJob })

    }catch(error){
        console.error(error)
        res.status(500).json({msg:'Internal server error'})
    }

})


exports.getAllJobs =expressAsyncHandler(async(req,res)=>{
    try {
       
        const jobs = await Job.find();

        res.status(200).json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

}

) 
exports.submitBid = expressAsyncHandler(async(req,res)=>{
    const {jobId,bidAmount}=req.body
    const bidder = req.auth.username
    const userRole =req.auth.role

    try{
        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).json({ msg: "Job not found" })
        }

        if (job.createdBy === bidder) {
            return res.status(403).json({ msg: "You cannot bid on your own job" })
        }

        if (!userRole.includes("SKILLED")) {
            return res.status(403).json({ msg: "Only skilled workers can bid on jobs" })
          }


        const newBid = new Bid({
            jobId,
            bidder,
            bidAmount
        })

        const savedBid = await newBid.save()

        res.status(201).json({ msg: "Bid submitted successfully", bid: savedBid })

    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Internal server error"})
    }
})