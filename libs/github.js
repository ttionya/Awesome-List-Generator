/**
 * github initialize
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
    , Github = require('github')
    , authenticate = require(path.join(LIBS_PATH, 'github', 'authenticate.js')) // ~/libs/github/authenticate.js
    , config = require(path.join(APP_PATH, 'config.js'))                        // ~/config.js
;



const github = new Github({
  protocol: "https",
  host: "api.github.com",
  timeout: 10000,
  debug: config.third_party_module_debug
});

authenticate(github);



module.exports = github;