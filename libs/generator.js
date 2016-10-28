/**
 * generate markdown file
 *
 **/

"use strict";



/**
 * Definition
 *
 * constant
 *
 **/
const path = require('path')
    , fs = require('fs')
    , Q = require('q')
    , packageJson = require(path.join(APP_PATH, 'package.json')) // ~/package.json
    , config = require(path.join(APP_PATH, 'config.js'))         // ~/config.js
;


const poweredByName = config.name
    , poweredByUrl = packageJson.homepage
    , descriptionKind = config.generator.description
    , showCategories = config.generator.categories
;



function generateFiles(data) {
  let startTime = Date.now();

  return Q.all([byTime(data), byName(data), byLanguage(data), byCategories(data)])
      .then(() => Date.now() - startTime)
      .fail(error => {
        console.error(error);

        process.exit();
      }); // no done()
}



/**
 * Generate markdown file by time
 *
 */
function byTime(data) {

  // DEBUG
  DEBUG ? console.time('Generate by time') : 0;


  let finObject = {}
      , dateYearArr = []     // an array for year ([1070, 2015, 2016, ...])
      , dateYearObj = {}     // an object for month ({ '1070': [1], '2015': [1, 5, 12], '2016': [1, 9, 10] })
      , finString
  ;


  for (let id in data) {
    let tmpItem = data[id]                            // (tmp)(Object) item from data
        , tmpDate = new Date(tmpItem.starDate)        // (tmp)(Date) full Date format
        , tmpDateYear = tmpDate.getFullYear()         // (tmp)(Int) tmpDate.getFillYear
        , tmpDateMonth = tmpDate.getMonth() + 1       // (tmp)(Int) tmpDate.getMonth (only from 0 to 11)
        , tmpTmpDateYearObj = finObject[tmpDateYear]  // (tmp)(Object) finObject[tmpDateYear]
        , tmpItemNameArr = tmpItem.name.split('/')    // (tmp)(Array) tmpItem.name.split
    ;

    // initialize objects
    if (!tmpTmpDateYearObj) {
      finObject[tmpDateYear] = {};
      tmpTmpDateYearObj = finObject[tmpDateYear];

      dateYearArr.push(tmpDateYear);
      dateYearObj[tmpDateYear] = [];
    }

    if (!tmpTmpDateYearObj[tmpDateMonth]) {
      tmpTmpDateYearObj[tmpDateMonth] = [];

      dateYearObj[tmpDateYear].push(tmpDateMonth);
    }

    /**
     * {
     *            name: String,
     *     description: String,
     *    cDescription: String,
     *     cCategories: String,
     *           owner: String,
     *        starDate: Number
     * }
     **/

    // push into array (allow duplication)
    tmpTmpDateYearObj[tmpDateMonth].push({
      name: tmpItemNameArr[1],
      description: tmpItem.description,
      cDescription: tmpItem.cDescription,
      cCategories: tmpItem.cCategories,
      owner: tmpItemNameArr[0],
      starDate: tmpItem.starDate
    });
  }


  /**
   * Sort
   *
   **/

  // sort finObject[][]
  for (let year in finObject) {
    for (let month in finObject[year] /* Object */) {
      finObject[year][month].sort((pre, aft) => {
        let result = pre.starDate - aft.starDate;

        if (result) {
          return result;
        }
        else {
          sortByName(pre, aft);
        }
      });
    }
  }

  // sort dateYearArr dateYearObj
  dateYearArr.sort((pre, aft) => pre - aft);
  for (let year of dateYearArr) {
    dateYearObj[year].sort((pre, aft) => pre - aft);
  }


  /**
   * Convert to README.md
   *
   **/
  finString = getHeader('Time') + getNav('Time', dateYearArr, dateYearObj);

  for (let year of dateYearArr) {
    for (let month of dateYearObj[year] /* Array */) {
      if (year != 1970) {
        finString += '## ' + year + '.' + month + '\n\n';
      }
      else {
        finString += '## Before\n\n';
      }

      for (let tmpItem of finObject[year][month] /* Array */) {
        finString += '- [**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + getDescription(tmpItem) + getCategories(tmpItem) + '\n\n';
      }
    }
  }


  /**
   * Write file
   **/
  return Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'README.md'), finString)
      .then(() => /* DEBUG */ DEBUG ? console.timeEnd('Generate by time') : 0)
      .fail(error => { throw error; }); // no done()
}



