const logger = require('../config/winston')

/**
 *@since
 * 201217 | osj4532 | created
 */

const advice = (req, res, next) => {
    const clientIp = req.headers["X-FORWARDED-FOR"] || res.connection.remoteAddress
    const method = req.method;
    const path = req.path;

    logger.info(`${clientIp} ${method} ${path}`);

    const start = process.hrtime();

    next();

    const elapse = process.hrtime(start);
    logger.info(`${method} ${path} End ${elapse}ms`)
};

module.exports = advice;