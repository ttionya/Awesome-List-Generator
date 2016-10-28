/**
 * get starred repos
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
    , fs = require('fs')
    , colors = require('colors')
    , Q = require('q')
    , initialize = require(path.join(LIBS_PATH, 'initialize.js'))           // ~/libs/initialize.js
    , githubFuncs = require(path.join(LIBS_PATH, 'github', 'functions.js')) // ~/libs/github/functions.js
    , generator = require(path.join(LIBS_PATH, 'generator.js'))             // ~/libs/generator.js
    , git = require(path.join(LIBS_PATH, 'git.js'))                         // ~/libs/git.js
    , language = require(path.join(LIBS_PATH, 'language.js'))               // ~/libs/language.js
    , config = require(path.join(APP_PATH, 'config.js'))                    // ~/config.js
;


const perPage = 1;          // the number of entries per load by getStarredRepos(), MAX 100


let dataObjects             // store objects
    , timestamp = 1e9       // timestamp, from 1e9 to 0
;



function starred() {

  // read and format data from data.json
  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))
      .fail(error => {
        console.error(colors.red(language[LANG].error_starred_get_data));

        // DEBUG
        DEBUG ? console.log(error) : 0;

        process.exit();
      })


      /**
       * store starred repos in dataObjects
       *
       **/
      .then(() => getStarredRepos())
      .then(() => Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'data.json'), JSON.stringify(dataObjects))) // success and write into data.json
      .fail(error => {
        console.error(colors.red(language[LANG].error_starred_write_data));

        // DEBUG
        DEBUG ? console.log(error) : 0;

        process.exit();
      })


      /**
       * generate markdown file
       *
       **/
      .then(() => {
          initialize.lineBreak();
          return console.info(colors.blue(language[LANG].info_get_starred_repos_generate));
      })
      .then(() => generator(dataObjects)) // only return success
      .then(result => console.info(colors.green(language[LANG].info_get_starred_repos_generate_ok), result))


      /**
       * push to remote repository
       *
       **/
      .then(() => git.push('import from starred'))
      .fail(error => {
          console.error(error);

          process.exit();
      })
  ; // no done()
}



function getStarredRepos(page = 1) {
  return githubFuncs.getStarredReposQ(page, perPage, config.retries)
      .then(result => {
        const starredListLen = result.length;

        // progress
        if (starredListLen) {
          console.info(colors.blue(language[LANG].info_get_starred_repos_progress), page, starredListLen);
        }

        for (let i = 0, starredRepoInfo, tmpData; i < starredListLen; i++) {
          starredRepoInfo = result[i];

          /** id: {
           *           name: String,
           *    description: String,
           *           lang: String,
           *   cDescription: String,
           *    cCategories: String,
           *       starDate: Number
           * }
           **/

          tmpData = dataObjects[starredRepoInfo.id];

          // exist in data.json (update)
          if (tmpData) {
            tmpData.name = starredRepoInfo.full_name;
            tmpData.description = starredRepoInfo.description;
            tmpData.lang = starredRepoInfo.language;

            if (tmpData.starDate < 1e9) {
              tmpData.starDate = --timestamp;
            }
          }

          // not exist in data.json (add)
          else {
            dataObjects[starredRepoInfo.id] = {
              name: starredRepoInfo.full_name,
              description: starredRepoInfo.description,
              lang: starredRepoInfo.language,
              cDescription: '',
              cCategories: '',
              starDate: --timestamp
            }
          }
        }

        // next page
        if (starredListLen === perPage) {
          return getStarredRepos(page + 1);
        }
      })
      .fail(error => {
        initialize.outputError(error);

        // DEBUG
        DEBUG ? console.log(error) : 0;

        // TODO websocket

        process.exit();
      }); // no done()
}



module.exports = starred;