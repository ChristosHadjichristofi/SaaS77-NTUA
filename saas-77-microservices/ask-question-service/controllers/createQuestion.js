const axios = require('axios');
const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');

module.exports = (req, res, next) => {
    
    /* Create Question asks for body of {qname: question_name, qtext: question_text, qkeywords: question's_keywords_array } */
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    // variables to decide if error occurred
    let validationError = false, errors = [];

    // validating the fields qname and qtext, in case any of them does not exist, show the respective message
    if (!qname) {
        validationError = true;
        errors.push({type: 'error', msg: 'Question name is not defined.'});
    }

    if (!qtext) {
        validationError = true;
        errors.push({type: 'error', msg: 'Question text is not defined.'});
    }

    // in case of any error occurred (and the variable hasError is set to True) redirect to the page that sent the request
    if (validationError) return res.status(400).json({ message: 'Validation Error!', errors: errors })

    /* 
        if previous checks are passed, process the keywords
        1. Split them on comma
        2. convert array to set to avoid dublicates
        3. convert back to array
    */
    let keywordsArr = qkeywords.split(',');
    const keywordsSet = new Set(keywordsArr);
    keywordsArr = (keywordsSet.size == 1 && keywordsSet.has('')) ? [] : Array.from(keywordsSet);
    
    // create the question using the body
    const url = 'http://localhost:4006/events';

    // get userData from AUTH header
    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    // construct data obj that will be sent with axios
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
    
    // set the headers (both AUTH and ORIGIN)
    const headers = {
        'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH'),
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES))
    };

    // set the config
    const config = { method: 'post', url: url, headers: headers, data: data };

    // make the request
    axios(config)
    .then(result => 
        /* If result status < 400 everything ok, question submitted */ 
        res.status(200).json({ message: 'Your question was submitted successfully.', type: 'success' })
    )
    .catch(err => 
        /* if result status > 400 then some error occured */
        res.status(500).json({ message: 'Internal server error.', type: 'error' })
    )

}