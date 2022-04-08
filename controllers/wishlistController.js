const wishlist = require("../models/wishlist");
const department = require("../department");

module.exports = (req, res) => {
    if (req.isAuthenticated()) {
        wishlist.find({ user: req.user.id }, (err, result) => {
            if (err) {
                console.log("Error occured here");
            } else {
                res.render("Account/saveditem", {
                    department,
                    search: null,
                    loggedIn: true,
                    wishlistArray: result,
                    csrfToken: req.csrfToken(),
                    name: `Saved Items | Market Nest`,
                });
            }
        });
    } else {
        res.redirect("/login");
    }
};