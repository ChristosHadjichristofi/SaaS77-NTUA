const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('X-OBSERVATORY-AUTH');
    if (!authHeader) {
        return res.status(401).json({message: 'Not authenticated.'});
    }
    const token = authHeader;

    if (token) {
        
        let decodedToken;
        
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_JWT);
        } catch (err) {
            return res.status(401).json({message: 'Invalid Token.'});
        }
        
        if (!decodedToken) {
            return res.status(401).json({message: 'Not authenticated.'});
        }
        
        req.user = decodedToken.user;
    
        next();

    }
    
};