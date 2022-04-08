const User = require("../../models/user.js")
const userVerification = require("../../models/userVerification")
const Cart = require("../../models/cart.js")
const Products = require("../../models/product.js")
const locations = require("../../states")
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const CryptoJS = require("crypto-js");
const xss = require("xss");
const saltRounds = bcrypt.genSaltSync(10);


const options = {
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
    //secure: true,
};

exports.updateUserPassword = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/")
    } else {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("Authentication/newPassword", {
                name: "New Password",
                error: errors.array(),
                d: xss(req.body.d),
                csrfToken: req.csrfToken(),
            });
        } else {
            userVerification.findOne({ uniqueString: xss(req.body.d) }, (error, result) => {
                if (error) {
                    res.send("Invalid Verification Url!");
                } else {
                    User.findById(result.UserId, (err, user) => {
                        const hash = bcrypt.hashSync(req.body.newPassword, saltRounds);

                        User.updateOne({ _id: user.id }, { password: hash }, (err, done) => {
                            if (err) throw err;
                            else {
                                userVerification.deleteOne({ uniqueString: xss(req.body.d) }, (error, result) => {
                                    if (error) {
                                        res.redirect("/")
                                    } else {
                                        res.redirect("/login")
                                    }
                                })
                            }
                        });

                    })
                }
            })
        }
    }
}

exports.updateUserPasswordLoggedIn = (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array())
            res.redirect("/update/password")
            
        } else {
            User.findById(req.user.id, (err, result) => {
                bcrypt.compare(
                    req.body.currentPassword,
                    result.password,
                    (err, found) => {
                        if (found) {
                            const hash = bcrypt.hashSync(req.body.newPassword, saltRounds);
                            User.updateOne({ _id: req.user.id }, { password: hash },
                                (err, done) => {
                                    if (err) throw err;
                                    else {
                                        req.flash('notify', 'Password Changed Successfully.')
                                        res.redirect("/update/password");
                                    }
                                }
                            );

                        } else {
                            req.flash('notify', 'Current Password does not match')
                            res.redirect("/update/password");
                        }
                    }
                );
            });
        }
    } else {
        res.redirect("/login");
    }
}

exports.updateUserInformation = (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/account/details")
        } else {
            User.updateOne({ _id: req.user.id }, {
                    firstName: xss(req.body.fname),
                    lastName: xss(req.body.lname),
                    birthDay: xss(req.body.dob),
                    mobileNumber: xss(req.body.number),
                },
                (err, done) => {
                    if (err) {
                        res.redirect("/account/details")
                        throw err;
                    } else {
                        console.log("Updated!");
                        res.redirect("/usr/account");
                    }

                }
            );
        }

    } else {
        res.redirect("/login");
    }
}

exports.addUserAddress = (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/account/address-book")
        } else {
            const daddress = {
                first_name: xss(req.body.fname),
                last_name: xss(req.body.lname),
                street: xss(req.body.street),
                state: xss(req.body.state),
                city: xss(req.body.city),
                zipcode: xss(req.body.zip_code),
                number: xss(req.body.number),
                defaultAddress: "Yes",
            };

            const address = {
                first_name: xss(req.body.fname),
                last_name: xss(req.body.lname),
                street: xss(req.body.street),
                state: xss(req.body.state),
                city: xss(req.body.city),
                zipcode: xss(req.body.zip_code),
                number: xss(req.body.number),
                defaultAddress: "No",
            };
            User.findById(req.user.id, (err, result) => {
                if (result.address.length === 0) {
                    User.findByIdAndUpdate(
                        req.user.id, { $push: { address: daddress } },
                        (err, found) => {
                            res.redirect("/account/address-book");
                        }
                    );
                } else {
                    User.findByIdAndUpdate(
                        req.user.id, { $push: { address: address } },
                        (err, found) => {
                            res.redirect("/account/address-book");
                        }
                    );
                }
            });
        }

    } else {
        res.redirect("/login");
    }
}

exports.editDefaultAddress =   (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/account/address-book")
        } else {
            const state = locations.findIndex(state => {
                return state === xss(req.body.state)
            })

            if (state < 0) {
                res.redirect("/account/address-book");
            } else {
                const updateAddress = {
                    first_name: xss(req.body.fname),
                    last_name: xss(req.body.lname),
                    street: xss(req.body.street),
                    state: xss(req.body.state),
                    city: xss(req.body.city),
                    zipcode: xss(req.body.zip_code),
                    number: xss(req.body.number),
                    defaultAddress: "Yes",
                };
                User.updateOne({
                        _id: req.user._id,
                        "address._id": { $eq: `${req.params.address}` },
                    }, { $set: { "address.$": updateAddress } },
                    (err, found) => {
                        if (err) {

                            console.log(err);
                            res.redirect("/account/address-book");
                        } else res.redirect("/account/address-book");
                    }
                );
            }
        }
    } else {
        res.redirect("/login");
    }
}

