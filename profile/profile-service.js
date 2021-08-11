const profileModel = require('./profile-model');
const common = require("../utils/common");
const schemas = require("../models/schemas");
const constants = require("../utils/constants");
var logger = require('../utils/logger');

var getUserProfile = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.query, schemas.getProfile);
        // validate the schema
        if (schemas.validate(reqData, schemas.getProfile)) {
            //call model function to extract user profile details
            profileModel.getUserProfile(req.query.id).then((result) => {
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

module.exports = {
    getUserProfile: getUserProfile
}