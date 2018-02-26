'use strict';

const fs = require('fs');
const path = require('path');
const bluebird = require('bluebird');
const chalk = require('chalk');


process.env.APP_PATH = __dirname;


let fsAccess = bluebird.promisify(fs.access);
fsAccess(path.join(process.env.APP_PATH, 'dist/index.js'))
    .catch(() => {
        console.log(chalk.red(`Please run ${chalk.yellow(`【npm run build】`)} first.`));

        process.exit(0);
    })

    // Success
    .then(() => {
        let argv = process.argv;

        argv.length < 3 && process.exit(0);

        switch (process.argv[2]) {
            case 'init':
                const init = require(path.join(process.env.APP_PATH, 'dist/initialize.js'));
        }
    });
