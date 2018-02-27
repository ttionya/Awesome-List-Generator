process.env.APP_PATH = __dirname;

const inquirer = require('inquirer');
const chalk = require('chalk');
const github = require('./src/utils/github');
const localGit = require('./src/utils/localGit');
const initialize = require('./src/services/initialize');

(async () => {
    // try {
    //     let result = await github.getRepos('ttionya', 'test1');
    //
    //     console.log(result);
    // }
    // catch (error) {
    //     console.log(error);
    // }

    // try {
    //     let result = await github.getStarredRepos(1, 30);
    //
    //     console.log(result);
    // }
    // catch (error) {
    //     console.log(error);
    // }

    // try {
    //     let result = await localGit.gitClone();
    //
    //     console.log(result);
    // }
    // catch (error) {
    //     console.error(error);
    // }
})();

initialize();

