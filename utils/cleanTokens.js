const cron = require('node-cron');
const tokenBlacklist = require('../models/tokenBlacklistModel');

const setTokenCleanUp = () => {
    cron.schedule('*/3 * * * *', async () => { // Run every 3 minutes
        try {
            const now = new Date();
            console.log('Token cleanup started at (UTC):', now.toUTCString());
            
            const result = await tokenBlacklist.deleteMany({ expiresAt: { $lt: now } });
            console.log(`Expired blacklisted tokens deleted: ${result.deletedCount}`);
        } catch (error) {
            console.error("Error deleting blacklisted tokens:", error.message);
        }
    });

    console.log('Token cleanup scheduled');
}

module.exports = setTokenCleanUp;


