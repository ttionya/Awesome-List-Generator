/**
 * Git functions
 *
 **/

"use strict";



/**
 * Definition
 *
 * global variable
 * block variable
 * constant
 *
 * check config file is exist
 *
 **/
const path = require('path')
    , execSync = require('child_process').execSync
    // , language = require(path.join(LIBS_PATH, 'git.js')) // ~/libs/git.js
;



function push(commentary, consoleInfo) {
  execSync('git -C ' + REPO_PATH + ' add .', DEBUG ? undefined : { stdio: [2] });

  try {
    execSync('git -C ' + REPO_PATH + ' commit -m "' + commentary + '"', DEBUG ? undefined : { stdio: [2] });
  } catch (e) {}

  execSync('git -C ' + REPO_PATH + ' push origin master -f', DEBUG ? undefined : { stdio: [2] });

  // consoleInfo ? consoleInfo.info(language[LANG]) : 0;
}



function pull() {
  execSync('git -C ' + REPO_PATH + ' fetch', DEBUG ? undefined : { stdio: [2] });
  execSync('git -C ' + REPO_PATH + ' reset --hard origin/master', DEBUG ? undefined : { stdio: [2] });
}



module.exports.push = push;
module.exports.pull = pull;