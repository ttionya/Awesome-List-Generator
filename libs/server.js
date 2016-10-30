/**
 * Server
 *
 * This page will refactor in the future.
 * It just can work now.
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
    , Q = require('q')
    , handler = require(path.join(LIBS_PATH, 'handler.js')) // ~/libs/handler.js
    , config = require(path.join(APP_PATH, 'config.js'))    // ~/config.js
    ;



/**
 * Router
 *
 **/
function route(request, response) {
  // TODO not in use now
}



/**
 * Handler
 *
 **/
function handle(postBody) {
  let def = Q.defer();

  switch (postBody.action) {

    // get description and all categories by repo
    case "info":
      handler.info(postBody)
          .then(result => def.resolve(result))
          .fail(error => def.reject(error))
          .done();

      break;

    case "add":
      handler.add(postBody)
          .then(result => def.resolve(result))
          .fail(error => def.reject(error))
          .done();

      break;

    case "update":
      handler.update(postBody)
          .then(result => def.resolve(result))
          .fail(error => def.reject(error))
          .done();

      break;

    case "delete":
      handler.del(postBody)
          .then(result => def.resolve(result))
          .fail(error => def.reject(error))
          .done();

      break;

    // check server is ready
    case "conform":
      def.resolve('Validation was successful.');

      break;

    default:
      def.reject({
        code: '404',
        message: 'Not found matching action.'
      });
  }

  return def.promise;
}


/**
 * Check password
 *
 * It will change to AES in the future.
 *
 * Use AES encrypt timestamp, and check this request is initiate in 5 minute.
 * In order to prevent attack, should cache timestamp and do not response again.
 *
 **/
function checkPassword(password) {
  return password === config.server.password;
}


/**
 * onRequest
 * 
 **/
function onRequest(request, response) {

  // Only support POST method
  if (request.method === 'POST') {
    let postBody = '';

    request.on('data', chunk => postBody += chunk);

    request.on('end', () => {
      postBody = querystring.parse(postBody);

      // authenticate
      if (checkPassword(postBody.hash)) {

        handle(postBody)
            .then(result => {
              response.statusCode = 200;
              response.write(result);
              response.end();
            })
            .fail(error => {
              response.statusCode = error.code;
              response.write(error.message);
              response.end();
            })
            .done();
      }
      else {

        // DEBUG
        console.warn('unauthorized: ' + (DEBUG ? util.inspect(postBody) : postBody.hash));

        response.statusCode = 401;
        response.end();
      }
    });
  }

  // Other method
  else {
    response.statusCode = 405;
    response.end();
  }
}


/**
 * Server start
 *
 **/
let start = () => http.createServer(onRequest).listen(config.server.port);



module.exports = start;