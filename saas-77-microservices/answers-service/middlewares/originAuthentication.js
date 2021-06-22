const decrypt = require('../utils/decrypt');

module.exports = (req, res, next) => {
   const customServicesHeader = req.header('custom-services-header');

   if (customServicesHeader !== undefined) 
       decrypt(JSON.parse(customServicesHeader)) === process.env.SECRET_STRING_SERVICES 
       ? next() : res.status(403).json({ message: 'Not allowed origin.', type: 'error' });
   
   else return res.status(403).json({ message: 'Not allowed origin.', type: 'error' });
};