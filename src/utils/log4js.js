const log4js = require('log4js');
const config = require('./configFile').getConfig;


module.exports = (() => {
    'use strict';

    let logConfig = {
        appenders: {
            console: {
                type: 'console',
            }
        },
        categories: {
            default: {
                appenders: ['console'],
                level: config.log4js.logLevel,
            }
        }
    };

    // Save to file
    if (config.log4js.logFile) {
        logConfig.appenders.file = {
            type: 'file',
            filename: config.log4js.logFile,
            maxLogSize: 512 * 1024 * 1024, // 512M
            backups: 4,
        };

        logConfig.categories.default.appenders.push('file');
    }

    // Use configure
    log4js.configure(logConfig);

    return log4js;
})();
