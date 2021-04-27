module.exports = (req, res, next) => {
    
    if (!req.session.authenticated) res.redirect('/');
    else next();
}