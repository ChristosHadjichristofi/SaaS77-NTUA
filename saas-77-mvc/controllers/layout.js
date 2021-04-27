// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.getLanding = (req, res, next) => {

    res.render('landing.ejs', { pageTitle: "Landing Page" });

}

exports.getProfile = (req, res, next) => {

    res.render('profile.ejs', { pageTitle: "Profile Page" });

}

exports.getHome = (req, res, next) => {

    res.render('home.ejs', { pageTitle: "Home Page" });

}