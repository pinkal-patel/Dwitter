const util = require('util');
const Validator = require('jsonschema').Validator;
const logger = require('../utils/logger');
const _validator = new Validator();

const schemas = () => {};

// schema for register new user request
schemas.registerUser = {
    'id': '/registerUser',
    'type': 'object',
    'properties': {
        'userName': {
            'type': 'string',
            'required': true
        },
        'name': {
            'type': 'string',
            'required': false
        },
        'email': {
            'type': 'string',
            'required': true
        },
        'password': {
            'type': 'string',
            'required': true
        },
        'phone': {
            'type': 'string',
            'required': false
        },
        'birthDate': {
            'type': 'string',
            'required': true
        }
    }
};

// schema for user update request
schemas.updateUser = {
    'id': '/updateUser',
    'type': 'object',
    'properties': {
        'name': {
            'type': 'string',
            'required': false
        },
        'birthDate': {
            'type': 'string',
            'required': false
        },
        'followUserId': {
            'type': 'string',
            'required': false
        },
        'unFollowUserId': {
            'type': 'string',
            'required': false
        }
    }
};

// schema for search dwitter request
schemas.getDweeterList = {
    'id': '/getLeaderboard',
    'type': 'object',
    'properties': {
        'name': {
            'type': 'string',
            'required': false
        }
    }
};

//schema for save new dweet request
schemas.save = {
    'id': '/registerUser',
    'type': 'object',
    'properties': {
        'message': {
            'type': 'string',
            'required': true
        }
    }
}

//schema for like request to specific dweet
schemas.likeDweet = {
    'id': '/likeDweet',
    'type': 'object',
    'properties': {
        'autherId': {
            'type': 'string',
            'required': true
        },
        'dweetId': {
            'type': 'string',
            'required': true
        }
    }
}

//schema to comment request on specific dweet
schemas.commentDweet = {
    'id': '/commentDweet',
    'type': 'object',
    'properties': {
        'autherId': {
            'type': 'string',
            'required': true
        },
        'dweetId': {
            'type': 'string',
            'required': true
        },
        'comment': {
            'type': 'string',
            'required': true
        }
    }
}

// schema to change user password request
schemas.changePassword = {
    'id': '/changePassword',
    'type': 'object',
    'properties': {
        'currentPwd': {
            'type': 'string',
            'required': true
        },
        'newPwd': {
            'type': 'string',
            'required': true
        },
        'confirmPwd': {
            'type': 'string',
            'required': true
        }
    }
}

// schema to verify user account via email request
schemas.verifyEmail = {
    'id': '/verifyEmail',
    'type': 'object',
    'properties': {
        'email': {
            'type': 'string',
            'required': true
        },
        'name': {
            'type': 'string',
            'required': true
        }
    }
}

// schema to get user profile request
schemas.getProfile = {
    'id': '/getProfile',
    'type': 'object',
    'properties': {
        'id': {
            'type': 'string',
            'required': true
        }
    }
}

schemas.validate = (object, schema) => {
    let
        errors = _validator.validate(object, schema).errors;
    if (errors.length > 0) {
        logger.error(util.format('Schema validation failed for id:- %s errors:- %j', schema.id, errors));
    }
    return errors.length <= 0 ? true : false;
};

module.exports = schemas;