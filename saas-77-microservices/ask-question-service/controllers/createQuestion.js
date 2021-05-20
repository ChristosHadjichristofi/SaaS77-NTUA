const axios = require('axios');
const jwt_decode = require('jwt-decode');

module.exports = (req, res, next) => {
    
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    if (!qname || !qtext || !qkeywords) return res.status(400).json({ message: 'Some parameters are undefined', type: 'error' });

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
    
    const config = { method: 'post', url: url, headers: { 'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH') }, data: data };

    axios(config)
    .then(result => res.status(200).json({ message: 'Your question was submitted successfully.', type: 'success' }))
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}