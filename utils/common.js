const _ = require('lodash');
const schemas = require('../models/schemas');
const constants = require("./constants");
var uuid = require('node-uuid');

/**
 * This function will remove all the fields which is not included in schema.
 * 
 * @param object
 *            data object
 * @param schema
 *            schema for the object to compare fields
 */
let sanitize = function (object, schema) {
    var schemaKeys = _.keys(schema.properties);
    var objectKeys = _.keys(object);
    var constantsValues = _.values(constants.keys);

    for (var key in objectKeys) {
        var isValueMatched = false;
        for (var index in constantsValues) {
            if (constantsValues[index].indexOf(objectKeys[key].substring(0, constantsValues[index].length)) === 0) {
                isValueMatched = true;
                break;
            }
        }
        if (!isValueMatched && schemaKeys.indexOf(objectKeys[key]) === -1) {
            delete object[objectKeys[key]];
        } else {
            var propertyList = _.keys(schema.properties[objectKeys[key]]);
            for (var index = 0; index < propertyList.length; index++) {
                if (propertyList[index] === '$ref') {
                    var refValue = schema.properties[objectKeys[key]];
                    var refSchema = refValue.$ref.substring(1, refValue.$ref.length);
                    sanitize(object[objectKeys[key]], schemas[refSchema]);
                }
            }
        }
    }
    // logger.info(util.format('%j', object));
    return object;
};


let compareObjects = function (newObj, oldObj) {
    var compResult = [];
    // Get the keys of new Object
    var newObjKeys = _.keys(newObj);
    // Get the keys of old object
    var oldObjKeys = _.keys(oldObj);
    // Compare old keys with new keys
    var diffInNewObject = _.difference(oldObjKeys, newObjKeys);
    // If any difference found between two then there are some fields which are removed in new object
    if (diffInNewObject.length > 0) {
        // Add removed fields in history
        for (var i in diffInNewObject) {
            var obj = {
                name: diffInNewObject[i],
                oldValue: oldObj[diffInNewObject[i]],
                newValue: '' // Made change here
            }
            compResult.push(obj);
        }
    }
    // Iterate through all the keys of new object
    for (var index in newObj) {
        if (newObj[index] !== oldObj[index]) {
            var flag = true;
            // Check whether current field is array
            if (_.isArray(newObj[index])) {
                flag = false;
                // Check whether array is object array
                if (typeof (newObj[index][0]) === 'object') {
                    var obj = {
                        "arrayName": index
                    };
                    obj[index] = [];
                    // Iterate through all the objects of array
                    for (var i in newObj[index]) {
                        // Recursive call to get difference between object array
                        var comp = comopareObjects(newObj[index][i], oldObj[index][i]);
                        for (var j in comp) {
                            var obj = {
                                arrayIndex: i,
                                name: index + '.' + comp[j].name,
                                oldValue: comp[j].oldValue,
                                newValue: comp[j].newValue
                            };
                            compResult.push(obj);
                        }
                    }
                } else {
                    var elementsAddedInArray = _.difference(newObj[index], oldObj[index]);
                    var elementsRemovedFromArray = _.difference(oldObj[index], newObj[index]);
                    if (elementsAddedInArray.length > 0 || elementsRemovedFromArray.length > 0) {
                        flag = true;
                        var obj = {
                            name: index,
                            oldValue: oldObj[index],
                            newValue: newObj[index]
                        }
                        compResult.push(obj);
                    }
                }
            } else if (!_.isUndefined(newObj[index]) && !_.isUndefined(oldObj[index])) {
                // If field is object then find the difference between object(s)
                if (typeof (newObj[index]) == 'object') {
                    var comp = comopareObjects(newObj[index], oldObj[index]);
                    if (comp.length > 0) {
                        for (var i in comp) {
                            var obj = {
                                name: index + '.' + comp[i].name,
                                oldValue: comp[i].oldValue,
                                newValue: comp[i].newValue,
                                arrayIndex: comp[i].arrayIndex,
                            };
                            compResult.push(obj);
                        }
                    }
                } else {
                    var obj = {
                        name: index,
                        oldValue: oldObj[index],
                        newValue: newObj[index]
                    }
                    compResult.push(obj);
                }

            } else if (_.isUndefined(oldObj[index])) {
                // Value is not in old object
                var obj = {
                    name: index,
                    oldValue: '', // Made change here
                    newValue: newObj[index]
                }
                compResult.push(obj);
            }
        }
    }
    return compResult;
};

/**
 *  This function will remove unnecessary details from elasticsearch query response and simplify the response
 *
 * @param {*} data 
 * @returns 
 */
var removeUnnecessaryRes = function (data) {
    var result = [];
    var hitsData = data.hits.hits;
    for (var i = 0; i < hitsData.length; i++) {
        if (data.aggregations) {
            data.hits.hits[i]._source["aggregations"] = data.aggregations;
        }
        result = result.concat(data.hits.hits[i]._source);
    }
    if (data._scroll_id == undefined) {
        return result;
    } else {
        var obj = {};
        obj.result = result;
        obj.scrollId = data._scroll_id;
        return obj;
    }
    //return result;
};

// This function is used to generate OTP with random numbers
var generateOTP = (otpLength) => {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < otpLength; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;

}

var _getNextKey = function () {
    return uuid.v4();
};


module.exports = {
    sanitize: sanitize,
    compareObjects: compareObjects,
    removeUnnecessaryRes: removeUnnecessaryRes,
    generateOTP: generateOTP,
    getNextKey: _getNextKey
};