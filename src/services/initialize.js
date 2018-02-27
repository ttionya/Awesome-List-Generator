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
            message: chalk.blue('Already initialized, reinitialize ? (will delete /config.js)'),
            default: false,
        }]);

        if (!answer.reinitialize) {
            console.log(chalk.yellow('\nExit'));

            process.exit(0);
        }
    }
    // let questions = [
    //     {
    //         type: 'list',
    //         name: 'size',
    //         message: chalk.green('What size do you need?'),
    //         choices: ['Large', 'Medium', 'Small'],
    //         filter: function(val) {
    //             return val.toLowerCase();
    //         }
    //     },
    // ];
    //
    // inquirer.prompt(questions).then(answers => {
    //     console.log(JSON.stringify(answers));
    // });
};
