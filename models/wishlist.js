const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const wishlistSchema = Schema({
  productId: String,
  name: String,
  price: Number,
  image: String,
  user: String,
});

module.exports = new mongoose.model("wishlist", wishlistSchema);
