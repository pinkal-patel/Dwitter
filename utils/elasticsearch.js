const util = require('util');
const _ = require('lodash');
const logger = require('./logger');
const constants = require('./constants');
const elasticsearch = require('elasticsearch');
const common = require('../utils/common');
const config = require('../config')

let serverOptions = {
    host: config.get('elasticsearch.host'),
    requestTimeout: 90000,
    maxSockets: 200
};
let client = new elasticsearch.Client(serverOptions);

let search = () => {

}

search.search = (ESQuery) => {
    return new Promise((resolve, reject) => {
        client.search(ESQuery).then((data) => {
            resolve(search.removeUnnecessaryRes(data));
        }, (error) => {
            reject(error);
        });

    });
};

search.simplesearch = (finalQry) => {
    return new Promise((resolve, reject) => {
        client.search(finalQry).then((data) => {
            resolve(data);
        }, (error) => {
            logger.error(util.format('error in simplesearch: %j, query: %j', error, finalQry));
            reject(error);
        });
    });
};


search.removeUnnecessaryRes = function(data) {
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
};



search.scrollQuery = (scrollID) => {
    return new Promise((resolve, reject) => {
        client.scroll({
            "scroll": "10m",
            "scroll_id": scrollID
        }).then((nextData) => {
            resolve(nextData);
        }, (error) => {
            reject(error);
            logger.error(util.format('Error: %j', error));
        });
    })
}

/**
 * To create document in ES
 */
search.addDocumentInES = function(key, doc, index) {
    return new Promise((resolve, reject) => {
        client.index({
            index: index,
            id: key,
            body: doc
        }).then(function(data) {
            resolve(data);
        }, function(error) {
            reject(error);
        });
    });
};
module.exports = search;