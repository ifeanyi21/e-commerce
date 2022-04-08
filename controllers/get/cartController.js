const department = require("../../department.js");
const Cart = require("../../models/cart");
const product = require("../../models/product");
const CryptoJS = require("crypto-js");

module.exports = async(req, res) => {
    if (req.isAuthenticated()) {
        if (req.cookies.cart === undefined) {
            Cart.find({ User: req.user.id }, (err, foundCartItems) => {
                if (err) {
                    console.log(err);
                } else {
                    const subtotal = foundCartItems.reduce((sum, item) => {
                        if (item.Sale === undefined) {
                            return sum + item.Price * item.Quantity;
                        } else {
                            return sum + item.Sale * item.Quantity;
                        }
                    }, 0);
                    const shipping = foundCartItems.reduce((sum, item) => {
                        return sum + item.shippingfee;
                    }, 0);

                    const total = subtotal + shipping;
                    res.render("Cart/cart", {
                        loggedIn: true,
                        foundCartItems,
                        subtotal,
                        user: req.user.email,
                        department,
                        search: null,
                        shipping,
                        total,
                        csrfToken: req.csrfToken(),
                        name: `Cart | Market Nest`,
                    });
                }
            });
        } else {
            req.cookies.cart.forEach((item) => {
                const bytes = CryptoJS.AES.decrypt(item.d, process.env.RECENTLY_VIEWED_SECRET);
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                product.findById(originalText, (err, product) => {
                    if (err) {
                        res.clearCookie("cart");
                        //res.redirect("/cart.payment");
                    } else {
                        Cart.findOne({ ProductId: product.id, User: req.user.id }, (error, found) => {
                            if (error) {
                                console.log(error);
                            } else {
                                if (found !== null) {
                                    const newQuantity = found.Quantity + Number(item.Q)
                                    Cart.updateOne({ ProductId: product.id, User: req.user.id }, { Quantity: newQuantity },
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                                res.redirect("/");
                                            } else {
                                                console.log("Quantity updated successfully");
                                            }

                                        }
                                    );


                                } else {
                                    const cartItem = {
                                        ProductId: product.id,
                                        Name: product.Name,
                                        Image: product.Image[0],
                                        Price: product.Price,
                                        Sale: product.Sale,
                                        Discount: product.Discount,
                                        User: req.user.id,
                                        Quantity: item.Q,
                                        maxQuantity: product.Quantity,
                                        shippingfee: product.DeliveryCost,
                                    };
                                    Cart.create(cartItem, (err) => {
                                        console.log("Cookie content added to cart");
                                    });

                                }

                            }
                        })




                    }
                });
            });
            res.clearCookie("cart");
            res.redirect("/cart.payment");
        }
    } else {
        if (req.cookies.cart === undefined) {
            res.render("Cart/cart", {
                loggedIn: false,
                foundCartItems: [],
                total: 0,
                department,
                search: null,
                csrfToken: req.csrfToken(),
                name: `Cart | Market Nest`,
            });
        } else {
            if (typeof req.cookies.cart !== "object") {
                res.clearCookie("cart");
                res.redirect("/cart.payment");
            } else {
                const data = req.cookies.cart.map(function(item) {
                    const bytes = CryptoJS.AES.decrypt(item.d, process.env.RECENTLY_VIEWED_SECRET);
                    const originalText = bytes.toString(CryptoJS.enc.Utf8);
                    return product
                        .findOne({
                            _id: originalText,
                        })
                        .then(function(results) {
                            return results;
                        })
                        .catch((err) => {
                            res.clearCookie("cart");
                            //res.redirect("/cart.payment");
                        });
                });
                Promise.all(data)
                    .then(function(results) {
                        const cartData = results.map((item, index) => {
                            return (cartItem = {
                                ProductId: item.id,
                                Name: item.Name,
                                Image: item.Image[0],
                                Price: item.Price,
                                Sale: item.Sale,
                                Discount: item.Discount,
                                Quantity: req.cookies.cart[index].Q,
                                maxQuantity: item.Quantity,
                                shipping: item.DeliveryCost,
                            });
                        });

                        const subtotal = cartData.reduce((sum, item) => {
                            if (item.Sale === undefined) {
                                return sum + item.Price * item.Quantity;
                            } else {
                                return sum + item.Sale * item.Quantity;
                            }
                        }, 0);
                        const shipping = cartData.reduce((sum, item) => {
                            return sum + item.shipping;
                        }, 0);

                        const total = subtotal + shipping;

                        res.render("Cart/cart", {
                            loggedIn: false,
                            foundCartItems: cartData,
                            subtotal,
                            shipping,
                            total,
                            department,
                            search: null,
                            csrfToken: req.csrfToken(),
                            name: `Cart | Market Nest`,
                        });
                    })
                    .catch((err) => {
                        res.redirect("/cart.payment");
                        //res.clearCookie("cart");

                    });
            }


        }
    }
};