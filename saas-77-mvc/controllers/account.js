const bcrypt = require('bcryptjs');
const capitalize = require('../utils/capitalizeWords');

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
            return res.redirect('/');
        }

        loadedUser = user;
        bcrypt.compare(password, user.password).then(isEqual => {

            if (!isEqual) {
                console.log("Here must return a pop up");
                return res.redirect('/');
            }
        
            req.session.authenticated = true;
            req.session.user = {
                id: loadedUser.id,
                name: loadedUser.name,
                surname: loadedUser.surname,
                username: loadedUser.email  
            }

            return res.redirect("/home");

        })
        .catch(err => {
            res.redirect('/')
        })
    })
}

exports.signUp = (req, res, next) => {

  const name = req.body.name;
  const surname = req.body.surname;
  const email = req.body.email;
  const password = req.body.password;
  const repeatedPassword = req.body.password;

  const nameCapitalized = capitalize(name);
  const surnameCapitalized = capitalize(surname);

    if (password === repeatedPassword) {
        models.Users.findOne({ where: { email: email } }).then((user) => {
            if (!user) {
                bcrypt.hash(password, 12).then((hashedPW) => {
                    const newUser = models.Users.create({
                        name: nameCapitalized,
                        surname: surnameCapitalized,
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
