// External imports
const moment = require('moment');
const _ = require('lodash');

//Internal Imports
const config = require('../config');
const logger = require('../utils/logger');
const common = require('../utils/common')
const search = require('../utils/elasticsearch');
const userModel = require('../user/user-model');
const dweets = {};

// It will save new dweets if not duplicate
dweets.save = (reqData, userId) => {
    return new Promise((resolve, reject) => {
        // call function to check if already dweet found with same requested dweet message
        checkDuplicateDweet(reqData.message).then((found) => {
            // if not duplicate
            if (!found) {
                reqData.id = common.getNextKey();
                reqData.createdAt = moment().utc().format();
                reqData.createdBy = userId;
                reqData.isDeleted = false;
                reqData.normalizedMsg = reqData.message.replace(/\W/g, '').toLowerCase()
                let dweetKey = "Dweet_" + reqData.id;
                // save new dweet details into ES
                search.addDocumentInES(dweetKey, reqData, config.get('elasticsearch.dweetIndex')).then((resp) => {
                    resolve(true);
                }, (error) => {
                    reject(error);
                });
            } else {
                reject("duplicate dweet found");
            }
        }, (error) => {
            reject(error);
        });

    });
}

// It will check if any duplicate dweet found for given message
let checkDuplicateDweet = (msg) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.dweetIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "normalizedMsg": msg.replace(/\W/g, '').toLowerCase()
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
                resolve(true);
            } else {
                resolve(false)
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    })
}

// It will perform like action to the specific dweet
dweets.likeDweet = (data, userId) => {
    return new Promise((resolve, reject) => {
        // prepare object for the like entry
        let msg = {};
        msg.id = common.getNextKey();
        msg.autherId = data.autherId;
        msg.likedBy = userId;
        msg.dweetId = data.dweetId;
        msg.datetime = moment().utc().format();

        // like entry is of the combination of perticular dweet and the userId who is performing the like action
        // thus if user likes the perticular dweet multiple times then also we have only one entry in database
        let key = "LIKE_" + data.dweetId + "_" + userId;
        // save like entry into ES index
        search.addDocumentInES(key, msg, config.get('elasticsearch.likeIndex')).then((resp) => {
            resolve(true);
        }, (error) => {
            reject(error);
        });
    });
}


