const express = require("express")
const controller = require("../controllers/get/index.js")
const homeRoute = require("../controllers/get/homeController.js")
const cartRoute = require("../controllers/get/cartController")
const saveditemRoute = require("../controllers/wishlistController")

const router = express.Router()

// Logout
router.get("/logout", controller.logOut);

router.get("/login", controller.login);

router.get("/cart.payment",cartRoute)

router.get("/sign-up",controller.signUp)

router.get("/reset/usr/password",controller.resetPassword )

router.get("/usr/new-password", controller.newPassword );

// verify User
router.get("/verify", controller.verifyUser);

// View Product
router.get("/product/:customProduct", controller.viewProduct);

//View Brand
router.get("/:brand",controller.viewBrand)

router.get("/usr/account",controller.userAccount);

// Address
router.get("/account/address-book", controller.userAddress);

router.get("/customer/orders", controller.userOrder);

router.get("/delete-address/:address",controller.userDeleteAddress);

// View Account Personal Information
router.get("/account/details", controller.accountDetails);

// Saved Items
router.get("/customer/wishlist", saveditemRoute);

router.get("/remove-wishlist/:item", controller.remoteItemWishList);

// Add item to saved Items
router.get("/wishlist-add/:item",controller.addItemToWishList);


// Update Password when user is logged in
router.get("/update/password", controller.updateUserPassword);

// Review Order
router.get("/pay.marketnest/confirm/order", controller.reviewOrder);



router.get("/", homeRoute);

module.exports = router