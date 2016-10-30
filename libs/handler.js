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



function info(postBody) {
  let returnObject = {}
      , categoriesSet = new Set()
      , dataObjects
      ;

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))

      /**
       * get custom description and custom categories
       *
       * Note: It will return null if repo not exist,
       *     and it will return empty string if repo is exist but don't have custom description.
       *     For custom categories, will return array.
       *
       **/
      .then(() => {
        returnObject.description = null;
        returnObject.categories = [];
        returnObject.repoAddress = 'https://github.com/' + config.github.username + '/' + config.github.repo;

        if (checkPostBody(postBody)) {
          for (let id in dataObjects) {
            let tmpItem = dataObjects[id];

            if (tmpItem.name === postBody.owner.trim() + '/' + postBody.repo.trim()) {
              returnObject.description = tmpItem.cDescription;
              returnObject.categories = tmpItem.cCategories && tmpItem.cCategories.split(', ') || []; // return array
            }
          }
        }
      })

      /**
       * get all categories
       *
       * Note: It will return empty string.
       *
       **/
      .then(() => {
        if (postBody.flag) {
          let tmpArray;

          for (let id in dataObjects) {
            let tmpItem = dataObjects[id]
                , tmpCatArr = tmpItem.cCategories.split(', ')
                ;

            for (let category of tmpCatArr) {
              categoriesSet.add(category);
            }
          }

          tmpArray = Array.from(categoriesSet).sort();
          tmpArray.length > 0 && tmpArray[0] === '' && tmpArray.shift();

          returnObject.allCategories = tmpArray;
        }
      })

      .then(() => JSON.stringify(returnObject))

      /**
       * error
       *
       **/
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        throw {
          code: 500,
          message: 'Something wrong.'
        };
      }); // no done()
}



function add(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    return Q.reject({
      code: 403,
      message: 'Missing parameters.'
    });
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        if (error.code === 404) {
          return Q.reject({
            flag: 'ALG',
            code: 404,
            message: 'Not found repository ' + postBody.owner + '/' + postBody.repo + '.'
          });
        }
        else {
          return Q.reject({
            flag: 'ALG',
            code: 500,
            message: 'Something wrong.'
          });
        }
      })
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
       **/
      .then(() => {
        git.push('update README files');

        return 'Success.';
      })

      /**
       * error
       *
       **/
      .fail(error => {

        if (error.flag === 'ALG') {
          delete error.flag;
          throw error;
        }
        else {

          // DEBUG
          DEBUG ? console.log(error) : 0;

          throw {
            code: 500,
            message: 'Something wrong.'
          };
        }
      }); // no done()
}



function update(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    return Q.reject({
      code: 403,
      message: 'Missing parameters.'
    });
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        if (error.code === 404) {
          return Q.reject({
            flag: 'ALG',
            code: 404,
            message: 'Not found repository ' + postBody.owner + '/' + postBody.repo + '.'
          });
        }
        else {
          return Q.reject({
            flag: 'ALG',
            code: 500,
            message: 'Something wrong.'
          });
        }
      })
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
          cDescription: postBody.description,
          cCategories: postBody.categories,
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
       **/
      .then(() => {
        git.push('update README files');

        return 'Success.';
      })

      /**
       * error
       *
       **/
      .fail(error => {

        if (error.flag === 'ALG') {
          delete error.flag;
          throw error;
        }
        else {

          // DEBUG
          DEBUG ? console.log(error) : 0;

          throw {
            code: 500,
            message: 'Something wrong.'
          };
        }
      }); // no done()
}



function del(postBody) {
  let dataObjects;

  // check postBody
  if (!checkPostBody(postBody)) {
    return Q.reject({
      code: 403,
      message: 'Missing parameters.'
    });
  }

  return Q.nfcall(fs.readFile, path.join(REPO_PATH, 'data.json'))
      .then(result => dataObjects = JSON.parse(result))


      /**
       * get information about repo
       *
       **/
      .then(() => githubFuncs.getReposQ(postBody.owner, postBody.repo, config.retries))
      .fail(error => {

        // DEBUG
        DEBUG ? console.log(error) : 0;

        if (error.code === 404) {
          return Q.reject({
            flag: 'ALG',
            code: 404,
            message: 'Not found repository ' + postBody.owner + '/' + postBody.repo + '.'
          });
        }
        else {
          return Q.reject({
            flag: 'ALG',
            code: 500,
            message: 'Something wrong.'
          });
        }
      })
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
       **/
      .then(() => {
        git.push('update README files');

        return 'Success.';
      })

      /**
       * error
       *
       **/
      .fail(error => {

        if (error.flag === 'ALG') {
          delete error.flag;
          throw error;
        }
        else {

          // DEBUG
          DEBUG ? console.log(error) : 0;

          throw {
            code: 500,
            message: 'Something wrong.'
          };
        }
      }); // no done()
}


module.exports.info = info;
module.exports.add = add;
module.exports.update = update;
module.exports.del = del;