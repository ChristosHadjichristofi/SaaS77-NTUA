module.exports = (req, res, next) => {
    
    console.log(req.headers.host)

    const event = req.body;

    console.log(event);

    return res.status(200).json({ message: 'OK.' })

}