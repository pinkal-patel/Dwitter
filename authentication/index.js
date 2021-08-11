module.exports = function(app) {
    var service = require('./authentication-service');

    // To login into the application
    app.post('/auth/login', service.login);

};