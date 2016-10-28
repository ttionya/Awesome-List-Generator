/**
 * Test port is available
 *
 */

"use strict";



/**
 * Definition
 *
 * block variable
 * constant
 *
 **/
const path = require('path')
    , net = require('net')
    , colors = require('colors')
    , config = require(path.join(__dirname, 'config.js'))
;


const PORT = config.server.port;


let server = net.createServer().listen(PORT);


server.on('listening', () => {
  server.close();

  console.info(colors.blue('The port 【' + PORT + '】 is available. You can run `npm run start` to start.'));
});


server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(colors.red('The port 【' + PORT + '】 has been occupied, please change it.'));
  }
  else if (error.code === 'EACCES') {
    console.error(colors.red('You must run as root when listen a port below 1024.'));
  }
  else {
    console.error(error);
  }
});