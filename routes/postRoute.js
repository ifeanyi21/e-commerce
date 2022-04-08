const express = require("express")
const { body, check, validationResult } = require("express-validator");
const postController = require("../controllers/post/index.js")
const signupPostRoute = require("../controllers/signup.js")
const resetPassword = require("../controllers/resetPassword")

const postRouter = express.Router()

// Sign Up
postRouter.post("/sign-up",
    body("password")
    .exists()
    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).trim().escape()
    .withMessage(
        "Password must be greater than 8 Characters and contain at least one uppercase letter, one lowercase letter, a Symbol and one number"
    ),
    body("email", "Invalid email").isEmail().normalizeEmail().exists().trim().escape(),
    body("username", "Username must be at least 4 Characters or More")
    .isLength({
        min: 4,
    })
    .exists().trim().escape(),
    signupPostRoute
);

postRouter.post("/reset/usr/password",
 body("email", "Not a valid email address").isEmail().normalizeEmail().exists().trim().escape(),
    resetPassword);

postRouter.post("/usr/new-password",
 body("newPassword")
    .exists()
    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
    })
    .withMessage(
        "Password must be greater than 8 Characters and contain at least one uppercase letter, one lowercase letter, a Symbol and one number"
    ),postController.updateUserPassword )

// Change password when logged in
postRouter.post(
    "/update/password",
    body("newPassword").exists().trim().escape()
    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
    })
    .withMessage(
        "Password must be greater than 8 Characters and contain at least one uppercase letter, one lowercase letter, a Symbol and one number"
    ),postController.updateUserPasswordLoggedIn
);

//  Update  Personal Information
postRouter.post(
    "/customer/update-info",
    body("fname").exists(),
    body("lname").exists().trim().escape(),
    body("dob").exists().trim().escape(),
    check("number").isMobilePhone(),
    body("number").exists().trim().escape().isNumeric(),
 postController.updateUserInformation
);

postRouter.post(
    "/usr/add-address",
    body("fname").exists().trim().escape(),
    body("lname").exists().trim().escape(),
    body("street").exists().trim().escape(),
    body("state").exists().trim().escape(),
    body("city").exists().trim().escape(),
    body("zip_code").exists().trim().escape(),
    check("number").isMobilePhone(),
    body("number").exists().trim().escape().isNumeric(),
    postController.addUserAddress
);

postRouter.post(
    "/usr/edit-address/default/:address",
    body("fname").exists().trim().escape(),
    body("lname").exists().trim().escape(),
    body("street").exists().trim().escape(),
    body("state").exists().trim().escape(),
    body("city").exists().trim().escape(),
    body("zip_code").exists().trim().escape(),
    check("number").isMobilePhone(),
    body("number").exists().trim().escape(),
  postController.editDefaultAddress
);

postRouter.post(
    "/usr/edit-address/:address",
    body("fname").exists().trim().escape(),
    body("lname").exists().trim().escape(),
    body("street").exists().trim().escape(),
    body("state").exists().trim().escape(),
    body("city").exists().trim().escape(),
    body("zip_code").exists().trim().escape(),
    check("number").isMobilePhone(),
    body("number").exists().trim().escape(),
   postController.editAddress
);

postRouter.post(
    "/customer/setdefault/address/:newDefault",
 postController.setDefaultAddress
);

// Add Item to Cart
postRouter.post(
    "/product/:customProduct",
    body("quantity").exists().trim().escape().isInt(),
  postController.addToCart
);

// Update item quantity in cart
postRouter.post(
    "/cart.payment/change/:product",
    body("quantity").exists().trim().escape(),
   postController.updateItemQuanitityCart
);

// Add first address when checking out
postRouter.post(
    "/checkout/add-new/address",
    body("fname").exists().trim().escape(),
    body("lname").exists().trim().escape(),
    body("street").exists().trim().escape(),
    body("state").exists().trim().escape(),
    body("city").exists().trim().escape(),
    body("zip_code").exists().trim().escape(),
    body("number").exists().trim().escape(),
    postController.checkOutAddFirstAddress
);

postRouter.post("/checkout/add-address", 
    body("fname").exists().trim().escape(),
    body("lname").exists().trim().escape(),
    body("street").exists().trim().escape(),
    body("state").exists().trim().escape(),
    body("city").exists().trim().escape(),
    body("zip_code").exists().trim().escape(),
    body("number").exists().trim().escape(),
     postController.checkOutAddAddress
    );

    // Update Shipping address review status
postRouter.post(
    "/update/checkout/address",
    body("address").exists().trim().escape(),
   postController.updateCheckOutAddress
);

// Remove an Item from Cart
postRouter.post(
    "/remove-cart",
    body("name").exists().trim().escape(),
    postController.removeItemFromCart
);



module.exports = postRouter