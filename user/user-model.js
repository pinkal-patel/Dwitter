// External imports
const moment = require('moment');

// Internal imports
const config = require('../config');
const logger = require('../utils/logger');
const encrypt = require("../utils/encryption");
const search = require('../utils/elasticsearch');
const common = require("../utils/common");
const mailer = require('../utils/mailer');
let user = {}

// It will register new user
// if any user found with same name, email or phone then it will not register the new user with the same details
user.registerUser = (data) => {
    return new Promise((resolve, reject) => {
        // check if any user found with same name or email or phone
        checkDuplicateUser(data).then((found) => {
            // if no user found then register the new user
            if (!found) {
                data.id = common.getNextKey();
                var passwordobject = encrypt.getEncryptedPasswordWithSalt(data.password);
                data.name = data.name ? data.name : data.userName;
                data.password = passwordobject.password;
                data.passwordsalt = passwordobject.salt;
                data.createdAt = moment().utc().format();
                data.isDeleted = false
                let userKey = "USR_" + data.id;
                // add user details into ES
                search.addDocumentInES(userKey, data, config.get('elasticsearch.userIndex')).then((resp) => {
                    resolve({ "email": data.email, "name": data.name });
                }, (error) => {
                    reject(error);
                });

            } else {
                reject("duplicate user found");
            }
        }, (error) => {
            reject(error);
        });
    })
}

// this function is used to check if any user found with given name, email or phone 
// It is used by registration method to find out depliate user with same detais
let checkDuplicateUser = (data) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.userIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                        ],
                        "must_not": [
                            {
                                "match": {
                                    "isDeleted": true
                                }
                            }
                        ]
                    }
                },
                "size": 1
            }
        }
        if (data.userName) {
            finalQry.body.query.bool.should = finalQry.body.query.bool.should ? finalQry.body.query.bool.should : [];
            finalQry.body.query.bool.should.push({
                "match": {
                    "userName.keyword": data.userName
                }
            });
            finalQry.body.query.bool.minimum_should_match = 1;
        }
        if (data.email) {
            finalQry.body.query.bool.should = finalQry.body.query.bool.should ? finalQry.body.query.bool.should : [];
            finalQry.body.query.bool.should.push({
                "match": {
                    "email": data.email.toLowerCase()
                }
            });
            finalQry.body.query.bool.minimum_should_match = 1;
        }
        if (data.phone) {
            finalQry.body.query.bool.should = finalQry.body.query.bool.should ? finalQry.body.query.bool.should : [];
            finalQry.body.query.bool.should.push({
                "match": {
                    "phone": data.phone.replace(/[^0-9]/g, "")
                }
            });
            finalQry.body.query.bool.minimum_should_match = 1;
        }
        finalQry.body.size = 1;
        search.search(finalQry).then(function (data) {
            if (data && data.length > 0) {
                resolve(true);
            } else {
                resolve(false)
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });

    });
}

// It will fetch user details by email,name or phone
user.findOne = (data) => {
    return new Promise((resolve, reject) => {
        let finalQry = {
            "index": config.get('elasticsearch.userIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "email": data.email.toLowerCase()
                                }
                            }
                        ],
                        "must_not": [
                            {
                                "match": {
                                    "isDeleted": true
                                }
                            }
                        ]
                    }
                },
                "size": 1
            }
        }

        search.search(finalQry).then(function (data) {
            if (data && data.length > 0) {
                resolve(data[0]);
            } else {
                resolve({})
            }
        }, function (error) {
            logger.error(`error in fetch user ::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });

    });
}

// It will fetch dwitter list
user.getDweeterList = (data, userId) => {
    return new Promise((resolve, reject) => {
        let finalQry = {
            "index": config.get('elasticsearch.userIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "isVerified": true
                                }
                            }],
                        "must_not": [
                            {
                                "match": {
                                    "isDeleted": true
                                }
                            }, {
                                "match": {
                                    "id": userId
                                }
                            }
                        ]
                    }
                },
                "size": 10000,
                "_source": ["id", "userName", "name", "createdAt"]
            }
        }

        if (data.name) {
            finalQry.body.query.bool.should = finalQry.body.query.bool.should ? finalQry.body.query.bool.should : [];
            let name = {
                "query": data.name,
                "operator": "and"
            };
            finalQry.body.query.bool.should.push({
                "match": {
                    "userName": name
                }
            })
            finalQry.body.query.bool.should.push({
                "match": {
                    "name": name
                }
            });
            finalQry.body.query.bool.minimum_should_match = 1;
        }

        search.search(finalQry).then(function (data) {
            if (data && data.length > 0) {
                resolve(data);
            } else {
                resolve([])
            }
        }, function (error) {
            logger.error(`error in search dwitter::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    })
}


// It will fetch user detail for the given user id
user.getUserDetailsById = (userId) => {
    return new Promise((resolve, reject) => {
        let finalQry = {
            "index": config.get('elasticsearch.userIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "id": userId
                                }
                            }
                        ],
                        "must_not": [
                            {
                                "match": {
                                    "isDeleted": true
                                }
                            }
                        ]
                    }
                },
                "size": 1
            }
        }
        search.search(finalQry).then(function (data) {
            if (data && data.length > 0) {
                resolve(data[0]);
            } else {
                resolve({})
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });

    });
}

