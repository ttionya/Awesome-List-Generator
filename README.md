# Awesome List Generator

An awesome list generator for your starred, but not only for starred.

**Still in develop**

It is just a server. You can find browser script [HERE](https://github.com/ttionya/Awesome-List-Generator-Script). 

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=plastic)](https://raw.githubusercontent.com/ttionya/Awesome-List-Generator/master/LICENSE)


## Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Note](#note)
- [License](#license)


## Requirements

Awesome List Generator requires the following to run:

- [Node.js](https://nodejs.org/en/) > 0.10
- NPM (normally comes with Node.js)
- [Git](https://git-scm.com/) > 1.7.10


## Usage

1. [Download](https://github.com/ttionya/Awesome-List-Generator/archive/master.zip) and decompress

2. Install forever globally
```shell
npm i forever -g
```

3. Install dependencies
```shell
npm install
```

4. Generate a new access token

Turn to [Github Setting](https://github.com/settings/tokens) to generate a new access token for Awesome List Generator.

You must choose **repo -> public_repo**.

5. Copy `config.default.js` as `config.js`, and configure it

6. Initialize Awesome List Generator
```shell
npm run init
```

7. Test port

Note: On Linux systems, any port below 1024 requires root access.
```shell
npm test
```

8. Run Awesome List Generator
```shell
npm run start // Start
npm run stop  // Stop
```


## Note

- **Still in develop, do not used in production.**
- On Linux systems, any port below 1024 requires root access.
- You have to run `npm run init` after edit config file.


## Future features

- Queue
- Browser script features

## License

Awesome List Generator is licensed under the [MIT](https://raw.githubusercontent.com/ttionya/Awesome-List-Generator/master/LICENSE) license.  
Copyright © 2016, ttionya
