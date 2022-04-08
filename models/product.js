const mongoose = require("mongoose");
const random = require("mongoose-simple-random");

const productSchema = new mongoose.Schema({
    Name: String,
    Price: Number,
    Sale: Number,
    Discount: Number,
    Description: String,
    Category: Number,
    Brand: String,
    Image: [String],
    Quantity: Number,
    User: String,
    Subtitle: String,
    DeliveryCost: Number,
});

productSchema.plugin(random);

module.exports = new mongoose.model("product", productSchema);