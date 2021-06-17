const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = (req, res, next) => {

    /* Sign in has body of { email: email, password: password } */
    const email = req.body.email;
    const password = req.body.password;

    /* if any of the above params are undefined return bad request and respective message */
    if (!email || !password) return res.status(400).json({ message: 'Some parameters are undefined', type: 'error' });

    let loadedUser;
    
    // else try to find the user with email equal email from body
    models.Users.findOne({ where: { email: email } })
    .then(user => {
        
        /* if no user exists then return unauthorized and respective message */
        if (!user) return res.status(401).json({ message:'Wrong credentials!', type: 'error' });

        /* else proceed to checking the passwords if match */
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {

        /* if the previous promise stopped on non existing user then loadedUser never initialized, so return */
        if (!loadedUser) return;

        /* if passwords are not equal return unauthorized and respective message */
        if (!isEqual) return res.status(401).json({ message:'Wrong credentials!', type: 'error' });
        
        /* else the passwords match and so a jsonwebtoken must be created.
           Add to the payload all user info that will be needed later
        */
        const token = jwt.sign(
            {
                user: {
                    id: loadedUser.id,
                    name: loadedUser.name,
                    surname: loadedUser.surname,
                    dateCreated: loadedUser.dateCreated,
                    username: loadedUser.email 
                }
            },
            /* use env variable secret jwt */
            process.env.SECRET_JWT,
            /* set expiration time to 1 hour */
            { expiresIn: '1h'}
        );

        /* after jwt signed then, user is authorized, return all OK and respective message */
        res.status(200).json({ token: token, type: 'success', message:'Welcome back!' });
    })
    .catch(err => {
        /* in case of any other error, internal server error and the respective message */
        return res.status(500).json({ message: 'Internal server error.', type: 'error' })
    });

}