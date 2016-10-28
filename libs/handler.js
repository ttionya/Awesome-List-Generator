/**
 * handler
 *
 */

"use strict";



/**
 * Definition
 *
 * constant
 *
 **/
const path = require('path')
    , http = require('http')
    , querystring = require('querystring')
    , util = require('util')
    , fs = require('fs')
    , Q = require('q')
    , handler = require(path.join(LIBS_PATH, 'handler.js'))                 // ~/libs/handler.js
    , generator = require(path.join(LIBS_PATH, 'generator.js'))             // ~/libs/generator.js
    , githubFuncs = require(path.join(LIBS_PATH, 'github', 'functions.js')) // ~/libs/github/functions.js
    , git = require(path.join(LIBS_PATH, 'git.js'))                         // ~/libs/git.js
    , config = require(path.join(APP_PATH, 'config.js'))                    // ~/config.js
;



/**
 * {
 *            name: String,
 *     description: String,
 *        language: String,
 *    cDescription: String,
 *     cCategories: String,
 *        starDate: Number
 * }
 **/


/**
 * Functions
 *
 **/

let checkPostBody = postBody => typeof(postBody.owner) !== 'undefined' && typeof(postBody.repo) !== 'undefined' ? true : false;



function add(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    throw '403';
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .then(result => {
        let tmpObject = {
          name: result.full_name,
          description: result.description,
          lang: result.language,
          cDescription: postBody.description || '',
          cCategories: postBody.categories || '',
          starDate: Date.now()
        };

        dataObjects[result.id] = tmpObject;
      })


      /**
       * store
       *
       **/
      .then(() => Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'data.json'), JSON.stringify(dataObjects))) // success and write into data.json


      /**
       * generate markdown file
       *
       **/
      .then(() => generator(dataObjects))


      /**
       * push to remote repository
       *
       * TODO here are some bugs.
       **/
      .then(() => {
          git.push('update README files');

          throw '200';
      })

      /**
       * error
       *
       **/
      .fail(error => {
        if (error === '200') {
          throw error;
        }
        else {

          // DEBUG
          DEBUG ? console.log(error) : 0;

          throw '500';
        }
      }); // no done()
}



function change(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    throw '403';
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .then(result => {
        if (!dataObjects[result.id]) {
          return add(postBody);
        }
        else {
          return result;
        }
      })
      .then(result => {
        let tmpItem = dataObjects[result.id];

        let tmpObject = {
          name: result.full_name,
          description: result.description,
          lang: result.language,
          cDescription: typeof(postBody.description) === 'undefined' ? '' : postBody.description ||tmpItem.cDescription,
          cCategories: typeof(postBody.categories) === 'undefined' ? '' : postBody.categories || tmpItem.categories,
          starDate: tmpItem.starDate
        };

          dataObjects[result.id] = tmpObject;
      })


        /**
         * store
         *
         **/
        .then(() => Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'data.json'), JSON.stringify(dataObjects))) // success and write into data.json


        /**
         * generate markdown file
         *
         **/
        .then(() => generator(dataObjects))


        /**
         * push to remote repository
         *
         * TODO here are some bugs.
         **/
        .then(() => {
            git.push('update README files');

            throw '200';
        })

        /**
         * error
         *
         **/
        .fail(error => {
          if (error === '200') {
            throw error;
          }
          else {

            // DEBUG
            DEBUG ? console.log(error) : 0;

            throw '500';
          }
        }); // no done()
}



function _delete(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    throw '403';
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .then(result => delete dataObjects[result.id])


      /**
       * store
       *
       **/
      .then(() => Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'data.json'), JSON.stringify(dataObjects))) // success and write into data.json


      /**
       * generate markdown file
       *
       **/
      .then(() => generator(dataObjects))


      /**
       * push to remote repository
       *
       * TODO here are some bugs.
       **/
      .then(() => {
        git.push('update README files');

        throw '200';
      })

      /**
       * error
       *
       **/
      .fail(error => {
        if (error === '200') {
          throw error;
        }
        else {

          // DEBUG
          DEBUG ? console.log(error) : 0;

          throw '500';
        }
      }); // no done()
}


module.exports.add = add;
module.exports.change = change;
module.exports._delete = _delete;