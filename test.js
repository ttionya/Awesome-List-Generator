process.env.APP_PATH = __dirname;

const github = require('./src/utils/github');
const localGit = require('./src/utils/localGit');

// github.getRepos('ttionya', 'test1')
//     .then(result => console.log(result))
//     .catch(error => {
//         // console.log(error);
//     });

// github.getStarredRepos(1, 30)
//     .then(result => console.log(result))
//     .catch(error => {
//         // console.log(error);
//     });

localGit.gitClone()
    .catch(error => console.error(error))
    .then(result => console.log(result));
