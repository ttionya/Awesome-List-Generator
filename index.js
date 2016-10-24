/**
 * Index
 *
 */

"use strict";



/**
 * Definition
 *
 * global variable
 * block variable
 * constant
 *
 * check config file is exist
 * check config file
 *
 **/
const path = require('path');
global.ENV = 'production';
global.APP_PATH = __dirname;
global.LIBS_PATH = path.join(APP_PATH, 'libs');


const http = require('http')
    , querystring = require('querystring')
    , fs = require('fs')
    , colors = require('colors')
    , language = require(path.join(LIBS_PATH, 'language.js'))               // ~/libs/language.js
;


// check config file is exist
if (!fs.existsSync(path.join(APP_PATH, 'config.js'))) {
  console.error(colors.red(language.global.not_found_config_file), colors.bold('config.js'), colors.bold('config.default.js'), colors.bold('config.js'));

  process.exit();
}


const githubFuncs = require(path.join(LIBS_PATH, 'github', 'functions.js')) // ~/libs/github/functions.js
    , initialize = require(path.join(LIBS_PATH, 'initialize.js'))           // ~/libs/initialize.js
    , config = require(path.join(APP_PATH, 'config.js'))                    // ~/config.js
// route = require('./route');
;


global.LANG = config.local.language === 'zh' ? 'zh' : 'en';
global.DEBUG = config.debug ? true : false;


// check config file
!initialize.checkConfig() ? process.exit() : 0;


/**
 *
 *
 **/
var check = (v) => true; // TODO


// http.createServer(function (request, response) {
//   var postBody = '';
//
//   request.on('data', function (chunk) {
//     postBody += chunk;
//   });
//
//   request.on('end', function () {
//     postBody = querystring.parse(postBody);
//
//     if (check(postBody)) {
//       route(postBody);
//       // TODO
//     }
//
//     response.statusCode = 204;
//     response.end();
//   });
//
//
// }).listen(config.server.port);

const Q = require('q')
    //, starred = require('./libs/starred');

//console.log(require('path').resolve('./'));


 // require('./libs/starred')();

require('./libs/generator')(JSON.parse(fs.readFileSync(path.join(REPO_PATH, 'data.json'))));

//githubFuncs.getReposQ(config.github.username, config.github.repo, 3);
