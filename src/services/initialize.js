'use strict';

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const promiseTools = require('../utils/promisify');
const configInfo = require('../utils/configFile');
const config = configInfo.getConfig;


module.exports = async () => {
    console.log(chalk.yellow(`Thank you for using ${config.name}.\n`));

    /**
     * 1. Check config.js is exist.
     *
     */
    if (configInfo.isConfigExist) {
        let answer = await inquirer.prompt([{
            type: 'confirm',
            name: 'reinitialize',
            message: chalk.blue(`Already initialized, reinitialize ? ${chalk.yellow('(will delete /config.js)')}`),
            default: false,
        }]);

        if (!answer.reinitialize) {
            console.log(chalk.yellow('\nExit'));

            process.exit(0);
        }
    }

    /**
     * 2. Set GitHub settings.
     *
     */
    console.log(chalk.bold.yellow('Github:'));

    let githubQuestions = [{
        type: 'input',
        name: 'username',
        message: chalk.blue('What is your GitHub username ?'),
        validate: val => {
            if (val.match(/^[-_A-Za-z0-9]+$/)) {
                return true;
            }
            else {
                return chalk.red('Please enter a valid GitHub username.');
            }
        },
    }, {
        type: 'input',
        name: 'email',
        message: chalk.blue('What is your GitHub e-mail ?'),
        validate: val => {
            if (val.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                return true;
            }
            else {
                return chalk.red('Please enter a valid GitHub e-mail.');
            }
        },
    }, {
        type: 'password',
        name: 'token',
        message: chalk.blue('Entry your GitHub access token.'),
        mask: '*',
        validate: val => {
            if (val.match(/^[a-z0-9]{40}$/)) {
                return true;
            }
            else {
                return chalk.red('GitHub access token is 40 chars.');
            }
        },
    }, {
        type: 'input',
        name: 'repo',
        message: chalk.blue(`What is your remote repository name ? ${chalk.yellow('(must be exist)')}`),
        validate: val => {
            if (val.match(/^[-_A-Za-z0-9]+$/)) {
                return true;
            }
            else {
                return chalk.red('Please enter a valid GitHub repository.');
            }
        },
    }];

    let githubAnswer = await inquirer.prompt(githubQuestions);

    /**
     * 3. Set local settings.
     *
     */
    console.log(chalk.bold.yellow('Local:'));

    let localAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'localPath',
        message: chalk.blue(`Local directory of Git repository. ${chalk.yellow('(relative or absolute)')}`),
        default: 'AwesomeList',
        filter: val => path.normalize(val).replace(/\/$/, ''),
        validate: val => {
            if (val) {
                return true;
            }
            else {
                return chalk.red('Please enter a valid directory.');
            }
        },
    }]);

    /**
     * 4. Set generator settings.
     *
     */
    console.log(chalk.bold.yellow('Generator:'));

    let generatorQuestions = [{
        type: 'list',
        name: 'description',
        message: chalk.blue('Display description information in markdown.'),
        choices: [{
            name: 'Display custom description only. (default)',
            value: 'custom',
        }, {
            name: 'Display repository\'s description only.',
            value: 'default',
        }, {
            name: 'Display both repository\'s description and custom description.',
            value: 'all',
        }],
    }, {
        type: 'list',
        name: 'categories',
        message: chalk.blue('Display categories information in markdown.'),
        choices: [{
            name: 'No',
            value: false,
        }, {
            name: 'Yes',
            value: true,
        }],
    }];

    let generatorAnswer = await inquirer.prompt(generatorQuestions);

    /**
     * 5. Set server settings.
     *
     */
    console.log(chalk.bold.yellow('Server:'));

    let serverAnswer = await inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: chalk.blue(`Entry server password. ${chalk.yellow('(letters, numbers, symbol characters and at least 8 characters long)')}`),
        mask: '*',
        validate: val => {
            if (val.match(/^(?=.*\d)(?=.*[A-Za-z])(?=.*[-_=+!@#$%^&*()[\]\{}\\\/|?`~;:'",.<>])[\w-=+!@#$%^&*()[\]\{}\\\/|?`~;:'",.<>]{8,}$/)) {
                return true;
            }
            else {
                return chalk.red('Server password is not strong enough.');
            }
        },
    }]);

    /**
     * 6. Write to config.js
     *
     */
    console.log(chalk.blue('\nWrite to config.js ...'));

    let obj = {};
    Object.assign(obj, githubAnswer, localAnswer, generatorAnswer, serverAnswer);
    
    console.log(obj);
};
