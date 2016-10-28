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


const fs = require('fs')
    , colors = require('colors')
    , language = require(path.join(LIBS_PATH, 'language.js'))     // ~/libs/language.js
;


// check config file is exist
if (!fs.existsSync(path.join(APP_PATH, 'config.js'))) {
  console.error(colors.red(language.global.not_found_config_file), colors.bold('config.js'), colors.bold('config.default.js'), colors.bold('config.js'));

  process.exit();
}


const initialize = require(path.join(LIBS_PATH, 'initialize.js')) // ~/libs/initialize.js
    , config = require(path.join(APP_PATH, 'config.js'))          // ~/config.js
;


global.LANG = config.local.language === 'zh' ? 'zh' : 'en';
global.DEBUG = config.debug ? true : false;


// check config file
!initialize.checkConfig() ? process.exit() : 0;



/**
 * Start
 *
 **/
require(path.join(LIBS_PATH, 'server.js'))();