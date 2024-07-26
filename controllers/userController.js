const user =  require ('../models/userModel')
const expressAsyncHandler = require("express-async-handler")
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')


exports.userRegister = expressAsyncHandler(async (req,res) => {
    const { firstname, lastname, username, email, password, phoneNumber, address, city, bio, country,roles } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password,10)

        const alreadyExist = await user.findOne ({username})
        const existingEmail = await user.findOne ({email})

        if(alreadyExist || existingEmail){
            return res.status(400).json({msg:"User already exist! log in"})
        }

        const newUser = new user({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            address,
            city,
            bio,
            country,
            roles
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

        const token = jwt.sign({userId :user._id},process.env.JWT_ACCESS_SECRET_KEY,{expiresIn:'4000s'})

        res.status(200).json({
            msg:"Login success",
            token})

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

exports.resetP