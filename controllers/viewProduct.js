const Products = require("../models/product");
const wishlist = require("../models/wishlist");
const department = require("../department");
const CryptoJS = require("crypto-js");

module.exports = (req, res) => {
    const product = req.params.customProduct;

    Products.findById(product, (err, result) => {
        if (err) {
            res.render("Error/404page");
            console.log(err);
        } else {
            const options = {
                maxAge: 1000 * 60 * 60 * 24 * 3,
                httpOnly: true,
                overwrite: true,
                secure: true,
            };
            if (req.cookies.rec_viewed === undefined) {
                const ciphertext = CryptoJS.AES.encrypt(product, '4vsykZzvcsxERXGli36zTxFWciTKGdbd').toString();
                const recent = [];
                recent.push(ciphertext);
                res.cookie("rec_viewed", recent, options);
            } else {
                const ciphertext = CryptoJS.AES.encrypt(product, '4vsykZzvcsxERXGli36zTxFWciTKGdbd').toString();
                const recent = req.cookies.rec_viewed;
                const existingItem = recent.findIndex((item) => {
                    const bytes = CryptoJS.AES.decrypt(item, '4vsykZzvcsxERXGli36zTxFWciTKGdbd');
                    const originalText = bytes.toString(CryptoJS.enc.Utf8);
                    return originalText === product;
                });
                if (existingItem >= 0) {
                    recent.splice(existingItem, 1)
                    recent.unshift(ciphertext);
                    res.cookie("rec_viewed", recent, options);
                } else {
                    if (recent.length >= 6) {
                        recent.shift();
                        recent.unshift(ciphertext);
                        res.cookie("rec_viewed", recent, options);
                    } else {
                        recent.unshift(ciphertext);
                        res.cookie("rec_viewed", recent, options);
                    }
                }
            }
            Products.findRandom({ Category: result.Category }, {}, { limit: 7 },
                (err, alternatives) => {
                    const youMayAlsoLike = alternatives.filter((item) => {
                        return item.id !== product;
                    });
                    if (result.Quantity > 0) {
                        if (req.isAuthenticated()) {
                            wishlist.find({ user: req.user.id, productId: result.id },
                                (err, found) => {
                                    if (err) {
                                        res.render("Error/404page");
                                        console.log(err);
                                    } else if (found.length === 0) {
                                        res.render("Product/product", {
                                            result,
                                            loggedIn: true,
                                            wishlist: true,
                                            department,
                                            search: null,

                                            inStock: true,
                                            youMayAlsoLike,
                                            csrfToken: req.csrfToken(),
                                            name: `${result.Name} | Market Nest`,
                                        });
                                    } else {
                                        res.render("Product/product", {
                                            result,
                                            inStock: true,
                                            loggedIn: true,
                                            wishlist: false,
                                            department,
                                            search: null,

                                            youMayAlsoLike,
                                            csrfToken: req.csrfToken(),
                                            name: `${result.Name} | Market Nest`,
                                        });
                                    }
                                }
                            );
                        } else {
                            res.render("Product/product", {
                                result,

                                loggedIn: false,
                                wishlist: true,
                                department,
                                search: null,
                                youMayAlsoLike,
                                csrfToken: req.csrfToken(),
                                inStock: true,
                                name: `${result.Name} | Market Nest`,
                            });
                        }
                    } else {
                        if (req.isAuthenticated()) {
                            wishlist.find({ user: req.user.id, productId: result.id },
                                (err, found) => {
                                    if (err) {
                                        res.render("Error/404page");
                                        console.log(err);
                                    } else if (found.length === 0) {
                                        res.render("Product/product", {
                                            result,
                                            loggedIn: true,
                                            wishlist: true,
                                            department,
                                            search: null,

                                            inStock: false,
                                            youMayAlsoLike,
                                            csrfToken: req.csrfToken(),
                                            name: `${result.Name} | Market Nest`,
                                        });
                                    } else {
                                        res.render("Product/product", {
                                            result,
                                            inStock: false,
                                            loggedIn: true,
                                            wishlist: false,
                                            department,
                                            search: null,

                                            youMayAlsoLike,
                                            csrfToken: req.csrfToken(),
                                            name: `${result.Name} | Market Nest`,
                                        });
                                    }
                                }
                            );
                        } else {
                            res.render("Product/product", {
                                result,

                                loggedIn: false,
                                wishlist: true,
                                department,
                                search: null,
                                youMayAlsoLike,
                                csrfToken: req.csrfToken(),
                                inStock: false,
                                name: `${result.Name} | Market Nest`,
                            });
                        }
                    }
                }
            );

        }
    });
};