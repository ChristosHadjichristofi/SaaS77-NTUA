module.exports = (req, res, next) => {
    return res.status(200).json({ service: 'Create Question', status: 'UP', uptime: Math.floor(process.uptime()), database: 'No Database' });
}