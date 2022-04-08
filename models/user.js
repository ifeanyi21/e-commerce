const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
    full_name: String,
    firstName: String,
    lastName: String,
    birthDay: String,
    mobileNumber: String,
    email: { type: String, unique: true },
    password: String,
    date: { type: Date, default: Date() },
    googleId: String,
    facebookId: String,
    verified: Boolean,
    address: [{
        first_name: { type: String },
        last_name: { type: String },
        street: { type: String },
        state: { type: String },
        city: { type: String },
        zipcode: { type: String },
        number: { type: String },
        defaultAddress: { type: String },
    }, ],
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(findOrCreate);

module.exports = new mongoose.model("user", userSchema);