/**
 * Generate markdown file by name
 *
 * Generate default markdown file
 *
 */
function byName(data) {

  // DEBUG
  DEBUG ? console.time('Generate by name') : 0;


  let finObject = {}
      , alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      , firstLetterSet = new Set()
      , firstLetterArr // Array.from(firstLetterSet)
      , finString
      , finDefaultString
  ;


  for (let id in data) {
    let tmpItem = data[id]                                              // (tmp)(Object) item from data
        , tmpItemNameArr = tmpItem.name.split('/')                      // (tmp)(Array) tmpItem.name.split
        , tmpFirstLetter = tmpItemNameArr[1].charAt(0).toUpperCase()    // (tmp)(String) first letter of name
    ;

    tmpFirstLetter = /[A-Z]/.test(tmpFirstLetter) ? tmpFirstLetter : '#'; // can not use anchor

    // initialize objects
    finObject[tmpFirstLetter] = finObject[tmpFirstLetter] || [];
    firstLetterSet.add(tmpFirstLetter);

    /**
     * {
     *            name: String,
     *     description: String,
     *    cDescription: String,
     *     cCategories: String,
     *           owner: String,
     * }
     **/

    // push into array (allow duplication)
    finObject[tmpFirstLetter].push({
      name: tmpItemNameArr[1],
      description: tmpItem.description,
      cDescription: tmpItem.cDescription,
      cCategories: tmpItem.cCategories,
      owner: tmpItemNameArr[0]
    });
  }


  /**
   * Sort
   *
   **/

  // sort finObject
  for (let firstLetter in finObject) {
    finObject[firstLetter].sort((pre, aft) => sortByName(pre, aft));
  }

  // sort firstLetterSet
  firstLetterArr = Array.from(firstLetterSet).sort();


  /**
   * Convert to README-NAME.md
   * Convert to README-DEFAULT.md
   *
   **/
  finString = getHeader('Name') + getNav('Name', firstLetterArr);
  finDefaultString = getHeader('Default') + getNav('Default', firstLetterArr);

  for (let i = 0, tmpFirstLetter; i < 27 /*alphabet.length*/; i++) {
    tmpFirstLetter = alphabet.charAt(i); // get first letter (upper letter)

    if (finObject[tmpFirstLetter]) {
      finString += tmpFirstLetter === '#' ? '## \# \n\n' : '## ' + tmpFirstLetter + '\n\n';

      finDefaultString += tmpFirstLetter === '#' ? '## \# \n\n' : '## ' + tmpFirstLetter + '\n\n';

      for (let tmpItem of finObject[tmpFirstLetter] /* Array */ ) {
        finString += '[**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + getDescription(tmpItem) + getCategories(tmpItem) + '\n\n';

        finDefaultString += '- [**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + (tmpItem.description ? tmpItem.description : 'Empty') + '\n\n';
      }
    }
  }


  /**
   * Write file
   **/
  return Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'README-NAME.md'), finString)
      .then(() => Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'README-DEFAULT.md'), finDefaultString))
      .then(() => /* DEBUG */ DEBUG ? console.timeEnd('Generate by name') : 0)
      .fail(error => { throw error; }); // no done()
}



/**
 * Generate markdown file by language
 *
 */
