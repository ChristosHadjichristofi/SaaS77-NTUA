const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) return res.status(400).json({ message: 'Some parameters are undefined', type: 'error' });

    let loadedUser;
    
    models.Users.findOne({ where: { email: email } })
    .then(user => {
        
        if (!user) return res.status(401).json({ message:'Wrong credentials!', type: 'error' });

        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {

        if (!loadedUser) return;

        if (!isEqual) return res.status(401).json({ message:'Wrong credentials!', type: 'error' });
        
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
            process.env.SECRET_JWT, 
            { expiresIn: '1h'}
        );

        res.status(200).json({ token: token, type: 'success', message:'Welcome back!' });
    })
    .catch(err => {
        return res.status(500).json({ message: 'Internal server error.', type: 'error' })
    });

}