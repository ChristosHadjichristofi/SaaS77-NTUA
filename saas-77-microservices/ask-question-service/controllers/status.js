// in case the requester reached this service, then service is UP so the service responds that its UP
module.exports = (req, res, next) => {
    return res.status(200).json({ service: 'Create Question', status: 'UP', uptime: Math.floor(process.uptime()), database: 'No Database' });
}