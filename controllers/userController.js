const user =  require ('../models/userModel')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')



exports.userRegister = async (req,res) => {
    const { firstname, lastname, username, email, password, phoneNumber, address, city, bio, country } = req.body;

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
            country
        });

       const successful = await newUser.save()

       res.status(200).json({
         msg: 'User successfully registered',
         successful });

    }catch(error){
        console.error(error)
        res.status(500).json({ message: 'Server error' },error);

    }
}

