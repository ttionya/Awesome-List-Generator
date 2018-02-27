'use strict';

/**
 * Do not use /config.js !!
 *
 */

const path = require('path');
const fs = require('fs');
const bluebird = require('bluebird');


let fsAccess = bluebird.promisify(fs.access);


module.exports = {
    fsAccess,
};
