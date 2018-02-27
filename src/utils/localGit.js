const path = require('path');
const nodegit = require('nodegit');
const chalk = require('chalk');
const config = require('./configFile').getConfig;
const log4js = require('./log4js');

const localPath = config.local.path;
const repoPath = path.isAbsolute(localPath) ? localPath : path.join(process.env.APP_PATH, localPath);


/**
 * Git clone.
 *
 * @returns {Promise<*>}
 */
let gitClone = async () => {
    const log = log4js.getLogger(`Git Clone`); // log4js

    let repoName = `${config.github.username}/${config.github.repo}`;

    // Log
    log.info(`Git: Clone ${chalk.bold(repoName)} into ${chalk.blue(repoPath)}`);

    return await nodegit.Clone(`https://github.com/${repoName}`, repoPath, {
        fetchOpts: {
            callbacks: {
                certificateCheck: () => 1,
                credentials: () => nodegit.Cred.userpassPlaintextNew(config.github.access_token, 'x-oauth-basic'),
            },
        },
    });
};

let gitPush = () => {
    const log = log4js.getLogger(`Git Push`); // log4js

    // execSync('git -C ' + REPO_PATH + ' add .', DEBUG ? undefined : { stdio: [2] });
    //
    // try {
    //     execSync('git -C ' + REPO_PATH + ' commit -m "' + commentary + '"', DEBUG ? undefined : { stdio: [2] });
    // } catch (e) {}
    //
    // execSync('git -C ' + REPO_PATH + ' push origin master -f', DEBUG ? undefined : { stdio: [2] });
};

let gitPull = () => {
    const log = log4js.getLogger(`Git Push`); // log4js

    // execSync('git -C ' + REPO_PATH + ' fetch', DEBUG ? undefined : { stdio: [2] });
    // execSync('git -C ' + REPO_PATH + ' reset --hard origin/master', DEBUG ? undefined : { stdio: [2] });
};


module.exports = {
    gitClone,
    gitPush,
    gitPull,
};