exports.editAddress =  (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/account/address-book")
        } else {
            const state = locations.findIndex(state => {
                return state === xss(req.body.state)
            })

            if (state < 0) {
                res.redirect("/account/address-book");
            } else {
                const updateAddress = {
                    first_name: xss(req.body.fname),
                    last_name: xss(req.body.lname),
                    street: xss(req.body.street),
                    state: xss(req.body.state),
                    city: xss(req.body.city),
                    zipcode: xss(req.body.zip_code),
                    number: xss(req.body.number),
                    defaultAddress: "No",
                };

                User.updateOne({
                        _id: req.user._id,
                        "address._id": { $eq: `${req.params.address}` },
                    }, { $set: { "address.$": updateAddress } },
                    (err, found) => {
                        if (err) {
                            console.log(err);
                        } else res.redirect("/account/address-book");
                    }
                );
            }
        }

    } else {
        res.redirect("/login");
    }
}

exports.setDefaultAddress =  (req, res) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect("/account/address-book")
            } else {
                const oldDef = result.address.find((item) => {
                    return item.defaultAddress === "Yes";
                });
                const newDef = result.address.find((item) => {
                    return item.id === req.params.newDefault;
                });

                User.updateOne({
                        _id: req.user._id,
                        "address._id": { $eq: `${oldDef.id}` },
                    }, { $set: { "address.$.defaultAddress": "No" } },
                    (err, found) => {
                        if (err) {
                            console.log(err);
                            res.redirect("/account/address-book")
                        }
                    }
                );
                User.updateOne({
                        _id: req.user._id,
                        "address._id": { $eq: `${newDef.id}` },
                    }, { $set: { "address.$.defaultAddress": "Yes" } },
                    (err, found) => {
                        if (err) {
                            console.log(err);
                            res.redirect("/account/address-book")
                        } else res.redirect("/account/address-book");
                    }
                );
            }
        });
    } else {
        res.redirect("/login");
    }
}

exports.addToCart =   (req, res) => {
    const product = req.params.customProduct;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect(302, `/product/${req.params.customProduct}`);
    } else {
        if (req.isAuthenticated()) {
            Products.findById(product, (err, result) => {
                if (err) {
                    console.log(err);
                    res.redirect("/");
                } else {
                    const cartItem = {
                        ProductId: result.id,
                        Name: result.Name,
                        Image: result.Image[0],
                        Price: result.Price,
                        Sale: result.Sale,
                        Discount: result.Discount,
                        User: req.user.id,
                        Quantity: xss(req.body.quantity),
                        maxQuantity: result.Quantity,
                        shippingfee: result.DeliveryCost,
                    };

                    Cart.findOne({ ProductId: result.id, User: req.user.id },
                        (err, foundCartItem) => {
                            if (err) {
                                res.redirect("/");
                            } else if (foundCartItem) {
                                //if User quantity is more than Max quantity then Update to Max Quantity
                                if (Number(xss(req.body.quantity)) >= foundCartItem.maxQuantity) {
                                    Cart.updateOne({ _id: foundCartItem.id }, { Quantity: foundCartItem.maxQuantity },
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                                res.redirect("/");
                                            } else {
                                                res.redirect("/cart.payment");
                                            }

                                        }
                                    );
                                } else {
                                    Cart.updateOne({ _id: foundCartItem.id }, { $inc: { Quantity: xss(req.body.quantity) } },
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                                res.redirect("/");
                                            } else {
                                                res.redirect("/cart.payment");
                                            }
                                        }
                                    );
                                }
                            } else {
                                Cart.create(cartItem, (err, done) => {
                                    if (err) {
                                        console.log(err);
                                        res.redirect("/");
                                    } else {
                                        res.redirect("/cart.payment");
                                    }
                                });
                            }
                        }
                    );
                }
            });
        } else {

            Products.findById(product, (err, result) => {
                if (err) {
                    console.log(err);
                    res.clearCookie("cart");
                    res.redirect("/cart.payment");
                } else {
                    const id = CryptoJS.AES.encrypt(result.id, process.env.RECENTLY_VIEWED_SECRET).toString();

                    const productDetails = {
                        d: id,
                        Q: xss(req.body.quantity),
                        mQ: result.Quantity,
                    };

                    if (req.cookies.cart === undefined) {
                        const cart = [];
                        cart.push(productDetails);
                        res.cookie("cart", cart, options);
                    } else {
                        const cart = req.cookies.cart;
                        const existingCartItem = cart.findIndex((cartItem) => {
                            const bytes = CryptoJS.AES.decrypt(cartItem.d, process.env.RECENTLY_VIEWED_SECRET);
                            const originalText = bytes.toString(CryptoJS.enc.Utf8);
                            return originalText === result.id;
                        });

                        if (existingCartItem >= 0) {
                            cart[existingCartItem].mQ = result.Quantity;
                            res.cookie("cart", cart, options);
                        } else {
                            cart.push(productDetails);
                            res.cookie("cart", cart, options);
                        }
                    }

                    res.redirect(`/cart.payment`);
                }
            });
        }
    }
}

