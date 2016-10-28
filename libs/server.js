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
  switch (postBody.action) {
      case "add":
        return handler.add(postBody);

        break;

      case "change":
        return handler.change(postBody);

        break;

      case "delete":
        return handler._delete(postBody);

        break;

      default:
        throw '404';
  }
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
  let method = request.method;

  // GET method
  if (method === 'GET') {

  }

  // POST method
  else if (method === 'POST') {
    let postBody = '';

    request.on('data', chunk => postBody += chunk);

    request.on('end', () => {
      postBody = querystring.parse(postBody);

      // authenticate
      if (checkPassword(postBody.hash)) {

        Q.nfcall(handle, postBody)
            .then(() => {
                console.log('ok')
              response.statusCode = 200;
              response.end();
            })
            .fail(error => {
              response.statusCode = error;
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