var service = require('./user-service');

module.exports = (app) => {

    // To register new user
    app.post('/user/register', service.registerUser);

    // To search the existing dwitter list
    app.post('/dweeter/search', service.getDweeterList);

    // To update the user details such as birthdate or name or to follow & unFollow dweeters
    app.post('/user/update', service.updateUser);

    // To change the user password
    app.post('/user/changePassword', service.changePassword);

    // send verification mail after the registration
    app.post('/user/sendVerificationMail', service.sendVerificationMail);

    /// verify email for the account
    app.get('/verify', service.verifyEmail);

};