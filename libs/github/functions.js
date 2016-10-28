/**
 * github functions
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
    , Q = require('q')
    , github = require(path.join(LIBS_PATH, 'github.js'))         // ~/libs/github.js
    , language = require(path.join(LIBS_PATH, 'language.js'))     // ~/libs/language.js
;



function getReposQ(owner, repo, retries, first = false){

  // DEBUG
  DEBUG ? console.log(language[LANG].debug_getRepos_information_info, colors.bold(owner + '/' + repo)) : 0;

  return Q.nfcall(github.repos.get, {
    owner: owner,
    repo: repo
  })
      .then(result => result)
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        if (error.code === 404) {
          throw error; // 404 Not Found
        }
        else if (retries) {
          console.warn((first && ENV === 'initialize' ? '\n' : '') + colors.yellow(language[LANG].info_get_repos_retry), retries);

          return getReposQ(owner, repo, retries - 1);
        }
        else {
          throw error;
        }
      }); // no done()
}


function getStarredReposQ(page, perPage, retries) {

  // DEBUG
  DEBUG ? console.log(language[LANG].debug_getStarredRepos_info, page, perPage) : 0;

  return Q.nfcall(github.activity.getStarredRepos, {
    per_page: perPage,
    page: page
  })
      .then(result => result)
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        if (retries) {
          console.warn(colors.yellow(language[LANG].info_get_starred_repos_retry), retries);

          return getStarredReposQ(page, perPage, retries - 1);
        }
        else {
          throw error;
        }
      }); // no done()
}



module.exports.getReposQ = getReposQ;
module.exports.getStarredReposQ = getStarredReposQ;