#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const bluebird = require('bluebird');
const chalk = require('chalk');
const packageConfig = require('../package');


process.env.APP_PATH = __dirname;


let fsAccess = bluebird.promisify(fs.access);
fsAccess(path.join(process.env.APP_PATH, 'dist/index.js'))
    .catch(() => {
        console.log(chalk.red(`Please run ${chalk.yellow(`【npm run build】`)} first.`));

        // process.exit(0);
    })

    // Success
    .then(() => {
        program
            .version(packageConfig.version)
            .command('<command>')
            .description('npm run awesome -- command')


            .action(function (command) {
                console.log(command)
            })
            .parse(process.argv);
    });
