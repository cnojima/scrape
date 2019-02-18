const fs          = require('fs');
const path        = require('path');
const mkdirp      = require('mkdirp');
const Case        = require('case');

const l           = require('../util/log');
const createCbz   = require('../util/create-cbz');
const getPages    = require('./pages').getPages;
const handleTiles = require('./tiles');
const tileQuery   = require('./queries').tileQuery;


/**
 * scrapes one book
 * @param {!string} bookUrl  URL to book TOC
 * @param {!PuppetPage} page
 * @param {!string} destPath  FQDN path to book save
 */
const getBook = function(bookUrl, page, destPath) {
  return new Promise(async function(resolve, reject) {
    l.log(`[ @getBook ] going to ${bookUrl}`);

    const dir = Case.title(path.basename(bookUrl));
    const dest = `${destPath}/${dir}`;
    const bookName = `${destPath}/${path.basename(destPath)}-${dir}.cbz`;
    l.debug(`mkdirp ${dest}`);
    mkdirp.sync(dest);

    // global.errors[dest] = false;

    await page.goto(bookUrl);

    await getPages(page, dest, bookUrl, getBook).catch(err => {
      l.error(`ERROR: @getBook caught error: ${err}`);
    });

    if (!fs.existsSync(bookName) || global.cliOptions['force-archive'] === true) {
      await createCbz(dest, bookName);
      global.completedVolumes.push(dest);
    } else {
      l.info(`[ @getBook ] found ${bookName} - not rebuilding CBZ`);
    }

    resolve();
  });
};




/**
 * @param {PuppetPage} page
 * @return {Promise}
 */
const getBooks = async (pageUrl, page, destPath) => {
  await page.goto(pageUrl);
  const books = await page.$$eval(tileQuery, handleTiles);

  l.log(`[ @getBooks ] found [ ${books.length} volumes ] to process`);

  while (books.length > 0) {
    const bookUrl = books.shift();
    await getBook(bookUrl, page, destPath);
  }
};



const handleErroredBooks = async (page, destPath) => {
  l.log(`\n[ @handleErroredBooks ] redo-failures.  We have ${global.errors.length} volumes to redo.`.yellow);
  l.log(global.errors);
  const redoBooks = [];

  for(let url in global.errors) {
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
}

module.exports = {
  getBook, getBooks, handleErroredBooks
};