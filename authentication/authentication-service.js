// Internal imports
let jwt = require('jsonwebtoken');

// External imports
let userModel = require('../user/user-model');
let encryption = require('../utils/encryption');
const constants = require("../utils/constants");


/// it will login into the system if it is authenticated and its email & password are correct
let login = (req, res) => {
    // call user model to get user details 
    userModel.findOne(req.body).then((user) => {
        // if vaild user found 
        if (user && Object.keys(user).length > 0) {
            // if account is verified
            if (user.isVerified) {
                // check if password is vaild or not
                if (!user || !encryption.comparePassword(req.body.password, user)) {
                    return res.status(401).json({ code: 4000, message: 'Authentication failed. Invalid user or password.' });
                } else {
                    // successfully login and sends the JWT token
                    return res.json({ token: jwt.sign({ email: user.email, fullName: user.userName, id: user.id }, 'RESTFULAPIs') });
                }
            } else {
                return res.status(401).json({ code: 4000, message: 'Account is not verified' });
            }
        } else {
            return res.status(401).json({ code: 4000, message: 'Authentication failed. Invalid user or password.' });
        }

    }, (error) => {
        return res.status(500).send({
            code: 5000,
            message: constants.responseCodeMessage.code_5000,
            data: {}
        });
    });
};


module.exports = {
    login: login
}