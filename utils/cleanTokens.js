const tokenBlacklist = require("../models/tokenBlacklistModel");

const cleanUpExpiredTokens = async () => {
    try {
        await tokenBlacklist.deleteMany({ expiresAt: { $lt: new Date() } })
        console.log('Expired tokens cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error)
    }
};


// setInterval(cleanUpExpiredTokens, 24 * 60 * 60 * 1000)
setInterval(cleanUpExpiredTokens, 5 * 60 * 1000)










