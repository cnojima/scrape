const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const l = require('../util/log');
const history = require('../util/history');
const generateSequenceName = require('../util/generate-sequence-name');
const getChapter = require('./get-chapter');

const getCollection = (browser, page, options, config) => new Promise(async (resolve, reject) => {
  const toNuke = [];
  const pageUrl = options.url;
  let books;

  const isDone = async () => {
    if (books.length === 0) {
      history(options, config);
      resolve(toNuke);
    } else {
      l.debug(`@getCollection - ${books.length} books to process`.cyan);
      const url = books.pop();
      const book = generateSequenceName(
        url.replace('Issue-', ''),
        config,
        false,
        false,
      );
      const bookPath = `${config.destPath}/${book}`;
      const cbzDest = `${config.destPath}/${path.basename(config.destPath)}-${book}.cbz`;

      l.log(`going to book [ ${url} ]`);

      mkdirp.sync(bookPath);
      toNuke.push(bookPath);

      l.debug(`checking if ${cbzDest} exists: ${fs.existsSync(cbzDest)}`);

      if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
        getChapter(options, config, browser, page, url, bookPath, cbzDest, isDone);
      } else {
        l.info(`.${cbzDest.replace(__dirname, '')} exists - skipping chapter`);
        isDone();
      }
    }
  };

  // TOC
  await page.goto(pageUrl).catch((err) => {
    l.error(`rco-to failed at ${pageUrl}`);
    l.error(err);
    reject(err);
    process.exit(1);
  });

  // we get the gatekeeper page
  await page.waitForNavigation({
    timeout: config.timeout,
    waitUntil: 'load',
  }).catch(() => {
    // do nothing - we don't care
  });

  const { selector } = config.collectionSelector;

  books = await page.$$eval(selector, (arr) => {
    const ret = [];

    if (arr.length > 0) {
      for (let i = 0, n = arr.length; i < n; i++) {
        const a = arr[i];
        ret.push(`${a.href}&quality=hq`);
      }
    }

    return ret;
  });

  // determine if `is-complete`
  options['is-complete'] = await page.$$eval(config.completedSelector, (arr) => {
    for (let i = 0, n = arr.length; i < n; i++) {
      if (arr[i].innerText.indexOf('Completed') > 0) {
        return true;
      }
    }

    return false;
  });

  // comment outside as the above operates inside chromium
  if (options['is-complete'] === true) {
    l.warn(`${options.name} is COMPLETE - setting flag`);
  }

  isDone();
});

module.exports = getCollection;