exports.updateItemQuanitityCart =  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect("/cart.payment");
    } else {
        if (req.isAuthenticated()) {

            const id = xss(req.params.product);
            const quantity = xss(req.body.quantity);
            Cart.findOne({ ProductId: id, User: req.user.id }, (err, cart) => {
                if (err) {
                    res.redirect("/cart.payment");
                } else {
                    if (Number(quantity) <= 0) {
                        res.redirect("/cart.payment");
                    } else {
                        if (Number(quantity) >= cart.maxQuantity) {
                            Cart.updateOne({ _id: cart.id, User: cart.User }, { $set: { Quantity: cart.maxQuantity } },
                                (err) => {
                                    res.redirect("/cart.payment");
                                }
                            );
                        } else {
                            Cart.updateOne({ _id: cart.id, User: cart.User }, { $set: { Quantity: xss(req.body.quantity) } },
                                (err) => {
                                    res.redirect("/cart.payment");
                                }
                            );
                        }
                    }
                }

            });
        } else {

            const cart = req.cookies.cart;
            const existingCartItem = cart.findIndex((cartItem) => {
                const bytes = CryptoJS.AES.decrypt(cartItem.d, process.env.RECENTLY_VIEWED_SECRET);
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText === req.params.product;
            });

            Products.findById(req.params.product, (err, found) => {
                if (err) {
                    // Clear Cookies and redirect to epmty cart
                    res.clearCookie("cart");
                    res.redirect("/cart.payment");
                } else {
                    cart[existingCartItem].Q = Number(xss(req.body.quantity));
                    cart[existingCartItem].mQ = found.Quantity;
                    res.cookie("cart", cart, options);
                    res.redirect("/cart.payment");
                }
            });
        }
    }

}

exports.checkOutAddFirstAddress = (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/pay.marketnest/confirm/order");
        } else {
            const state = locations.findIndex(state => {
                return state === xss(req.body.state)
            })


            if (state < 0) {
                res.redirect("/pay.marketnest/confirm/order");
            } else {
                const address = {
                    first_name: xss(req.body.fname),
                    last_name: xss(req.body.lname),
                    street: xss(req.body.street),
                    state: xss(req.body.state),
                    city: xss(req.body.city),
                    zipcode: xss(req.body.zip_code),
                    number: xss(req.body.number),
                    defaultAddress: "Yes",
                };

                User.findByIdAndUpdate(
                    req.user.id, { $push: { address: address } },
                    (err, found) => {
                        res.redirect("/pay.marketnest/confirm/order");
                    }
                );
            }
        }

    } else {
        res.redirect("/login");
    }
}

exports.checkOutAddAddress = (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("/pay.marketnest/confirm/order");
        } else {
            const state = locations.findIndex(state => {
                return state === xss(req.body.state)
            })

            if (state < 0) {
                res.redirect("/pay.marketnest/confirm/order");
            } else {
                const address = {
                    first_name: xss(req.body.fname),
                    last_name: xss(req.body.lname),
                    street: xss(req.body.street),
                    state: xss(req.body.state),
                    city: xss(req.body.city),
                    zipcode: xss(req.body.zip_code),
                    number: xss(req.body.number),
                    defaultAddress: "No",
                };

                User.findByIdAndUpdate(
                    req.user.id, { $push: { address: address } },
                    (err, found) => {
                        res.redirect("/pay.marketnest/confirm/order");
                    }
                );
            }
        }

    } else {
        res.redirect("/login")
    }

}

exports.updateCheckOutAddress =  (req, res) => {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("back")
        } else {
            if (xss(req.body.address) === undefined) {
                res.redirect("/pay.marketnest/confirm/order")
            } else {
                User.findById(req.user.id, (err, result) => {
                    if (err) {
                        res.redirect("/cart.payment")
                    } else {
                        const oldDef = result.address.find((item) => {
                            return item.defaultAddress === "Yes";
                        });
                        const newDef = result.address.find((item) => {
                            return item.id === xss(req.body.address);
                        });

                        User.updateOne({
                                _id: req.user._id,
                                "address._id": { $eq: `${oldDef.id}` },
                            }, { $set: { "address.$.defaultAddress": "No" } },
                            (err, found) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                        User.updateOne({
                                _id: req.user._id,
                                "address._id": { $eq: `${newDef.id}` },
                            }, { $set: { "address.$.defaultAddress": "Yes" } },
                            (err, found) => {
                                if (err) {
                                    console.log(err);
                                } else res.redirect("/pay.marketnest/confirm/order");
                            }
                        );
                    }
                });
            }
        }

    } else {
        res.redirect("/login");
    }
}

exports.removeItemFromCart = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect("/cart.payment");

    } else {
        const id = xss(req.body.name);

        if (req.isAuthenticated()) {
            Cart.findByIdAndRemove(id, (err) => {
                if (err) {
                    res.redirect("/cart.payment");
                    console.log(err);
                } else {
                    console.log("Item Removed from Cart");
                    res.redirect("/cart.payment");
                }
            });
        } else {

            const foundItem = req.cookies.cart.findIndex((item) => {
                const bytes = CryptoJS.AES.decrypt(item.d, process.env.RECENTLY_VIEWED_SECRET);
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText === id;
            });
            const newCookie = req.cookies.cart.splice(foundItem, 1);
            res.cookie("cart", req.cookies.cart, options);
            res.redirect("/cart.payment");
        }
    }

}