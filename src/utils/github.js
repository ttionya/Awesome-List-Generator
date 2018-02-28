'use strict';

const github = require('@octokit/rest')();
const chalk = require('chalk');
const config = require('./configFile').getConfig;
const { log4js, forceDebug } = require('./log4js');


/**
 * Authentication
 */
github.authenticate({
    type: 'token',
    token: config.github.access_token,
});

/**
 * Get repository information.
 *
 * @param owner
 * @param repo
 * @param retries
 * @returns {Promise<*>}
 */
let getRepos = async (owner, repo, retries = config.retries) => {
    const log = log4js.getLogger(`${owner}/${repo}`); // log4js

    // Log
    log[forceDebug('info')](`Request information of repository ${chalk.bold(owner + '/' + repo)}.`);

    try {
        return await github.repos.get({
            owner,
            repo,
        });
    }
    catch (error) {
        // Log
        log[forceDebug('error')](`Error Code: ${chalk.red(error.code)}, Error Message: ${chalk.red(error.status)}`);
        log[forceDebug('debug')](error);

        if (error.code === 404 || error.code === 401) {
            throw error; // 404 Not Found / 401 Unauthorized
        }
        else if (retries) {
            // Log
            log[forceDebug('warn')](`Failed to get repository information, left ${chalk.yellow(retries)} retry times.`);

            return await getRepos(owner, repo, retries - 1);
        }
        else {
            throw error;
        }
    }
};

/**
 * Get starred repository information.
 *
 * @param page
 * @param perPage
 * @param retries
 * @returns {Promise<*>}
 */
let getStarredRepos = async (page, perPage, retries = config.retries) => {
    const log = log4js.getLogger(`Starred repositories`); // log4js

    // Log
    log[forceDebug('info')](`Request starred repositories. ${chalk.blue(`(Page ${page}, PerPage ${perPage})`)}`);

    try {
        return await github.activity.getStarredRepos({
            page,
            per_page: perPage,
        });
    }
    catch (error) {
        // Log
        log[forceDebug('error')](`Error Code: ${chalk.red(error.code)}, Error Message: ${chalk.red(error.status)}`);
        log[forceDebug('debug')](error);

        if (retries) {
            // Log
            log[forceDebug('warn')](`Failed to get starred repositories list, left ${chalk.yellow(retries)} retry times.`);

            return await getStarredRepos(page, perPage, retries - 1);
        }
        else {
            throw error;
        }
    }
};


module.exports = {
    getRepos,
    getStarredRepos,
};
