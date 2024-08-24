const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
        required: true
    },
    bidder: {
        // type: mongoose.Schema.Types.ObjectId,
        type:String,
        ref: 'User',
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
