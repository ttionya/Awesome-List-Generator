"use strict";

const url = require('url'),
    fs = require('fs'),
    colors = require('colors'),
    github = require('./libs/github'),
    execSync = require('child_process').execSync,
    Q = require('q'),
    config = require('./config-develop');

function route(request) {

  var postBody = request;

  // 'id': {
  // name: ''
  // description: ''
  // categories: ''
  // }


  Q.nfcall(github.repos.get, {
    owner: postBody.owner,
    repo: postBody.repo
  })


      .then(function (val) {
    if (val.message) {
      console.log('error');
    }
    else {

      /** id: {
           *           name: String,
           *    description: String,
           *           lang: String,
           *   cDescription: String,
           *    cCategories: String,
           *       starDate: Number
           * }
       **/

      let obj = {
        name: val.full_name,
        description: val.description,
        lang: val.language,
        cDescription: postBody.description,
        cCategories: postBody.categories,
        starDate: Date.now()
      };

      if (!fs.existsSync('./stars/data.json')) {
        fs.writeFileSync('./stars/data.json', '{}');
      }

      // readFile
      let data = fs.readFileSync('./stars/data.json').toString();
      data = JSON.parse(data);

      data[val.id] = obj;

      fs.writeFileSync('./stars/data.json', JSON.stringify(data));

      console.log('done');

      console.log(colors.green(JSON.stringify(data)));

      let a = require('./libs/generator');
      Q(a(data))
          .then(() => console.log('success'))
          .done();


      execSync('git -C ./stars add .', { stdio: [2] });
      try {
        execSync('git -C ./stars commit -m "Update README files"', { stdio: [2] });
      } catch (e) {}
      execSync('git -C ./stars push origin master -f', { stdio: [2] });
    }

  })
      .fail(error => console.log(error));



}

module.exports = route;