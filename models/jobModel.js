const mongoose = require ('mongoose')

const jobSchema = new mongoose.Schema({
    jobDescription :{
        type:String,
        required:true
    },
    minPrice: {
        type: Number,
        required: true
    },
    maxPrice: {
        type: Number,
        required: true
    },
    location:{
        type:String,
        required: true
    },
    createdBy: { 
        type: String, 
        required: true 
    }
})

const  newJob = mongoose.model('Job',jobSchema)

module.exports = newJob
