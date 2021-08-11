const usermodel = require('./user-model');
const common = require('../utils/common');
const schemas = require('../models/schemas');
const constants = require('../utils/constants');


// It will register new user 
var registerUser = (req, res) => {
    let reqData = common.sanitize(req.body, schemas.registerUser);
    // validate the schema
    if (schemas.validate(reqData, schemas.registerUser)) {
        // call model to register user
        usermodel.registerUser(reqData).then((result) => {
            return res.status(200).send({
                code: 2000,
                message: constants.responseCodeMessage.code_2000,
                data: result
            });
        }).catch((error) => {
            return res.status(500).send({
                code: 5000,
                message: constants.responseCodeMessage.code_5000,
                data: error
            });
        });
    } else {
        // Incomplete Data
        return res.status(400).send({
            code: 4002,
            message: constants.responseCodeMessage.code_4002,
            data: {}
        });
    }
};

// It will fetch the dwitter list except the user itself
var getDweeterList = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.getDweeterList);
        // validate the schema
        if (schemas.validate(reqData, schemas.getDweeterList)) {
            // call model to fetch dweeter list
            usermodel.getDweeterList(reqData, req.user.id).then((result) => {
                return res.status(200).send({
                    code: 2000,
                    message: constants.responseCodeMessage.code_2000,
                    data: result
                });
            }).catch((error) => {
                console.log(error)
                return res.status(500).send({
                    code: 5000,
                    message: constants.responseCodeMessage.code_5000,
                    data: {}
                });
            });
        } else {
            // Incomplete Data
            return res.status(400).send({
                code: 4002,
                message: constants.responseCodeMessage.code_4002,
                data: {}
            });
        }
    } else {
        return res.status(401).json({ code: 4001, message: constants.responseCodeMessage.code_4001 });
    }

};


// It will update the user details (such as display name,birthdate ,follow users , unfollow users )
var updateUser = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.updateUser);
        // validate the schema
        if (schemas.validate(reqData, schemas.updateUser)) {
            // call model to update user details
            usermodel.updateUser(reqData, req.user.id).then((result) => {
                return res.status(200).send({
                    code: 2000,
                    message: constants.responseCodeMessage.code_2000,
                    data: result
                });
            }).catch((error) => {
                console.log(error)
                return res.status(500).send({
                    code: 5000,
                    message: constants.responseCodeMessage.code_5000,
                    data: {}
                });
            });
        } else {
            // Incomplete Data
            return res.status(400).send({
                code: 4002,
                message: constants.responseCodeMessage.code_4002,
                data: {}
            });
        }
    } else {
        return res.status(401).json({ code: 4001, message: constants.responseCodeMessage.code_4001 });
    }
};

// It will change the password
var changePassword = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.changePassword);
        // validate the schema
        if (schemas.validate(reqData, schemas.changePassword)) {
            // call model to change password
            usermodel.changePassword(reqData, req.user.id).then((result) => {
                return res.status(200).send({
                    code: 2000,
                    message: constants.responseCodeMessage.code_2000,
                    data: result
                });
            }).catch((error) => {
                return res.status(500).send({
                    code: 5000,
                    message: constants.responseCodeMessage.code_5000,
                    data: error
                });
            });
        } else {
            // Incomplete Data
            return res.status(400).send({
                code: 4002,
                message: constants.responseCodeMessage.code_4002,
                data: {}
            });
        }
    } else {
        return res.status(401).json({ code: 4001, message: constants.responseCodeMessage.code_4001 });
    }
};

// It will send mail with verification link
var sendVerificationMail = (req, res) => {

    let reqData = common.sanitize(req.body, schemas.verifyEmail);
    // validate the schema
    if (schemas.validate(reqData, schemas.verifyEmail)) {
        // call model to send verification link  
        usermodel.sendVerificationMail(reqData).then((result) => {
            return res.status(200).send({
                code: 2000,
                message: constants.responseCodeMessage.code_2000,
                data: result
            });
        }).catch((error) => {
            return res.status(500).send({
                code: 5000,
                message: constants.responseCodeMessage.code_5000,
                data: error
            });
        });
    } else {
        // Incomplete Data
        return res.status(400).send({
            code: 4002,
            message: constants.responseCodeMessage.code_4002,
            data: {}
        });
    }
};

// It will verify email 
let verifyEmail = (req, res) => {
    // call model to verify email
    usermodel.verifyEmail(req.query).then((result) => {
        return res.status(200).send({
            code: 2000,
            message: constants.responseCodeMessage.code_2000,
            data: result
        });
    }).catch((error) => {
        return res.status(500).send({
            code: 5000,
            message: constants.responseCodeMessage.code_5000,
            data: error
        });
    });
};

module.exports = {
    registerUser: registerUser,
    getDweeterList: getDweeterList,
    updateUser: updateUser,
    changePassword: changePassword,
    sendVerificationMail: sendVerificationMail,
    verifyEmail: verifyEmail
};