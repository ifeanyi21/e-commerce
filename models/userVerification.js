const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema({
    UserId: { type: String, },
    uniqueString: { type: String, unique: true },
    expiredAt: { type: Date, },
});

module.exports = new mongoose.model("userVerification", userVerificationSchema);