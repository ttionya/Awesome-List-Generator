/**
 * initialize
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
    , colors = require('colors')
    , language = require(path.join(LIBS_PATH, 'language.js')) // ~/libs/language.js
    , config = require(path.join(APP_PATH, 'config.js'))      // ~/config.js
;



/**
 * Because this module always load when run this tool,
 * so this function always execute.
 *
 * If you want to use `console` without timestamp,
 * please use `process.stdout`, `process.stderr` instead.
 *
 * Only run when `ENV === 'production'`.
 *
 **/
ENV === 'production' ?
    require("console-stamp")(console, {
      pattern: 'yyyy-mm-dd HH:MM:ss.l',
      metadata: '[' + Math.round(process.memoryUsage().rss / 1000).toLocaleString() + 'k' + ']', // get memory
    }) : 0;



/**
 * Functions
 *
 **/

// line break without console-stamp
let lineBreak = () => process.stdout.write('\n');


// check config file
function checkConfig() {
  let flag = true;


  /**
   * empty
   *
   **/

  // debug
  if (typeof(config.debug) !== 'boolean') {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_debug));

    flag = false;
  }

  // third_party_module_debug
  if (typeof(config.third_party_module_debug) !== 'boolean') {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_third_party_module_debug));

    flag = false;
  }


  /**
   * github
   *
   **/

  // username
  if (!config.github.username) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_github_username));

    flag = false;
  }

  // email
  if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(config.github.email)) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_github_email));

    flag = false;
  }

  // access_token
  if (!/^[A-Za-z0-9]{40}$/.test(config.github.access_token)) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_github_access_token));

    flag = false;
  }

  // repo
  if (!/^[A-Za-z0-9-_.]+$/.test(config.github.repo)) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_github_repo));

    flag = false;
  }


  /**
   * local
   *
   **/

  // path
  global.REPO_PATH = path.resolve(path.join(APP_PATH, config.local.path));
  if (REPO_PATH === APP_PATH) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_local_path));

    global.REPO_PATH = '';

    flag = false;
  }

  // language
  if (!/^en$|^zh$/.test(config.local.language)) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_local_language));

    flag = false;
  }


  /**
   * generator
   *
   **/

  // history_stars
  if (typeof(config.generator.history_stars) !== 'boolean') {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_generator_history_stars));

    flag = false;
  }

  // description
  if (!/^all$|^default$|^custom$/.test(config.generator.description)) {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_generator_description));

    flag = false;
  }

  // categories
  if (typeof(config.generator.categories) !== 'boolean') {
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_generator_categories));

    flag = false;
  }


  /**
   * server
   *
   **/

  // port
  if (!/^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(config.server.port.toString())) { // 0 - 65535
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_server_port));

    flag = false;
  }
  else if (config.server.port < 1024) {
    flag ? lineBreak() : 0;

    console.warn(colors.yellow(language[LANG].check_config_server_port_1024));
  }

  // password
  if (!/^(?=.*\d)(?=.*[A-Za-z])(?=.*[-_=+!@#$%^&*()[\]\{}\\\/|?`~;:'",.<>])[\w-=+!@#$%^&*()[\]\{}\\\/|?`~;:'",.<>]{8,}$/.test(config.server.password)) { // 0 - 65535
    flag ? lineBreak() : 0;

    console.error(colors.red(language[LANG].check_config_server_password));

    flag = false;
  }



  return flag;
}


// output error information
let outputError = error => {
  console.error(colors.red('Error: ' + error.status + ' (' + error.code + ')'));
  console.error(colors.red('Message: ' + error.message));
};



module.exports = (() => {
  return {
    lineBreak: lineBreak,
    checkConfig: checkConfig,
    outputError: outputError
  }
})();