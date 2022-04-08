const userVerification = require("../../models/userVerification.js");
const User = require("../../models/user");
const Products = require("../../models/product");
const Order = require("../../models/order.js");
const wishlist = require("../../models/wishlist");
const Cart = require("../../models/cart.js")
const department = require("../../department.js");
const CryptoJS = require("crypto-js");
const xss = require("xss")
const https = require("https");
const randomString = require("randomstring")

exports.signUp = (req, res) => {
    if (req.isAuthenticated()) {
  
        res.redirect("/");
    } else {
    
        res.render("Authentication/sign-up", {
            name: "Sign Up | Market Nest",
            message: [],
            warning: false,
            csrfToken: req.csrfToken(),
        });
    }
}

exports.resetPassword = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: false });
    }
}

exports.newPassword = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        if (Object.keys(req.query).length === 0) {
            res.send("You tried accessing this page without Requesting for a new password");
        } else {
            userVerification.findOne({ uniqueString: xss(req.query.id) }, (error, result) => {
                if (error) {
                    res.send("Invalid Verification Url!");
                } else {
                    if (result === null) {
                        res.send("Invalid Verification Url!")
                    } else {
                        if (new Date() > result.expiredAt) {

                            userVerification.deleteOne({ uniqueString: xss(req.body.d) }, (error, result) => {
                                if (error) {
                                    res.redirect("/")
                                } else {
                                    res.send("Link Expired")
                                }
                            })
                        } else {
                            res.render("Authentication/newPassword", {
                                name: "New Password",
                                error: false,
                                d: xss(req.query.id),
                                csrfToken: req.csrfToken(),
                            });
                        }
                    }
                }
            })
        }
    }
}

exports.verifyUser = (req, res) => {
    userVerification.findOne({ uniqueString: req.query.id },
        (err, userVerify) => {
            if (err) {
                res.redirect(302, "/sign-up");
            } else {
                if (userVerify === null) {
                    res.redirect("/login")
                } else {
                    User.findOne({ _id: userVerify.UserId }, (err, result) => {
                        if (err) {
                            res.redirect(302, "/")
                        } else {
                            if (result.verified === false) {
                                if (new Date() > result.expiredAt) {
                                    userVerification.deleteOne({ uniqueString: userVerify.uniqueString }, (error, result) => {
                                        if (error) {
                                            console.log(error);
                                            res.redirect("/")
                                        } else {
                                            User.deleteOne({ id: result.id }, (e, done) => {
                                                if (e) {
                                                    console.log(e);
                                                    res.redirect(302, "/")
                                                } else {
                                                    res.redirect("/sign-up")
                                                }
                                            })
                                        }
                                    })
                                } else {

                                    User.updateOne({ _id: result.id }, { verified: true },
                                        (err, done) => {
                                            if (err) {
                                                res.redirect(302, "/");
                                                throw err;
                                            } else {
                                                userVerification.deleteOne({ uniqueString: userVerify.uniqueString }, (error, result) => {
                                                    if (error) {
                                                        console.log(error);
                                                        res.redirect("/")
                                                    } else {
                                                        
                                                        res.render("Authentication/index", {
                                                            name: "Login | Market Nest",
                                                            message: [],
                                                            messages: "Account Verified!",
                                                            
                                                            csrfToken: req.csrfToken(),
                                                        });

                                                    }
                                                })


                                            }

                                        }
                                    );

                                }
                            }
                        }

                    });
                }
            }

        }
    );
};

