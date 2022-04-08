const Products = require("../../models/product");
const department = require("../../department");
const CryptoJS = require("crypto-js");

module.exports = (req, res) => {
    
    Promise.all([
            Products.find({ Category: { $eq: 4 } }).limit(5),
            Products.find({ Sale: { $gt: 0 } }).limit(5),
            Products.find({ Category: { $eq: 6 } }).limit(5),
        ])
        .then(([mobilePhones, Deals, Audio]) => {
            if (req.isAuthenticated()) {
                if (req.cookies.rec_viewed === undefined) {
                    res.render("Homepage/home", {
                        department,
                        loggedIn: true,
                        result: [mobilePhones, Deals, Audio],
                        titles: ["Mobile Phones ", "Deals", "Audio"],
                        name: "Market Nest",
                        search: null,
                        csrfToken: req.csrfToken(),
                        recent: [],
                    });
                } else {
                    const data = req.cookies.rec_viewed.map(function(item) {

                        const bytes = CryptoJS.AES.decrypt(item, process.env.RECENTLY_VIEWED_SECRET);
                        const originalText = bytes.toString(CryptoJS.enc.Utf8);
                        return Products
                            .findOne({
                                _id: originalText,
                            })
                            .then(function(results) {
                                return results;
                            })
                            .catch((err) => {
                                res.clearCookie("rec_viewed");
                                //res.redirect("/");
                            });
                    });

                    Promise.all(data)
                        .then(function(results) {
                            const recentData = results.map((item, index) => {
                                return (recentItem = {
                                    id: item.id,
                                    Name: item.Name,
                                    Price: item.Price,
                                    Sale: item.Sale,
                                    Discount: item.Discount,
                                    Image: item.Image[0],
                                });
                            });
                            res.render("Homepage/home", {
                                department,
                                csrfToken: req.csrfToken(),
                                loggedIn: true,
                                result: [mobilePhones, Deals, Audio],
                                titles: [
                                    "Mobile Phones ",
                                    "Deals",
                                    "Audio",
                                ],
                                search: null,
                                name: "Market Nest",
                                recent: recentData,
                            });
                        })
                        .catch((err) => {
                            //res.clearCookie("rec_viewed");
                            res.redirect("/");
                        });
                }
            } else {

                if (req.cookies.rec_viewed === undefined) {
                    res.render("Homepage/home", {
                        department,
                        loggedIn: false,
                        result: [mobilePhones, Deals, Audio],
                        titles: ["Mobile Phones ", "Deals", "Audio"],
                        csrfToken: req.csrfToken(),
                        name: "Market Nest",
                        search: null,
                        recent: [],
                    });
                } else {
                    const data = req.cookies.rec_viewed.map(function(item) {
                        const bytes = CryptoJS.AES.decrypt(item, process.env.RECENTLY_VIEWED_SECRET);
                        const originalText = bytes.toString(CryptoJS.enc.Utf8);
                        return Products
                            .findOne({
                                _id: originalText,
                            })
                            .then(function(results) {
                                return results;
                            })
                            .catch((err) => {;
                                res.clearCookie("rec_viewed");
                                //res.redirect("/");
                            });
                    });

                    Promise.all(data)
                        .then(function(results) {

                            const recentData = results.map((item) => {
                                return (recentItem = {
                                    id: item.id,
                                    Name: item.Name,
                                    Price: item.Price,
                                    Sale: item.Sale,
                                    Discount: item.Discount,
                                    Image: item.Image[0],
                                });
                            });
                            res.render("Homepage/home", {
                                department,
                                loggedIn: false,
                                result: [mobilePhones, Deals, Audio],
                                titles: [
                                    "Mobile Phones ",
                                    "Deals",
                                    "Audio",
                                ],
                                search: null,
                                name: "Market Nest",
                                csrfToken: req.csrfToken(),
                                recent: recentData,
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.clearCookie("rec_viewed");
                            res.redirect("/");
                        });
                }
            }
        })
        .catch((err) => {
            res.clearCookie("rec_viewed");
            res.redirect("/")
        });
};