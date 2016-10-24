/**
 * github authenticate
 *
 **/

"use strict";



/**
 * Definition
 *
 * constant
 *
 **/
const path = require('path')
    , config = require(path.join(APP_PATH, 'config.js')) // ~/config.js
;



const authenticate = github => {
  github.authenticate({
    type: "token",
    token: config.github.access_token
  });
};



module.exports = authenticate;