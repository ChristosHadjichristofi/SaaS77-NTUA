const axios = require('axios');

module.exports = (req, res, next) => {
    
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    if (!qname || !qtext || !qkeywords) return res.status(400).json({message: 'Some parameters are undefined'});

    const keywordsArr = qkeywords.split(',');

    const url = 'http://localhost:4006/events';

    const data = {
        type: 'QUESTION CREATE',
        qname: qname,
        qtext: qtext,
        qkeywords: keywordsArr
    }
    
    const config = { method: 'post', url: url, data: data };

    axios(config)
    .then(result => { return res.status(200).json({ message: result.data.message }) })
    .catch(err => { return res.status(500).json({ message: 'Internal server error.' }) })

}