// It will update the user information for given user
// It is also used to follow or unFollow user 
user.updateUser = (data, userId) => {
    return new Promise((resolve, reject) => {
        // call function to get user details
        user.getUserDetailsById(userId).then((userDetails) => {
            userDetails.name = data.name ? data.name : userDetails.name;
            userDetails.birthDate = data.birthDate ? data.birthDate : userDetails.birthDate;
            if (data.followUserId) {
                if (userDetails.followingDweeterIds && userDetails.followingDweeterIds.length > 0) {
                    userDetails.followingDweeterIds.push(data.followUserId);
                } else {
                    userDetails.followingDweeterIds = [data.followUserId];
                }
            }
            if (data.unFollowUserId) {
                if (userDetails.followingDweeterIds && userDetails.followingDweeterIds.length > 0) {
                    let index = userDetails.followingDweeterIds.findIndex((a) => a == data.unFollowUserId);
                    if (index > -1) {
                        userDetails.followingDweeterIds.splice(index, 1);
                    }
                }
            }
            userDetails.updatedBy = userId;
            userDetails.updatedAt = moment().utc().format();
            let userKey = "USR_" + userId;
            // update the user details into ES
            search.addDocumentInES(userKey, userDetails, config.get('elasticsearch.userIndex')).then((resp) => {
                resolve(true);
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });

    });
}

// It will fetch all the necessary details of user which will be used to see user profile details
user.getUserProfileDetails = (userId) => {
    return new Promise((resolve, reject) => {
        // call function to get user details
        user.getUserDetailsById(userId).then((userDetails) => {
            // call function to get follower user count 
            getFollowerCount(userId).then((followers) => {
                if (userDetails.followingDweeterIds && userDetails.followingDweeterIds.length > 0) {
                    userDetails.following = userDetails.followingDweeterIds.length
                } else {
                    userDetails.following = 0;
                }
                userDetails.followers = followers;
                resolve(userDetails);
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });
    });
};

// It will fetch those dweeters who are following the given user
let getFollowerCount = (userId) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.userIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "followingDweeterIds": userId
                                }
                            }
                        ],
                        "must_not": [
                            {
                                "match": {
                                    "isDeleted": true
                                }
                            }
                        ]
                    }
                },
                "size": 0
            }
        }

        finalQry.body.track_total_hits = true;
        search.simplesearch(finalQry).then(function (data) {
            if (data.hits && data.hits.total && data.hits.total.value > 0) {
                resolve(data.hits.total.value);
            } else {
                resolve(0)
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });

    });
}

// It will change the user's current password
user.changePassword = (data, userId) => {
    return new Promise((resolve, reject) => {
        if (data.newPwd === data.confirmPwd) {
            // call function to get user details
            user.getUserDetailsById(userId).then((userDetails) => {
                let oldPwdHash = encrypt.getDecryptedPassword(data.currentPwd, userDetails.passwordsalt);
                if (oldPwdHash == userDetails.password) {
                    // encrypt the password
                    var passwordobject = encrypt.getEncryptedPasswordWithSalt(data.newPwd);
                    userDetails.password = passwordobject.password;
                    userDetails.passwordsalt = passwordobject.salt;
                    userDetails.updatedAt = moment().utc().format();

                    // save user details
                    let userKey = "USR_" + userDetails.id;
                    search.addDocumentInES(userKey, userDetails, config.get('elasticsearch.userIndex')).then((resp) => {
                        resolve(true);
                    }, (error) => {
                        reject(error);
                    });
                } else {
                    reject("Incorrect current password");
                }
            }, (error) => {
                reject(error);
            });
        } else {
            reject("New Password and Confirm password are not matched");
        }

    });
}

// It will send mail with verification link to the registered email account
user.sendVerificationMail = (reqData, userId) => {
    return new Promise((resolve, reject) => {
        // call function to get user details
        user.findOne(reqData).then((userDetails) => {
            let verificationCode = common.generateOTP(7);
            console.log("Check");
            let mailOptions = {
                from: "dwitterverification@gmail.com",
                to: reqData.email,
                subject: "Please verify your account",
                html: `<h1>Email Verification</h1>
          <p>Hello ${reqData.name},</p>
          <p>Thank you for Registration. Please verify your email by clicking on the following link</p>
          <a href=http://localhost:9000/verify/?id=${userDetails.id}&code=${verificationCode}> Click here</a>
          </div>`,
            }
            // calll function to send mail
            mailer.sendMail(mailOptions).then((resp) => {
                userDetails.verificationCode = verificationCode;
                let userKey = "USR_" + userDetails.id;
                // save verification code in user document
                search.addDocumentInES(userKey, userDetails, config.get('elasticsearch.userIndex')).then((resp) => {
                    resolve(true);
                }, (error) => {
                    reject(error);
                });
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });

    });
}

// It will verify user account by setting the isVerified flag
user.verifyEmail = (data) => {
    return new Promise((resolve, reject) => {
        // call function to get user details
        user.getUserDetailsById(data.id).then((userDetails) => {
            if (userDetails.verificationCode == data.code) {
                let userKey = "USR_" + userDetails.id;
                userDetails.isVerified = true;
                // if verification code matches then save user details with verified flag
                search.addDocumentInES(userKey, userDetails, config.get('elasticsearch.userIndex')).then((resp) => {
                    resolve("Email verified successfully");
                }, (error) => {
                    reject(error);
                });
            } else {
                reject({})
            }

        }, (error) => {
            reject(error);
        });
    });
}

module.exports = user;