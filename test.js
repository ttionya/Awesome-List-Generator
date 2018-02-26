process.env.APP_PATH = __dirname;

const github = require('./src/utils/github');
const localGit = require('./src/utils/localGit');

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

    try {
        let result = await localGit.gitClone();

        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
})();

