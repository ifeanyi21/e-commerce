require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const department = require("./department");
const searchdepartment = require("./searchdepartment");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const https = require("https");
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const flash = require('connect-flash');
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash());
app.disable("x-powered-by");

app.use(csrf({cookie:true}))

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    res.status(403)
    res.send('Invalid CSRF TOKEN')
  })


app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.set('trust proxy', 1);


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const conn = mongoose.connect(
    process.env.DB_URL, { useNewUrlParser: true },
    (err) => {
        if (err) throw err;
        console.log("Database Connected...");
    }
);

var store = new MongoDBStore({
    uri: process.env.DB_URL,
});
// Catch errors
store.on("error", function(error) {
    console.log(error);
});

// Database Collecetions
const User = require("./models/user");
const Products = require("./models/product");
const Cart = require("./models/cart");


app.use(
    session({
        secret: process.env.SESSION_COOKIE,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 1,
            httpOnly: true,
            //secure: true,
        },
    })
);

const csrfProtection = csrf({ cookie: true, });

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        User.findOne({ email }, (err, result) => {
            if (!result) {
                return done(null, false, {
                    messages: "Incorrect Email Address",
                });
            } else {
                bcrypt.compare(password, result.password, (err, found) => {
                    if (found) {
                        if (result.verified === false) {
                            return done(null, false, {
                                messages: "Account Not verified!",
                            });
                        } else {
                            return done(null, result, found);
                        }
                    } else {
                        return done(null, false, {
                            messages: "Incorrect Password",
                        });
                    }
                });
            }
        });
    })
);


passport.use(
    new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://market-nest.herokuapp.com/auth/google/account",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
            profileFields: ["emails"],
        },
        (accessToken, refreshToken, profile, cb) => {
            User.findOrCreate({
                    googleId: profile.id,
                    full_name: profile._json.name,
                    email: profile._json.email,
                },
                function(err, user) {

                    if (err !== null) {
                        return cb(null, false, {
                            messages: "There was an error",
                        });
                    } else {
                        return cb(err, user);
                    }


                }
            );
        }
    )
);


app.get("/auth/google", passport.authenticate("google", { scope: ["email"], failureRedirect: "/login" }));

app.get(
    "/auth/google/account",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
        res.redirect("/usr/account");
    }
);


const routes = require("./routes/index.js")
const postRoutes = require("./routes/postRoute.js")

app.use(routes)
app.use(postRoutes)

// Logout
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// paystack
app.post(
    "/transaction/initialize",
    csrfProtection,
    function(err, req, res, next) {
        if (err.code !== "EBADCSRFTOKEN") return next(err);
        res.status(403);
        res.redirect("/cart.payment");
    },
    (request, response) => {
        if (request.isAuthenticated()) {
            Cart.find({ User: request.user.id }, (err, foundCartItems) => {
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
                    const koboValue = total * 100;
                    if (koboValue === Number(xss(request.body.amount))) {
                        const params = JSON.stringify({
                            email: `${xss(request.body.user_email)}`,
                            amount: koboValue,
                        });
                        const options = {
                            hostname: "api.paystack.co",
                            port: 443,
                            path: "/transaction/initialize",
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${process.env.PAYSTACK_AUTH_ID}`,
                                "Content-Type": "application/json",
                            },
                        };

                        const req = https
                            .request(options, (res) => {
                                let data = "";
                                res.on("data", (chunk) => {
                                    data += chunk;
                                });

                                res.on("end", () => {
                                    const body = JSON.parse(data);

                                    const accessCode = body.data.access_code;
                                    response.redirect(
                                        `https://checkout.paystack.com/${accessCode}`
                                    );
                                });
                            })
                            .on("error", (error) => {
                                console.error(error);
                                response.redirect("/cart.payment");
                                console.log("Error dey here o");
                            });

                        req.write(params);
                        req.end();
                    } else {
                        response.redirect("/cart.payment");
                    }
                }
            });
        } else {
            response.redirect("/login");
        }
    }
);

// autocomplete
app.get("/auto", async(request, response) => {
    const searchField = xss(request.query.term)
    const result = await Products.aggregate([{
        '$search': {
            'index': 'Autocomplete',
            'autocomplete': {
                'query': `${searchField}`,
                'path': "Name",
                "fuzzy": {
                    "maxEdits": 2,
                    "prefixLength": 3
                }
            }
        }
    }])

    response.send(result)
})

