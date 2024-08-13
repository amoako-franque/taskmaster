const mongoose = require("mongoose");
const validator = require("validator");

const Schema = mongoose.Schema;

const profileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        bio: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: "Ghana",
            required: true
        },
        avatar:{
            type: String,
            required :true
        } 
    },
    {
        timestamps: true
    }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
