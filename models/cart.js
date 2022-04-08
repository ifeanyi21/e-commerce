const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    ProductId: String,
    Name: String,
    Price: Number,
    Sale: Number,
    Discount: Number,
    Image: String,
    User: String,
    Quantity: Number,
    maxQuantity: Number,
    shippingfee: Number,
});

module.exports = new mongoose.model("cart", cartSchema);