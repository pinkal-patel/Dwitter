const constants = require('../utils/constants');
const common = require('../utils/common');
const schemas = require('../models/schemas');
const model = require('./dwitter-model');

// It will save new dweets if not duplicate
let save = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.save);
        // validate request data
        if (schemas.validate(reqData, schemas.save)) {
            // call model to save new dweets
            model.save(reqData, req.user.id).then((result) => {
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
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

// It will perform like action to the specific dweet
let likeDweet = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.likeDweet);
        // validate request data
        if (schemas.validate(reqData, schemas.likeDweet)) {
            // call model to like the specific dweet
            model.likeDweet(reqData, req.user.id).then((result) => {
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
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

// It will perform like action to the specific dweet
let removeLike = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.likeDweet);
        // validate request data
        if (schemas.validate(reqData, schemas.likeDweet)) {
            // call model to unlike the specific dweet
            model.removeLike(reqData, req.user.id).then((result) => {
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
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

// It will add comments on the specific dweet
let commentDweet = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        let reqData = common.sanitize(req.body, schemas.commentDweet);
        // validate request data
        if (schemas.validate(reqData, schemas.commentDweet)) {
            // call model to add comment on spectific dweet
            model.commentDweet(reqData, req.user.id).then((result) => {
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
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

// It will fetch recent dweets of the dweeters whom the given user is following
let viewDweets = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        // call model to view all the latest dweets from the followed users
        model.viewDweets(req.user.id).then((result) => {
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
                data: error
            });
        });
    } else {
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

// It will fetch the dweets based on given text 
let searchDweets = (req, res) => {
    // check if requested user is authenticated
    if (req.user) {
        // call model to search specific types of dweets
        model.searchDweets(req.body, req.user.id).then((result) => {
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
                data: error
            });
        });
    } else {
        return res.status(401).send({
            code: 4001,
            message: constants.responseCodeMessage.code_4001,
            data: {}
        });
    }
};

module.exports = {
    save: save,
    likeDweet: likeDweet,
    removeLike:removeLike,
    commentDweet: commentDweet,
    viewDweets: viewDweets,
    searchDweets: searchDweets
};