exports.viewProduct = (req, res) => {
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
                const ciphertext = CryptoJS.AES.encrypt(product, process.env.RECENTLY_VIEWED_SECRET).toString();
                const recent = [];
                recent.push(ciphertext);
                res.cookie("rec_viewed", recent, options);
            } else {
                const ciphertext = CryptoJS.AES.encrypt(product, process.env.RECENTLY_VIEWED_SECRET).toString();
                const recent = req.cookies.rec_viewed;
                const existingItem = recent.findIndex((item) => {
                    const bytes = CryptoJS.AES.decrypt(item, process.env.RECENTLY_VIEWED_SECRET);
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

exports.viewBrand =  (req, res) => {
    const limit = 6;
    let page = xss(req.query.page);
    if (!page) {
        page = 1
    } else {
        page = parseInt(page);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    Products.find({ Brand: { $regex: xss(req.params.brand), $options: "i" } }, (err, Products) => {
        if (err) {
            res.redirect(302, "/")
        } else {
            if (Products.length <= 0) {
                res.redirect(302, "/")
            } else {
                const pagination = Products.slice(startIndex, endIndex)
                const totalPages = Math.ceil(Products.length / limit)

                if (req.isAuthenticated()) {
                    res.render("Product/brand", {
                        loggedIn: true,
                        brand: `${xss(req.params.brand)}`,
                        name: `${xss(req.params.brand)} | Market Nest`,
                        Products: pagination,
                        totalPages,
                        csrfToken: req.csrfToken(),
                        search: "",
                        totalProducts: Products.length,
                        department,

                    })
                } else {
                    res.render("Product/brand", {
                        loggedIn: false,
                        brand: `${xss(req.params.brand)}`,
                        name: `${xss(req.params.brand)} | Market Nest`,
                        Products: pagination,
                        totalPages,
                        csrfToken: req.csrfToken(),
                        department,
                        search: "",
                        totalProducts: Products.length
                    })
                }
            }
        }
    })
}

exports.login = (req, res) => {
    
    if (req.isAuthenticated()) {
        res.redirect("/account");
    } else {
        const messages = req.flash('messages')[0]
        const message = req.flash('message')
        res.render("Authentication/index", {
            name: "Login | Market Nest",
            message,
            messages,
            
            csrfToken: req.csrfToken(),
        });
    }
};

exports.userAccount =  (req, res) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                Order.find({ User: result.id }, (err, orders) => {
                    const totalorders = orders.length;
                    if (result.address.length === 0) {
                        res.render("Account/account", {
                            username: req.user.full_name,
                            loggedIn: true,
                            address: {},
                            department,
                            totalorders,
                            search: null,
                            csrfToken: req.csrfToken(),
                            email: req.user.email,
                            name: `Account | Market Nest`,
                        });
                    } else {
                        const defaultAddress = result.address.find((item) => {
                            return item.defaultAddress === "Yes";
                        });

                        res.render("Account/account", {
                            username: req.user.full_name,
                            loggedIn: true,
                            address: defaultAddress,
                            department,
                            totalorders,
                            search: null,
                            csrfToken: req.csrfToken(),
                            email: req.user.email,
                            name: `Account | Market Nest`,
                        });
                    }
                });
            }
        });
    } else {
        res.redirect("/login");
    }
}

exports.userAddress = (req, res) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (error, result) => {
            if (error) {
                res.redirect("/");
            } else {
                const addresses = result.address;
                res.render("Account/addressBook", {
                    department,
                    search: null,
                    loggedIn: true,
                    addresses,
                    csrfToken: req.csrfToken(),
                    name: `Addresses | Market Nest `,
                });
            }
        });
    } else res.redirect("/login");
}

exports.userOrder = (request, response) => {
    if (request.isAuthenticated()) {
        if (Object.keys(request.query).length === 0 || request.query.page) {
            const limit = 5;
            let page = xss(request.query.page);
            if (!page) {
                page = 1
            } else {
                page = parseInt(page);
            }

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            // check order collection
            Order.find({ User: request.user.id }, (err, result) => {
                if (err) {

                } else {
                    const pagination = result.slice(startIndex, endIndex)
                    const totalPages = Math.ceil(result.length / limit)
                    response.render("Account/order", {
                        department,
                        search: null,
                        loggedIn: true,
                        Orders: pagination,
                        csrfToken: request.csrfToken(),
                        name: `Orders | Market Nest `,
                        totalPages,


                    });
                }

            });
        } else {
            const txId = xss(request.query.trxref)
            const options = {
                hostname: "api.paystack.co",
                port: 443,
                path: `/transaction/verify/${txId}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_AUTH_ID}`,
                },
            };

            const req = https
                .request(options, (res) => {
                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        const message = JSON.parse(data);

                        if (message.status === true) {
                            if (message.data.status === "success") {
                                Cart.find({ User: request.user.id }, (err, cartItems) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        const subtotal = cartItems.reduce((sum, item) => {
                                            if (item.Sale === undefined) {
                                                return sum + item.Price * item.Quantity;
                                            } else {
                                                return sum + item.Sale * item.Quantity;
                                            }
                                        }, 0);
                                        const shipping = cartItems.reduce((sum, item) => {
                                            return sum + item.shippingfee;
                                        }, 0);

                                        const total = subtotal + shipping;
                                        //empty User's Cart
                                        Cart.deleteMany({ User: request.user.id }, (err) => {
                                            if (err) throw err;
                                            console.log("Removed From cart Collection");
                                        });

                                        User.findById(request.user.id, (err, result) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                const shippingAddress = result.address.find((item) => {
                                                    return item.defaultAddress === "Yes";
                                                });

                                                const names = cartItems.map((name) => {
                                                    return name.Name;
                                                });

                                                const images = cartItems.map((image) => {
                                                    return image.Image;
                                                });
                                                const ids = cartItems.map((id) => {
                                                    return id.ProductId;
                                                });

                                                const quantity = cartItems.map((item) => {
                                                    return item.Quantity;
                                                });
                                                const OrderId = randomString.generate({ length: 22 });

                                                const order = {
                                                    OrderId,
                                                    Name: names,
                                                    Image: images,
                                                    Total: total,
                                                    Quantity: quantity,
                                                    ProductId: ids,
                                                    User: request.user.id,
                                                    transactionId: txId,
                                                    subtotal,
                                                    shippingCost: shipping,
                                                    shippingAddress: {
                                                        firstName: shippingAddress.first_name,
                                                        lastName: shippingAddress.last_name,
                                                        street: shippingAddress.street,
                                                        state: shippingAddress.state,
                                                        city: shippingAddress.city,
                                                        zipcode: shippingAddress.zipcode,
                                                        number: shippingAddress.number,
                                                    },
                                                    orderStatus: 25,
                                                };

                                                //Update Product Quantity
                                                quantity.forEach((item, index) => {
                                                    Products.findOneAndUpdate({ _id: order.ProductId[index] }, {
                                                            $inc: { Quantity: -order.Quantity[index] },
                                                        },
                                                        (err, result) => {
                                                            console.log("Quantity Updated");
                                                        }
                                                    );
                                                });
                                                //   Update Cart Max Quantity
                                                quantity.forEach((item, index) => {
                                                    Products.findById(
                                                        order.ProductId[index],
                                                        (err, result) => {
                                                            Cart.updateMany({ ProductId: order.ProductId[index] }, {
                                                                    $set: { maxQuantity: result.Quantity },
                                                                },
                                                                (err) => {
                                                                    console.log("Cart Max Quantity Updated!");
                                                                }
                                                            );
                                                        }
                                                    );
                                                });

                                                //Add Cart items to Order Colllections
                                                Order.create(order, (err,orderCreated) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log(" Moved to Order Collection");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                                response.redirect("/customer/orders");
                            } else if (message.data.status === "failed") {
                                response.redirect("/cart.payment");
                            }
                        } else {
                            response.redirect("/cart.payment");
                        }
                    });
                })
                .on("error", (error) => {
                    console.error(error);
                    response.redirect("/cart.payment");
                    console.log("Error dey here");
                });

            req.end();
        }
    } else response.redirect("/login");
}

