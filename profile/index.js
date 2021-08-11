var service = require('./profile-service');

module.exports = (app) => {
    // To fetch the user profile details
    app.get('/user/profile', service.getUserProfile);
};