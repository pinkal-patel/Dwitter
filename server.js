//External imports
const http = require('http');
const express = require('express');
const app = express();

// internal imports
const config = require('./config');
const logger = require('./utils/logger');
const middlewares = require('./middlewares/index');
const routes = require('./routes/index');


setTimeout(() => {

    process.on('unhandledRejection', (reason, p) => {
        logger.error(`Unhandled Rejection at: ${p},reason::${reason}`);
    });
    // To handle Uncaught Exception
    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught exception: ${error}`);
    });

    app.set('port', config.get('server.port'));

    // setup middlewares
    middlewares(app);

    // setup routes
    routes(app);

    // Server Creation
    const server = http.createServer(app).listen(app.get('port'), function () {
        logger.info(`Server Started On port: ${config.get('server.port')}`);
        logger.info(`Environment: ${config.get('env')}`);
    });

}, 400);