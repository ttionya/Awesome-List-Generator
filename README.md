# Awesome List Generator

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=plastic)](https://raw.githubusercontent.com/ttionya/Awesome-List-Generator/master/LICENSE)

An awesome list generator for your starred, but not only for starred.

**Still in develop**

**Note:** It is just a server. You can find browser script [HERE](https://github.com/ttionya/Awesome-List-Generator-Script).


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

#### [Download](https://github.com/ttionya/Awesome-List-Generator/archive/master.zip) and decompress

#### Install forever globally
```shell
npm i forever -g
```

#### Install dependencies
```shell
npm install
```

#### Generate a new access token

Turn to [Github Setting](https://github.com/settings/tokens) to generate a new access token for Awesome List Generator.

You must choose **repo -> public_repo**.

#### Copy `config.default.js` as `config.js`, and configure it

#### Initialize Awesome List Generator

You also have to perform this step after edit config file.
```shell
npm run init
```

#### Test port

On Linux systems, any port below 1024 requires root access.
```shell
npm test
```

#### Enjoy Awesome List Generator
```shell
npm run start // Start
npm run stop  // Stop
```


## Note

- **Still in develop, do not used in production.**
- It is just a server. You can find browser script [here](https://github.com/ttionya/Awesome-List-Generator-Script).
- On Linux systems, any port below 1024 requires root access.
- You have to run `npm run init` after edit config file.


## Future features

- Code optimization
- Queue

## License

Awesome List Generator is licensed under the [MIT](https://raw.githubusercontent.com/ttionya/Awesome-List-Generator/master/LICENSE) license.  
Copyright © 2016, ttionya