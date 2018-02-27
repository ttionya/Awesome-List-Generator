'use strict';

const path = require('path');
const fs = require('fs');


let isConfigExist = true;

let getConfig = (() => {
    isConfigExist = true;

    try {
        fs.accessSync(path.join(process.env.APP_PATH, 'config.js'), fs.constants.F_OK);
    }
    catch (e) {
        isConfigExist = false;
    }

    return require(path.join(process.env.APP_PATH, isConfigExist ? 'config.js' : 'config.default.js'));
})();

let getDefaultConfig = () => require(path.join(process.env.APP_PATH, 'config.default.js'));


module.exports = {
    isConfigExist,
    getConfig,
    getDefaultConfig,
};
