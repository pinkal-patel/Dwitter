module.exports = (app) => {
	var logger = require('../utils/logger');
	var util = require('util');
	var config = require('../config');
	let jsonwebtoken = require("jsonwebtoken");
	app.use((req, res, next) => {
		// User may not be logged in so pass on the request
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (req.url.indexOf('getCurrentSessionDetails') === -1) {
			logger.info(util.format('%s request from:- %s', req.url, ip));
		}
		if (req.method.toLowerCase() === 'get') {
			logger.info(util.format('request query:- %j', req.query));
		} else {
			if (req.url.indexOf('getCurrentSessionDetails') === -1) {
				logger.info(util.format('request body:- %j', req.body));
			}
		}
		next();
	});

	app.use((req, res, next) => {
		if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
			jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', (err, decode) => {
				if (err) req.user = undefined;
				req.user = decode;
				next();
			});
		} else {
			req.user = undefined;
			next();
		}
	});
};
