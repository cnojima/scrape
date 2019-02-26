const fs                 = require('fs');
const path               = require('path');
const mkdirp             = require('mkdirp');
const puppeteer          = require('puppeteer');
const Case               = require('case');

const getBook            = require('./books').getBook;
const getBooks           = require('./books').getBooks;
const handleErroredBooks = require('./books').handleErroredBooks;
const dump               = require('../util/dump');
const history            = require('../util/history');
const l                  = require('../util/log');
const chapterCleanup     = require('../util/chapter-cleanup');

// const config             = require('../config/8muses');
const cookies            = require('../config/8muses/cookies');
const pupOptions         = require('../config/8muses/puppeteer');


/**
 * @return {Function}
 */
module.exports = (options, config, site, callback) => {

  const headers  = require('../config/8muses/headers')(options.url);
  const destPath = path.resolve(process.cwd, `${config.outDir}/${options.name}`);

  try {
    fs.accessSync(config.outDir);

    return async () => {
      // make sure target dir exists
      mkdirp.sync(destPath);

      const browser = await puppeteer.launch(pupOptions);
      const page = await browser.newPage();

      await page.setCookie({ name: "checked", value: "1", url: "https://www.8muses.com" });
      await page.setExtraHTTPHeaders(headers);

      if (options["is-collection"]) {
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
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }
};
