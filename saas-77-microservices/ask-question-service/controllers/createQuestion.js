const axios = require('axios');
const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');

module.exports = (req, res, next) => {
    
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    let validationError = false, errors = [];
    if (!qname) {
        validationError = true;
        errors.push({type: 'error', msg: 'Question name is not defined.'});
    }

    if (!qtext) {
        validationError = true;
        errors.push({type: 'error', msg: 'Question text is not defined.'});
    }

    if (validationError) return res.status(400).json({ message: 'Validation Error!', errors: errors })

    const keywordsArr = qkeywords.split(',');

    const url = 'http://localhost:4006/events';

    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    const data = {
        type: 'QUESTION CREATE',
        qname: qname,
        qtext: qtext,
        qkeywords: keywordsArr,
        dateCreated: Date.now(),
        usersId: userData.user.id,
        usersName: userData.user.name,
        usersSurname: userData.user.surname
    }
    
    const headers = {
        'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH'),
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES))
    };

    const config = { method: 'post', url: url, headers: headers, data: data };

    axios(config)
    .then(result => res.status(200).json({ message: 'Your question was submitted successfully.', type: 'success' }))
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}