// It will perform unlike action to the specific dweet
dweets.removeLike = (data, userId) => {
    return new Promise((resolve, reject) => {
        let finalQry = {
            "index": config.get('elasticsearch.dweetIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "likedBy": userId
                                }
                            },
                            {
                                "match": {
                                    "dweetId": data.dweetId
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
        search.search(finalQry).then(function (likesDetails) {
            if (likesDetails && likesDetails.length > 0) {
                let key = "LIKE_" + data.dweetId + "_" + userId;
                let obj = likesDetails[0];
                obj.isDeleted = true;
                // save like entry into ES index
                search.addDocumentInES(key, obj, config.get('elasticsearch.likeIndex')).then((resp) => {
                    resolve(true);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(true)
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    });
}

// It will add comments on the specific dweet
dweets.commentDweet = (data, userId) => {
    return new Promise((resolve, reject) => {
        // prepare object for the comment entry
        let msg = {};
        msg.id = common.getNextKey();
        msg.autherId = data.autherId;
        msg.commentedBy = userId;
        msg.dweetId = data.dweetId;
        msg.comment = data.comment;
        msg.datetime = moment().utc().format();

        let key = "COMMENT_" + msg.id;
        // save comment entry into ES index
        search.addDocumentInES(key, msg, config.get('elasticsearch.commentIndex')).then((resp) => {
            resolve(true);
        }, (error) => {
            reject(error);
        });


    });
}

// It will fetch recent dweets of the dweeters whom the given user is following
dweets.viewDweets = (userId) => {
    return new Promise((resolve, reject) => {
        // call user model to get user details
        userModel.getUserDetailsById(userId).then((userData) => {

            let dweeterIds = [];
            if (userData.followingDweeterIds && userData.followingDweeterIds.length > 0) {
                dweeterIds = dweeterIds.concat(userData.followingDweeterIds);
            }
            if (dweeterIds.length > 0) {

                let finalQry = {
                    "index": config.get('elasticsearch.dweetIndex'),
                    "body": {
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "terms": {
                                            "createdBy": dweeterIds
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
                        "size": 10000,
                        "_source": ["message", "id", "createdAt", "createdBy"],
                        "sort": [{
                            "createdAt": {
                                "order": "desc"
                            }
                        }]
                    }
                }

                search.search(finalQry).then(function (data) {
                    if (data && data.length > 0) {
                        // call function to get likes and comments for all the dweets
                        processDweets(data, userId).then((result) => {
                            resolve(result);
                        }, (error) => {
                            reject(error);
                        });
                    } else {
                        resolve([])
                    }
                }, function (error) {
                    logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
                    reject(error);
                });

            } else {
                resolve([]);
            }

        }, (error) => {
            reject(error);
        });
    });
}

// It will fetch the dweets based on given text 
dweets.searchDweets = (data, userId) => {
    return new Promise((resolve, reject) => {
        userModel.getUserDetailsById(userId).then((userData) => {

            let finalQry = {
                "index": config.get('elasticsearch.dweetIndex'),
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
                    "size": 10000,
                    "_source": ["message", "id", "createdAt", "createdBy"],
                    "sort": [{
                        "createdAt": {
                            "order": "desc"
                        }
                    }]
                }
            }
            if (data.text) {
                let message = {
                    "query": data.text,
                    "operator": "and"
                };
                finalQry.body.query.bool.must.push({
                    "match": {
                        message
                    }
                });
            }
            search.search(finalQry).then(function (data) {
                if (data && data.length > 0) {
                    // call function to get likes and comments for all the dweets
                    processDweets(data, userId).then((result) => {
                        resolve(result);
                    }, (error) => {
                        reject(error);
                    });
                } else {
                    resolve([])
                }
            }, function (error) {
                logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
                reject(error);
            });
        }, (error) => {
            reject(error);
        });
    });
}

// It will fetch all the dweets of a given dweeter
dweets.getDweetsOfUser = (userId) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.dweetIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "createdBy": userId
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
                "size": 10000,
                "_source": ["message", "id", "createdAt", "createdBy"],
                "sort": [{
                    "createdAt": {
                        "order": "desc"
                    }
                }]
            }
        }
        search.search(finalQry).then(function (data) {
            if (data && data.length > 0) {
                processDweets(data, userId).then((result) => {
                    resolve(result);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve([])
            }
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    });
}

// It will iterate each dweets and fetch its likes count and comments
let processDweets = (dweets, userId) => {
    return new Promise((resolve, reject) => {
        let dweetIds = _.map(dweets, "id");
        // call function to get likes of each dweets
        getLikes(dweetIds).then((likesObj) => {
            // call function to get likes of each dweets of requested user
            getLikesOfUser(dweetIds, userId).then((userLikesObj) => {
                // call function to get comments of each dweets
                getComments(dweetIds).then((commentObj) => {
                    for (let i in dweets) {
                        dweets[i].noOfLikes = likesObj[dweets[i].id] ? likesObj[dweets[i].id] : 0;
                        dweets[i].comments = commentObj[dweets[i].id] ? commentObj[dweets[i].id] : [];
                        dweets[i].liked = userLikesObj[dweets[i].id] ? true : false;
                    };
                    resolve(dweets);
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

// It will fetch likes for given dweets
let getLikes = (dweetIds) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.likeIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "terms": {
                                    "dweetId": dweetIds
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
                "size": 0,
                "_source": ["id", "likedBy", "dweetId", "datetime"],
                "aggs": {
                    "dweets": {
                        "terms": {
                            "field": "dweetId",
                            "size": 10000
                        },
                        "aggs": {
                            "likes": {
                                "cardinality": {
                                    "field": "id"
                                }
                            }
                        }
                    }
                }
            }
        }
        search.simplesearch(finalQry).then(function (result) {
            let obj = {};
            // extract likes count for each dweets form aggregation result
            if (result.aggregations && result.aggregations.dweets && result.aggregations.dweets.buckets && result.aggregations.dweets.buckets.length > 0) {
                for (let i in result.aggregations.dweets.buckets) {
                    obj[result.aggregations.dweets.buckets[i].key] = result.aggregations.dweets.buckets[i].likes.value;
                }
            }
            resolve(obj);
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    });
}

let getLikesOfUser = (dweetIds, userId) => {
    return new Promise((resolve, reject) => {

        let finalQry = {
            "index": config.get('elasticsearch.likeIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "terms": {
                                    "dweetId": dweetIds
                                }
                            },
                            {
                                "match": {
                                    "likedBy": userId
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
                "size": 0,
                "_source": ["id", "likedBy", "dweetId", "datetime"],
                "aggs": {
                    "dweets": {
                        "terms": {
                            "field": "dweetId",
                            "size": 10000
                        },
                        "aggs": {
                            "likes": {
                                "cardinality": {
                                    "field": "id"
                                }
                            }
                        }
                    }
                }
            }
        }
        search.simplesearch(finalQry).then(function (result) {
            let obj = {};
            // extract likes count for each dweets form aggregation result
            if (result.aggregations && result.aggregations.dweets && result.aggregations.dweets.buckets && result.aggregations.dweets.buckets.length > 0) {
                for (let i in result.aggregations.dweets.buckets) {
                    obj[result.aggregations.dweets.buckets[i].key] = result.aggregations.dweets.buckets[i].likes.value;
                }
            }
            resolve(obj);
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    });
}

// It will fetch comments for given dweets
let getComments = (dweetIds) => {
    return new Promise((resolve, reject) => {
        let finalQry = {
            "index": config.get('elasticsearch.commentIndex'),
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "terms": {
                                    "dweetId": dweetIds
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
                "size": 10000,
                "sort": [{
                    "datetime": {
                        "order": "desc"
                    }
                }]
            }
        }

        search.search(finalQry).then(function (result) {
            // return all the comment with dweets grouping
            resolve(_.groupBy(result, "dweetId"))
        }, function (error) {
            logger.error(`error in elastic search query::  ${Object.keys(error).length > 0 ? JSON.stringify(error) : error}`);
            reject(error);
        });
    });
}

module.exports = dweets;