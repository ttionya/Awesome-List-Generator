'use strict';

const path = require('path');
const fs = require('fs');
const promisifyTools = require('./promisify');

const APP_PATH = process.env.APP_PATH;


let isConfigExist = true;

let getConfig = (() => {
    isConfigExist = true;

    try {
        fs.accessSync(path.join(APP_PATH, 'config.js'), fs.constants.F_OK);
    }
    catch (e) {
        isConfigExist = false;
    }

    return require(path.join(APP_PATH, isConfigExist ? 'config.js' : 'config.default.js'));
})();

let getDefaultConfigCtnP = async () => await promisifyTools.fsReadFile(path.join(APP_PATH, 'config.default.js'), 'utf-8');

let saveConfigCtnP = async ctn => await promisifyTools.fsWriteFile(path.join(APP_PATH, 'config.js'), ctn);


module.exports = {
    isConfigExist,
    getConfig,
    getDefaultConfigCtnP,
    saveConfigCtnP,
};