function byLanguage(data) {

  // DEBUG
  DEBUG ? console.time('Generate by language') : 0;


  let finObject = {}
      , langArray = []   // language (['JavaScript', 'Shell'])
      , finString
      , nullLangArr
  ;


  for (let id in data) {
    let tmpItem = data[id]                            // (tmp)(Object) item from data
        , tmpLang = tmpItem.lang                      // (tmp)(String) tmpItem.lang
        , tmpItemNameArr = tmpItem.name.split('/')    // (tmp)(Array) tmpItem.name.split
    ;

    // initialize objects
    if (!finObject[tmpLang]) {
      finObject[tmpLang] = [];

      tmpLang !== null ? langArray.push(tmpLang) : 0;
    }

    /**
     * {
     *            name: String,
     *     description: String,
     *    cDescription: String,
     *     cCategories: String,
     *           owner: String,
     * }
     **/

    // push into array (allow duplication)
    finObject[tmpLang].push({
      name: tmpItemNameArr[1],
      description: tmpItem.description,
      cDescription: tmpItem.cDescription,
      cCategories: tmpItem.cCategories,
      owner: tmpItemNameArr[0]
    });
  }


  /**
   * Sort
   *
   **/

  // sort finObject
  for (let lang in finObject) {
    finObject[lang].sort((pre, aft) => sortByName(pre, aft));
  }

  // sort langArray
  langArray.sort();


  /**
   * Convert to README-LANGUAGE.md
   *
   **/
  finString = getHeader('Language') + getNav('Language', finObject['null'] ? langArray.concat('Other') : langArray);

  for (let lang of langArray) {
    finString += '## ' + lang + '\n\n';

    for (let tmpItem of finObject[lang] /* Array */) {
      finString += '[**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + getDescription(tmpItem) + getCategories(tmpItem) + '\n\n';
    }
  }

  nullLangArr = finObject['null'];
  if (nullLangArr) {
    finString += '## Other\n\n';

    for (let tmpItem of nullLangArr) {
      finString += '[**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + getDescription(tmpItem) + getCategories(tmpItem) + '\n\n';
    }
  }


  /**
   * Write file
   **/
  return Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'README-LANGUAGE.md'), finString)
      .then(() => /* DEBUG */ DEBUG ? console.timeEnd('Generate by language') : 0)
      .fail(error => { throw error; }); // no done()
}



/**
 * Generate markdown file by categories
 *
 */
function byCategories(data) {

  // DEBUG
  DEBUG ? console.time('Generate by categories') : 0;


  let finObject = {}
      , categoriesArr = []         // an array for categories (['category1', 'category2', 'category3', ...])
      , finString
  ;


  for (let id in data) {
    let tmpItem = data[id]                            // (tmp)(Object) item from data
        , tmpCatArr = tmpItem.cCategories.split(', ') // (tmp)(Array) tmpItem.categories array (['category1', 'category2', ...] or [])
        , tmpItemNameArr = tmpItem.name.split('/')    // (tmp)(Array) tmpItem.name.split
    ;

    for (let category of tmpCatArr) {

      // initialize objects
      if (!finObject[category]) {
        finObject[category] = [];

        categoriesArr.push(category);
      }

      /**
       * {
       *            name: String,
       *     description: String,
       *    cDescription: String,
       *     cCategories: String,
       *           owner: String,
       *        starDate: Number
       * }
       **/

      // push into array (allow duplication)
      finObject[category].push({
        name: tmpItemNameArr[1],
        description: tmpItem.description,
        cDescription: tmpItem.cDescription,
        cCategories: tmpItem.cCategories,
        owner: tmpItemNameArr[0]
      });
    }
  }


  /**
   * Sort
   *
   **/

  // sort finObject[]
  for (let category in finObject) {
    finObject[category].sort((pre, aft) => sortByName(pre, aft));
  }

  // sort categoriesArr
  categoriesArr.sort();
  if (categoriesArr[0] === '') {
    categoriesArr.splice(0, 1);
    categoriesArr.push('');
  }


  /**
   * Convert to README-CATEGORY.md
   *
   **/
  finString = getHeader('Category') + getNav('Category', categoriesArr);

  for (let category of categoriesArr) {
    finString += category !== '' ? '## ' + category + '\n\n' : '## Other \n\n';

    for (let tmpItem of finObject[category] /* Array */) {
      finString += '[**' + tmpItem.name + '**](https://github.com/' + tmpItem.owner + '/' + tmpItem.name + '): ' + getDescription(tmpItem) + getCategories(tmpItem) + '\n\n';
    }
  }


  /**
   * Write file
   **/
  return Q.nfcall(fs.writeFile, path.join(REPO_PATH, 'README-CATEGORY.md'), finString)
      .then(() => /* DEBUG */ DEBUG ? console.timeEnd('Generate by categories') : 0)
      .fail(error => { throw error; }); // no done()
}



