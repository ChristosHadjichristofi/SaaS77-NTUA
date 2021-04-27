const bcrypt = require('bcryptjs');

// require models
const sequelize = require("../utils/database");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.signIn = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    models.Users.findOne({ where: { email: email } })
    .then(user => {
        if (!user) {
            console.log("Here must return a pop up");
            return;
        }

        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then (isEqual => {

        if (!isEqual) {
            console.log("Here must return a pop up");
            return;
        }

        req.session.authenticated = true;
        req.session.userID = loadedUser.id;

        return res.redirect("/home");
    })
 
}

exports.signUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const repeatedPassword = req.body.password;

    if (password === repeatedPassword) {
        models.Users.findOne({ where: { email: email } }).then((user) => {
            if (!user) {
                bcrypt.hash(password, 12).then((hashedPW) => {
                    const newUser = models.Users.create({
                        email: email,
                        password: hashedPW,
                    });
                
                    return res.redirect("/");
                });
            }
            else {
                console.log('Here must place a notification like error pop up window!');
                return res.redirect("/");
            }
        });
    } 
    else {
        console.log("Here must place a notification like error pop up window!");
        return res.redirect("/");
    }
};

exports.signOut = (req, res) => { 
    req.session.destroy(err => {
        res.redirect('/');
    });
}
