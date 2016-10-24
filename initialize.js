/**
 * Initialize
 *
 */

"use strict";



/**
 * Definition
 *
 * global variable
 * block variable
 * constant
 *
 * check config file is exist
 *
 **/
const path = require('path');
global.ENV = 'initialize';
global.APP_PATH = __dirname;
global.LIBS_PATH = path.join(APP_PATH, 'libs');


const fs = require('fs')
    , colors = require('colors')
    , execSync = require('child_process').execSync
    , Q = require('q')
    , readline = require('readline')
    , language = require(path.join(LIBS_PATH, 'language.js'))               // ~/libs/language.js
;


// check config file is exist
if (!fs.existsSync(path.join(APP_PATH, 'config.js'))) {
  console.error(colors.red(language.global.not_found_config_file), colors.bold('config.js'), colors.bold('config.default.js'), colors.bold('config.js'));

  process.exit();
}


const initialize = require(path.join(LIBS_PATH, 'initialize.js'))           // ~/libs/initialize.js
    , githubFuncs = require(path.join(LIBS_PATH, 'github', 'functions.js')) // ~/libs/github/functions.js
    , config = require(path.join(APP_PATH, 'config.js'))                    // ~/config.js
;


global.LANG = config.local.language === 'zh' ? 'zh' : 'en';
global.DEBUG = false;


let reinitialized = false
    , token_file
    , writeOK = () => console.info(language.global.success)
;



/**
 * 1. Welcome
 * 2. Check config file
 * 3. Initialize
 * 4. mkdir
 * 5. Check initialize
 * 6. Git initialize
 * 7. Git config
 * 8. Write token file
 * 9. Check repo
 * 10. Push & Pull
 * 11. Get starred list
 *
 **/


/**
 * 1. Welcome
 *
 **/
console.info(language[LANG].init_welcome + '\n', colors.bold(config.name));


/**
 * 2. Check config file
 *
 **/
process.stdout.write(colors.blue(language[LANG].init_check_config_file_info));

!initialize.checkConfig() ? process.exit() : 0;

writeOK();


/**
 * 3. Initialize
 *
 **/
console.info(colors.blue(language[LANG].init_initialize_info));


/**
 * 4. mkdir
 *
 **/
process.stdout.write(colors.blue(language[LANG].init_mkdir_info));

try {
  execSync('mkdir -m 0755 -p ' + REPO_PATH, { stdio: [2] });
}
catch (e) {
  console.error(colors.red(language[LANG].init_mkdir_failed));

  process.exit();
}

writeOK();


/**
 * 5. Check initialize
 *
 **/
if (fs.existsSync(path.join(REPO_PATH, '.git', '.initialized'))) {
  console.info(colors.blue(language[LANG].init_initialized_info));

  reinitialized = true;
}


/**
 * 6. Git initialize
 *
 **/
reinitialized ?
    process.stdout.write(colors.blue(language[LANG].init_git_reinitialize_info)) :
    process.stdout.write(colors.blue(language[LANG].init_git_initialize_info));

execSync('git -C ' + REPO_PATH + ' init');

writeOK();


/**
 * 7. Git config
 *
 **/
reinitialized ?
    console.info(colors.blue(language[LANG].init_reset_git_config_info)) :
    console.info(colors.blue(language[LANG].init_set_git_config_info));

// user.name
execSync('git -C ' + REPO_PATH + ' config user.name "' + config.github.username + '"');
console.info('    user.name');

// user.email
execSync('git -C ' + REPO_PATH + ' config user.email "' + config.github.email + '"');
console.info('    user.email');

// credential.helper
token_file = path.join(REPO_PATH, '.git', '.git-credentials');
execSync('git -C ' + REPO_PATH + ' config credential.helper "store --file=' + token_file + '"');
console.info('    credential.helper');

// remote
try {
  execSync('git -C ' + REPO_PATH + ' remote rm origin', { stdio: [2] });
} catch (e) {}
execSync('git -C ' + REPO_PATH + ' remote add origin https://github.com/' + config.github.username + '/' + config.github.repo + '.git');
console.info('    remote');

writeOK();


/**
 * 8. Write token file
 *
 **/
process.stdout.write(colors.blue(language[LANG].init_write_token_file_info));

fs.writeFileSync(token_file, 'https://' + config.github.username + ':' + config.github.access_token + '@github.com');
execSync('chmod 0600 ' + token_file);

writeOK();


/**
 * 9. Check repo
 *
 **/
process.stdout.write(colors.blue(language[LANG].init_check_remote_repo_info));

checkRepo()
    .then(() => writeOK())
    .fail(error => checkRepoFailure(error))


    /**
     * 10. Push & Pull
     *
     **/
    .then(() => checkPushOrPull())
    .then(data => {
      console.info(language[LANG].init_confirm_pull_or_push_info, colors.blue(data));

      // push
      if (data === 'push') {
        process.stdout.write(colors.blue(language[LANG].init_push_info));

        // add a file if not exist
        if (!fs.existsSync(path.join(REPO_PATH, 'data.json'))) {
          fs.writeFileSync(path.join(REPO_PATH, 'data.json'), '{}');
        }

        execSync('git -C ' + REPO_PATH + ' add .', { stdio: [2] });
        try {
            execSync('git -C ' + REPO_PATH + ' commit -m "' + config.name + ' initialize"', { stdio: [2] });
        } catch (e) {}
        execSync('git -C ' + REPO_PATH + ' push origin master -f', { stdio: [2] });
      }

      // pull
      else {
        process.stdout.write(colors.blue(language[LANG].init_pull_info));

        execSync('git -C ' + REPO_PATH + ' fetch', { stdio: [2] });
        execSync('git -C ' + REPO_PATH + ' reset --hard origin/master', { stdio: [2] });
      }

      writeOK();


      // write initialized file
      fs.writeFileSync(path.join(REPO_PATH, '.git', '.initialized'), '');


      // finish initialize
      initialize.lineBreak();
      console.info(colors.green(language[LANG].init_finish_initialize_info));
    })
    .fail(error => console.error('\n' + colors.red(error.toString())))


    /**
     * 11. Get starred list
     *
     **/
    .then(() => {
      if (config.generator.history_stars) {
        initialize.lineBreak();
        console.info(colors.blue(language[LANG].init_get_starred_info));

        return require(path.join(LIBS_PATH, 'starred.js'))();
      }
    })
    .done();



/**
 * 9. Check repo
 * 10. Push & Pull
 *
 * Functions
 *
 * functions will be hoist
 *
 **/

// 9. Check repo
function checkRepo() {
  return githubFuncs.getReposQ(config.github.username, config.github.repo, config.retries, true);
}


function checkRepoFailure(error) {
  if (error.code === 404) {
    console.error(colors.red(language[LANG].init_check_remote_repo_404), colors.bold(config.github.username + '/' + config.github.repo));
  }
  else {
    initialize.outputError(error);
  }

  process.exit();
}


// 10. Push & Pull
function checkPushOrPull() {
  let def = Q.defer();

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.info(language[LANG].init_choose_pull_or_push_info,
      colors.red(language[LANG].init_choose_remote), colors.blue('pull'), colors.red(language[LANG].init_choose_local),
      colors.red(language[LANG].init_choose_local), colors.blue('push'), colors.red(language[LANG].init_choose_remote)
  );

  // ask
  (function ask() {
    rl.question('> (pull or push) ', answer => {
      if (!/pull|push/i.test(answer)) {
        ask();
      }
      else {
        rl.close();
        def.resolve(answer);
      }
    });
  })();

  return def.promise;
}