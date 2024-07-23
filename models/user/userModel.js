const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 3
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
},{timestamps: true})

const User = mongoose.model('User', userSchema)

module.exports = User