/**
 * Functions
 *
 **/

// sort by name and owner
function sortByName(pre, aft) {
  if (pre.name.toLowerCase() < aft.name.toLowerCase()) {
    return -1;
  }
  else if (pre.name.toLowerCase() > aft.name.toLowerCase()) {
    return 1;
  }
  else {
    return pre.owner.toLowerCase() <= aft.owner.toLowerCase() ? -1 : 1;
  }
}


// get header
function getHeader(exclude) {
  let finString = '# Awesome List\n\n'
      + '> A awesome list, not only from my Github stars! Generated by [' + poweredByName + '](' + poweredByUrl + ').\n\n'
      + '> Sort by: '
      , titleObject
  ;

  titleObject = {
    Time: 'README.md',
    Name: 'README-NAME.md',
    Language: 'README-LANGUAGE.md',
    Category: 'README-CATEGORY.md',
    Default: 'README-DEFAULT.md'
  };

  delete titleObject[exclude];

  for (let name in titleObject) {
    finString += '[' + name + '](https://github.com/' + config.github.username + '/' + config.github.repo + '/blob/master/' + titleObject[name] + ') ';
  }

  return finString + '\n\n<br>\n\n';
}



// get nav
function getNav(keyword, itemArray, itemObject) {
  let finString = '## Contents \n\n';

  switch (keyword) {
    case "Time":
      for (let year of itemArray) {
        if (year == 1970) {
          finString += '- [Before](#before)';
        }
        else {
          finString += '- ' + year + ': ';

          for (let month of itemObject[year] /* Array */) {
            finString += '[' + month + '](#' + year + month + ') ';
          }
        }

        finString += '  \n';
      }

      break;

    case "Name":
    case "Default":

      // remove #
      if (itemArray[0] === '#') {
        itemArray.splice(0, 1);
      }

      for (let name of itemArray) {
        finString += '- [' + name + '](#' + name.toString().toLowerCase() + ') '
      }

      break;

    case "Language":
      for (let language of itemArray) {
        finString += '- [' + language + '](#' + language.toString().toLowerCase().replace(/\s/g, '-') + ')  \n'
      }

      break;

    case "Category":
      for (let category of itemArray) {
        if (category !== '') {
          finString += '- [' + category + '](#' + category.toString().toLowerCase().replace(/\s/g, '-') + ')  \n'
        }
        else {
          finString += '- [Other](#other)  \n'
        }
      }

      break;
  }

  return finString + '\n\n<br>\n\n';
}


// get description
function getDescription(itemObject) {
  let finString = '';

  switch (descriptionKind) {
    case 'all':
      if (itemObject.description) {
        finString += itemObject.description + '  \n';
      }
      if (itemObject.cDescription) {
        finString += '*Description*: ' + itemObject.cDescription + '  \n';
      }
      break;

    case 'default':
      if (itemObject.description) {
        finString += itemObject.description + '  \n';
      }
      else if (itemObject.cDescription) {
        finString += '*Description*: ' + itemObject.cDescription + '  \n';
      }
      break;

    case 'custom':
      if (itemObject.cDescription) {
        finString += itemObject.cDescription + '  \n';
      }
      else if (itemObject.description) {
        finString += itemObject.description + '  \n';
      }
      break;

    default:
      // empty
  }

  // empty finString
  if (!finString) {
    finString += 'Empty  \n';
  }

  return finString;
}


const getCategories = itemObject => showCategories && itemObject.cCategories ? '*Categories*: ' + itemObject.cCategories : '';



module.exports = generateFiles;