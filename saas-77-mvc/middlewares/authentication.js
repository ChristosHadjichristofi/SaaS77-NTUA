// simple middleware to check if req.session.authenticated is set to true (meaning the user is logged in)
// in case he is logged in proceed to next else stay on landing

module.exports = (req, res, next) => {
    
    if (!req.session.authenticated) res.redirect('/');
    else next();
}