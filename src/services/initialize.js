'use strict';

const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const promiseTools = require('../utils/promisify');
const configInfo = require('../utils/configFile');
const config = configInfo.getConfig;


let setConfig = async () => {
    /**
     * Set GitHub settings.
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
     * Set local settings.
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
     * Set generator settings.
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
     * Set server settings.
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
     * Write to config.js
     *
     */
    console.log(chalk.blue('\nWrite to config.js ...'));

    let obj = {};
    Object.assign(obj, githubAnswer, localAnswer, generatorAnswer, serverAnswer);

    let defaultConfigCtn = await configInfo.getDefaultConfigCtnP();
    Object
        .entries(obj)
        .forEach((val) => defaultConfigCtn = defaultConfigCtn.replace(`{{${val[0]}}}`, val[1]));

    await configInfo.saveConfigCtnP(defaultConfigCtn);
};


module.exports = async () => {
    console.log(chalk.bold.yellow(`Thank you for using ${config.name}.\n`));

    /**
     * Check config.js is exist.
     *
     */
    if (configInfo.isConfigExist) {
        let answer = await inquirer.prompt([{
            type: 'list',
            name: 'reinitialize',
            message: chalk.blue('Already initialized, reinitialize ?'),
            choices: [{
                name: 'Delete config.js file and reinitialize.',
                value: 0,
            }, {
                name: 'Skip config.js setting and do next step.',
                value: 1,
            }, {
                name: 'Exit',
                value: 2,
            }]
        }]);

        switch (answer.reinitialize) {
            case 0:
                await promiseTools.fsUnlink(path.join(process.env.APP_PATH, 'config.js'));
                await setConfig();

                break;
            case 1:

                break;
            case 2:
                console.log(chalk.yellow('\nExit'));
                process.exit(0);

                break;
        }
    }
    else {
        await setConfig();
    }


};
