/* eslint-disable consistent-return, global-require, import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const puppeteer = require('puppeteer');

const pupOptions = require('../config/puppeteer');
const l = require('../util/log');
const chapterCleanup = require('../util/chapter-cleanup');

const { getBook } = require('./books');
const { getBooks } = require('./books');
const { handleErroredBooks } = require('./books');


global.errors = [];

/**
 * @return {Function}
 */
module.exports = (options, config, site, callback) => {
  const headers = require(`../config/${site}/headers`)(options.url);
  const destPath = options.collectionPath = path.resolve(process.cwd, config.outDir, options.outDir, options.name);

  try {
    fs.accessSync(config.outDir);

    return async () => {
      // make sure target dir exists
      mkdirp.sync(destPath);

      const browser = await puppeteer.launch(pupOptions);
      const page = await browser.newPage();

      await page.setCookie({ name: 'checked', value: '1', url: 'https://www.8muses.com' });
      await page.setExtraHTTPHeaders(headers);

      if (options['is-collection']) {
        await getBooks(options, page, destPath);
      } else {
        await getBook(options, page, destPath);
      }

      if (global.errors.length > 0) {
        await handleErroredBooks(page, destPath);
      }

      await browser.close();

      chapterCleanup(global.completedVolumes);

      l.log(`DONE with ${options.url}`.green);

      if (callback) {
        callback();
      }
    };
  } catch (err) {
    global.errors = true;
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }
};