exports.userDeleteAddress =  (req, res) => {
    User.updateOne({ _id: req.user.id }, { $pull: { address: { _id: req.params.address } } },
        (err, result) => {
            res.redirect("/account/address-book");
        }
    );
}

exports.accountDetails = (req, res) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, result) => {
            if (result) {
                res.render("Account/profile", {
                    loggedIn: true,
                    result,
                    csrfToken: req.csrfToken(),
                    name: `${req.user.full_name} | Market Nest`,
                });
            }
        });
    } else {
        res.redirect("/login");
    }
}

exports.remoteItemWishList = (req, res) => {
    const deleteItem = req.params.item;
    wishlist.deleteOne({ user: req.user.id, productId: deleteItem }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Item Removed from Wishlist");
            res.redirect("/customer/wishlist");
        }
    });
}

exports.addItemToWishList =  (req, res) => {
    const wishlistItem = req.params.item;
    if (req.isAuthenticated()) {
        wishlist.find({ user: req.user.id, productId: wishlistItem },
            (err, itemFound) => {
                if (err) {
                    throw err;
                } else {
                    Products.findById(wishlistItem, (err, result) => {
                        const wishlistProduct = {
                            productId: result.id,
                            name: result.Name,
                            price: result.Price,
                            image: result.Image[0],
                            user: req.user.id,
                        };
                        wishlist.create(wishlistProduct, (err) => {
                            if (!err) {
                                console.log("Item added to wishlist ");
                                return res.redirect(302, `/product/${wishlistItem}`);
                            }
                        });
                    });
                }
            }
        );
    } else return res.redirect(302, `/login/?return=${req.originalUrl}`);
}

exports.updateUserPassword = (req, res) => {
    if (req.isAuthenticated()) {
        const message = req.flash('error')
        const notify = req.flash('notify')[0]
        res.render("Account/changePassword", {
            loggedIn: true,
            name: "Update Password | Market Nest",
            csrfToken: req.csrfToken(),
            message,
            notify,
        });
    } else {
        res.redirect("/login");
    }
}

exports.reviewOrder = (req, res) => {
    if (req.isAuthenticated()) {
        Cart.find({ User: req.user.id }, (err, foundCartItems) => {
            if (err) {
                res.redirect("/cart.payment");
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
                User.findById(req.user.id, (err, user) => {
                    if (user.address.length === 0) {
                        //display address field
                        res.render("Account/checkoutReview", {
                            loggedIn: true,
                            foundCartItems,
                            total,
                            shipping,
                            subtotal,
                            address: false,
                            user: req.user.email,
                            csrfToken: req.csrfToken(),
                            name: "Confirm Order| Market Nest",
                        });
                    } else {
                        //display all addresses
                        res.render("Account/checkoutReview", {
                            loggedIn: true,
                            foundCartItems,
                            total,
                            shipping,
                            subtotal,
                            address: user.address,
                            user: req.user.email,
                            csrfToken: req.csrfToken(),
                            name: "Confirm Order| Market Nest",
                        });
                    }
                });
            }
        });
    } else {
        res.redirect("/login");
    }
}

exports.logOut = (req, res) => {
    req.logout();
    res.redirect("/");
}