const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    OrderId: String,
    Name: [String],
    Image: [String],
    Quantity: [String],
    ProductId: [String],
    subtotal: Number,
    shippingCost: Number,
    Total: Number,
    transactionId: String,
    dateOrdered: { type: Date, default: new Date().toLocaleString() },
    shippingAddress: {
        firstName: { type: String },
        lastName: { type: String },
        street: { type: String },
        state: { type: String },
        city: { type: String },
        zipcode: { type: String },
        number: { type: String },
    },
    orderStatus: Number,
    User: String,
});

module.exports = new mongoose.model("order", orderSchema);