// Search Api
app.get("/sch/itm", csrfProtection, async(req, res) => {
    const limit = 4;
    let page = xss(req.query.page);
    if (!page) {
        page = 1
    } else {
        page = parseInt(page);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const searchField = xss(req.query.search)
    const category = xss(req.query.cat)

    if (searchField && category) {
        Products.find({
                Name: { $regex: searchField, $options: "i" },
                Category: { $eq: category },
            },
            (err, found) => {
                if (err) {
                    console.log(err);
                } else {
                    const pagination = found.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(found.length / limit)
                    if (req.isAuthenticated()) {
                        res.render("Homepage/searchPage", {
                            found: pagination,
                            totalPages,
                            totalProducts: found.length,
                            query: `/sch/itm/?search=${searchField}&cat=${category}`,
                            loggedIn: true,
                            department,
                            searchdepartment,
                            category: null,
                            search: searchField,
                            csrfToken: req.csrfToken(),
                            name: `${searchField} | Market Nest `,
                        });
                    } else {
                        res.render("Homepage/searchPage", {
                            found: pagination,
                            totalPages,
                            totalProducts: found.length,
                            query: `/sch/itm/?search=${searchField}&cat=${category}`,
                            loggedIn: false,
                            department,
                            searchdepartment,
                            search: searchField,
                            csrfToken: req.csrfToken(),
                            category: null,
                            name: `${searchField} | Market Nest `,
                        });
                    }
                }
            }
        );
    } else if (searchField) {
        Products.find({ Name: { $regex: searchField, $options: "i" } },
            (err, found) => {
                if (err) {
                    console.log(err);
                } else {
                    const pagination = found.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(found.length / limit)
                    if (req.isAuthenticated()) {
                        res.render("Homepage/searchPage", {
                            found: pagination,
                            totalPages,
                            totalProducts: found.length,
                            query: `/sch/itm/?search=${searchField}`,
                            loggedIn: true,
                            department,
                            searchdepartment,
                            search: searchField,
                            csrfToken: req.csrfToken(),
                            category: null,
                            name: `${searchField} | Market Nest `,

                        });
                    } else {
                        res.render("Homepage/searchPage", {
                            found: pagination,
                            totalPages,
                            totalProducts: found.length,
                            query: `/sch/itm/?search=${searchField}`,
                            loggedIn: false,
                            department,
                            searchdepartment,
                            search: searchField,
                            csrfToken: req.csrfToken(),
                            category: null,
                            name: `${searchField} | Market Nest `,
                        });
                    }
                }
            }
        );
    } else if (category) {
        Products.find({ Category: { $eq: category } }, (err, found) => {
            if (err) {
                console.log(err);
            } else {
                const pagination = found.slice(startIndex, endIndex);
                const totalPages = Math.ceil(found.length / limit)
                if (req.isAuthenticated()) {
                    res.render("Homepage/searchPage", {
                        found: pagination,
                        totalPages,
                        totalProducts: found.length,
                        query: `/sch/itm/?cat=${category}`,
                        loggedIn: true,
                        department,
                        searchdepartment,
                        csrfToken: req.csrfToken(),
                        search: null,
                        category: department[category],
                        name: `${department[category]} | Market Nest `,
                    });
                } else {
                    res.render("Homepage/searchPage", {
                        found: pagination,
                        totalPages,
                        totalProducts: found.length,
                        query: `/sch/itm/?cat=${category}`,
                        loggedIn: false,
                        department,
                        searchdepartment,
                        search: null,
                        csrfToken: req.csrfToken(),
                        category: department[category],
                        name: `${department[category]} | Market Nest `,
                    });
                }
            }
        });
    }
});

app.post(
    "/sch/itm/",
    csrfProtection,
    function(err, req, res, next) {
        if (err.code !== "EBADCSRFTOKEN") return next(err);
        res.status(403);
        res.redirect("/");
    },
    body("search").exists().trim().escape(),
    body("department").exists().trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect("back")
        } else {
            const category = Number(xss(req.body.department));
            const searchField = xss(req.body.search);


            if (searchField.length === 0 && category === 0) {
                res.redirect("/");
            } else if (category > 0 && searchField.length > 0) {
                Products.find({
                        Name: { $regex: searchField, $options: "i" },
                        Category: { $eq: category },
                    },
                    (err, found) => {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.redirect(302, `/sch/itm/?search=${searchField}&cat=${category}`);
                        }
                    }
                );
            } else if (searchField.length > 0 && category === 0) {
                Products.find({ Name: { $regex: searchField, $options: "i" } },
                    (err, found) => {
                        if (err) {
                            console.log(err);
                        } else {


                            res.redirect(302, `/sch/itm/?search=${searchField}`);
                        }
                    }
                );
            } else if (category > 0 && searchField.length === 0) {
                Products.find({ Category: { $eq: category } }, (err, found) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect(302, `/sch/itm/?cat=${category}`);
                    }
                });
            }
        }

    }
);


// Login
app.post(
    "/login",
    csrfProtection,
    function(err, req, res, next) {
        if (err.code !== "EBADCSRFTOKEN") return next(err);
        res.status(403);
        res.redirect("/login");
    },
    body("email", "Invalid email").isEmail().normalizeEmail().exists().trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("message",errors.array())
            res.redirect("/login")
        } else {
            next();
        }
    },
    (request, response, next) => {
        passport.authenticate("local", (err, found, user) => {
            if (!found) {
                if (user.messages === "Incorrect Email Address") {
                    request.flash('messages','No Account Registered With Email Provided')
                    response.redirect('/login')
                }
                if (user.messages === "Incorrect Password") {
                    request.flash('messages','Incorrect Password')
                    response.redirect('/login')
                }
                if(user.messages === 'Account Not verified!') {
                    request.flash('messages','Account not verified. Kindly Check Your Inbox/Spam folder')
                    response.redirect('/login')                    
                }
            } else {
                if (user) {
                    request.logIn(found, function(err) {
                        return response.redirect("/");
                    });
                }
            }
        })(request, response, next);
    }
);


let port = process.env.PORT;
if (port === undefined || port === "") {
    port = 7000;
}
app.listen(port, () => {
    console.log("Server on", port);
});