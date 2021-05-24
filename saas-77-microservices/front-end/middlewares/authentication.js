const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    
    const authHeader = req.session.user.jwtToken;
    if (!req.session.authenticated) res.redirect('/');
    else {

        const token = authHeader;
    
        if (token) {
            
            let decodedToken;
            
            try {
                decodedToken = jwt.verify(token, process.env.SECRET_JWT);
            } catch (err) {
                req.flash('messages', {type: 'error', value: 'Your session has expired.'});
                req.session.authenticated = false;
                return res.redirect('/');
            }
            
            if (!decodedToken) {
                req.flash('messages', {type: 'info', value: 'Not authenticated.'});
                req.session.authenticated = false;
                return res.redirect('/');
            }
            
            req.user = decodedToken.user;
        
            next();
    
        }
    }
}