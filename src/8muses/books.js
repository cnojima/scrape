/* eslint-disable no-await-in-loop, no-await-in-loop, no-restricted-syntax */

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Case = require('case');

const l = require('../util/log');
const createCbz = require('../util/create-cbz');
const { getPages } = require('./pages');
const handleTiles = require('./tiles');
const { tileQuery } = require('./queries');


/**
 * scrapes one book
 * @param {!object} options
 * @param {!PuppetPage} page
 * @param {!string} destPath  FQDN path to book save
 */
const getBook = (options, page, destPath) => {
  const bookUrl = options.url;

  return new Promise((async (resolve, reject) => {
    l.log(`[ @getBook ] going to ${bookUrl}`);

    const dir = Case.title(path.basename(bookUrl));
    const dest = `${destPath}/${dir}`;
    const bookName = `${destPath}/${path.basename(destPath)}-${dir}.cbz`;
    l.debug(`mkdirp ${dest}`);
    mkdirp.sync(dest);

    await page.goto(bookUrl);

    await getPages(page, dest, bookUrl, getBook, options).catch((err) => {
      global.errors = true;
      l.error(`ERROR: @getBook caught error: ${err}`);
      reject(err);
    });

    if (!fs.existsSync(bookName) || options['force-archive'] === true) {
      await createCbz(dest, bookName);
      global.completedVolumes.push(dest);
    } else {
      l.info(`[ @getBook ] found ${bookName} - not rebuilding CBZ`);
    }

    resolve();
  }));
};


/**
 * @param {PuppetPage} page
 * @return {Promise}
 */
const getBooks = async (options, page, destPath) => {
  const pageUrl = options.url;

  await page.goto(pageUrl);
  const books = await page.$$eval(tileQuery, handleTiles);

  l.log(`[ @getBooks ] found [ ${books.length} volumes ] to process`);

  while (books.length > 0) {
    options.url = books.shift();
    await getBook(options, page, destPath).catch((err) => {
      global.errors = true;
      l.warn(`@getBook threw an error: ${err}`);
    });
  }
};


const handleErroredBooks = async (page, destPath) => {
  l.log(`\n[ @handleErroredBooks ] redo-failures.  We have ${global.errors.length} volumes to redo.`.yellow);
  l.log(global.errors);
  const redoBooks = [];

  for (const url in global.errors) {
    if (url !== 'length') {
      redoBooks.push(global.errors[url].url);
      delete global.errors[url];
    }
  }

  global.errors.length = 0;

  while (redoBooks.length > 0) {
    const book = redoBooks.shift();
    await getBook(book, page, destPath);
  }

  if (global.errors.length > 0) {
    await handleErroredBooks(page, destPath);
  }
};

module.exports = {
  getBook, getBooks, handleErroredBooks,
};
