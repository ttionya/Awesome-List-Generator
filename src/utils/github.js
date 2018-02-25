'use strict';

const path = require('path');
const github = require('@octokit/rest')();
const chalk = require('chalk');
const config = require(path.join(process.env.APP_PATH, 'config.js'));
const log4js = require('./log4js');


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
 * @returns {Promise<T>}
 */
let getRepos = (owner, repo, retries = config.retries) => {
    const log = log4js.getLogger(`${owner}/${repo}`); // log4js

    // Log
    log.info(`Request information of repository ${chalk.bold(owner + '/' + repo)}.`);

    return github.repos.get({
        owner,
        repo,
    })
        .then(result => result)
        .catch(error => {
            // Log
            log.error(`Error Code: ${chalk.red(error.code)}, Error Message: ${chalk.red(error.status)}`);
            log.debug(error);

            if (error.code === 404 || error.code === 401) {
                throw error; // 404 Not Found / 401 Unauthorized
            }
            else if (retries) {
                // Log
                log.warn(`Failed to get repository information, left ${chalk.yellow(retries)} retry times.`);

                return getRepos(owner, repo, retries - 1);
            }
            else {
                throw error;
            }
        });
};

/**
 * Get starred repository information.
 *
 * @param page
 * @param perPage
 * @param retries
 * @returns {Promise<T>}
 */
let getStarredRepos = (page, perPage, retries = config.retries) => {
    const log = log4js.getLogger(`Starred repositories`); // log4js

    // Log
    log.info(`Request starred repositories. ${chalk.blue(`(Page ${page}, PerPage ${perPage})`)}`);

    return github.activity.getStarredRepos({
        page,
        per_page: perPage,
    })
        .then(result => result)
        .catch(error => {
            // Log
            log.error(`Error Code: ${chalk.red(error.code)}, Error Message: ${chalk.red(error.status)}`);
            log.debug(error);

            if (retries) {
                // Log
                log.warn(`Failed to get starred repositories list, left ${chalk.yellow(retries)} retry times.`);

                return getStarredRepos(page, perPage, retries - 1);
            }
            else {
                throw error;
            }
        });
};


module.exports = {
    getRepos,
    getStarredRepos,
};
