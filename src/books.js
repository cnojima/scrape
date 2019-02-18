const fs          = require('fs');
const path        = require('path');
const mkdirp      = require('mkdirp');

const createCbz   = require('./util/create-cbz');
const getPages    = require('./pages').getPages;
const handleTiles = require('./tiles');
const tileQuery   = require('./queries').tileQuery;


/**
 * scrapes one book
 * @param {!string} book  URL to book TOC
 * @param {!PuppetPage} page
 * @param {!string} destPath  FQDN path to book save
 */
const getBook = function(book, page, destPath) {
  return new Promise(async function(resolve, reject) {
    console.log(`[ @getBook ] going to ${book}`);

    const dir = path.basename(book);
    const dest = `${destPath}/${dir}`;
    const bookName = `${destPath}/${path.basename(destPath)}-${dir}.cbz`;
    mkdirp.sync(dest);

    // global.errors[dest] = false;

    await page.goto(book);

    await getPages(page, dest, book, getBook).catch(err => {
      console.log(`ERROR: @getBook caught error: ${err}`);
    });

    if (!fs.existsSync(bookName) || global.cliOptions['force-archive'] === true) {
      await createCbz(dest, bookName);
    } else {
      console.log(`[ @getBook ] found ${bookName} - not rebuilding CBZ`);
    }

    resolve();
  });
};




/**
 * @param {PuppetPage} page
 * @return {Promise}
 */
const getBooks = async (page, destPath) => {
  const books = await page.$$eval(tileQuery, handleTiles);

  console.log(`[ @getBooks ] found [ ${books.length} volumes ] to process`);

  while (books.length > 0) {
    const book = books.shift();
    await getBook(book, page, destPath);
  }
};



const handleErroredBooks = async (page, destPath) => {
  console.log(`\n[ @handleErroredBooks ] redo-failures.  We have ${global.errors.length} volumes to redo.`.yellow);
  console.log(global.errors);
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