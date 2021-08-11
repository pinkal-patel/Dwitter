var convict = require('convict');
var fs = require('fs');

var config = convict({
    env: {
        doc: 'The applicaton environment.',
        format: ['production', 'development', 'test'],
        default: 'production',
        env: 'NODE_ENV',
        arg: 'env'
    },

    server: {
        port: {
            doc: 'HTTP port to bind',
            format: 'port',
            default: 9000,
            env: 'PBX_SER_PORT'
        },
        bodyParser: {
            limit: {
                doc: 'Post variable limit',
                format: String,
                default: "500kb"
            }
        },
        enableHttpLogging: {
            doc: 'Enable HTTP Logging',
            format: Boolean,
            default: true
        },
        enableCompression: {
            doc: 'Enable HTTP compression',
            format: Boolean,
            default: true
        },
        enableStatic: {
            doc: 'Enable Express static server',
            format: Boolean,
            default: false
        },
        enablePassportAuthentication: {
            doc: 'Enable Passport authentication',
            format: Boolean,
            default: false
        },
        enableSessionCouchbase: {
            doc: 'Enable Couchbase session storage',
            format: Boolean,
            default: false
        },
        enableCSRFSecurity: {
            doc: 'Enable CSRF security',
            format: Boolean,
            default: false
        },
        security: {
            enableXframe: {
                doc: 'Enable Iframe protection',
                format: Boolean,
                default: false
            },
            enableHidePoweredBy: {
                doc: 'Hide X powered by Header',
                format: Boolean,
                default: false
            },
            enableNoCaching: {
                doc: 'Enable No caching',
                format: Boolean,
                default: false
            },
            enableCSP: {
                doc: 'Enable CSP policy',
                format: Boolean,
                default: false
            },
            enableHSTS: {
                doc: 'Enable HSTS',
                format: Boolean,
                default: false
            },
            enableXssFilter: {
                doc: 'Enable XSS filter protection',
                format: Boolean,
                default: false
            },
            enableForceContentType: {
                doc: 'Enable force content type',
                format: Boolean,
                default: false
            },
            enableCORS: {
                doc: 'Enable CORS',
                format: Boolean,
                default: true
            },
            emailSalt: {
                doc: 'salt',
                format: String,
                default: "$2b$10$SkCaRt7/q7sy.k5BOtyDnu"
            }
        },
        CORS: {
            allowedHosts: {
                doc: 'Allowed Host for CORS',
                format: Array,
                default: []
            },
            allowedMethods: {
                doc: 'Allowed HTTP Methods for CORS',
                format: String,
                default: 'GET,POST,OPTIONS'
            },
            allowedHeaders: {
                doc: 'Allowed HTTP Headers for CORS',
                format: String,
                default: 'accept, x-xsrf-token,content-type, x-location, certificate, x-cache'
            },
            exposedHeaders: {
                doc: 'Exposed HTTP Headers for CORS',
                format: String,
                default: 'XSRF-TOKEN'
            }
        }
    },
    elasticsearch: {
        host: {
            doc: 'host',
            format: Array,
            default: 'localhost:9200',
            env: 'ELASTIC_HOST'
        },
        dweetIndex: {
            doc: 'index name for dweets',
            format: String,
            default: 'dweets'
        },
        userIndex: {
            doc: 'index name for users',
            format: String,
            default: 'users',
        },
        likeIndex: {
            doc: 'index name for likes',
            format: String,
            default: 'likes'
        },
        commentIndex: {
            doc: 'index name for comments',
            format: String,
            default: 'comments',
        }
    },
    logger: {
        enableSentryLog: {
            doc: 'Enable error log in sentry',
            format: Boolean,
            default: false
        },
        httpLogFormat: {
            doc: 'HTTP log format',
            format: String,
            default: ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'
        },
        path: {
            doc: 'HTTP log path',
            format: String,
            default: './logs/'
        },
        httpLogFileName: {
            doc: 'HTTP log File name',
            format: String,
            default: 'http.log'
        },
        logFileName: {
            doc: 'Log File name',
            format: String,
            default: 'logs.log'
        },
        exceptionLogFileName: {
            doc: 'Exception log File name',
            format: String,
            default: 'exceptions.log'
        },
        logFileSize: {
            doc: 'logs File Max File size',
            format: Number,
            default: 5242880
        },
        enableElasticSearchLogger: {
            doc: 'flag to check whther to enable elastic search logger',
            format: Boolean,
            default: false
        },
        elasticsearchLogIndexName: {
            doc: 'Log index name',
            format: String,
            default: 'hcuserapilog'
        },
        elasticsearchExceptionIndexName: {
            doc: 'Exception log index name',
            format: String,
            default: 'hcuserapiexception'
        }
    }
});

config.loadFile('./config-' + config.get('env') + '.json');

config.set('logger.httpLogFileName', config.get('logger.path') + config.get('logger.httpLogFileName'));
config.set('logger.logFileName', config.get('logger.path') + config.get('logger.logFileName'));
config.set('logger.exceptionLogFileName', config.get('logger.path') + config.get('logger.exceptionLogFileName'));

// validate
config.validate();

module.exports = config;