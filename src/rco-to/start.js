/* eslint-disable global-require, import/no-dynamic-require, no-await-in-loop, consistent-return */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const puppeteer = require('puppeteer');

const l = require('../util/log');
const chapterCleanup = require('../util/chapter-cleanup');

const getCollection = require('./get-collection');
const pupOptions = require('../config/puppeteer');
const cookies = require('../config/rco-to/cookies');


/**
 * @return {Function}
 */
module.exports = (options, config, site, callback) => {
  const headers = require(`../config/${site}/headers`);
  const destPath = options.collectionPath = path.resolve(process.cwd, config.outDir, options.outDir, options.name);

  try {
    fs.accessSync(config.outDir);

    return async () => {
      // make sure target dir exists
      mkdirp.sync(destPath);

      config.destPath = destPath;

      pupOptions.headless = (options.headless === false) ? false : pupOptions.headless;

      const browser = await puppeteer.launch(pupOptions);
      const page = await browser.newPage();

      for (let i = 0, n = cookies.length; i < n; i++) {
        await page.setCookie(cookies[i]);
      }
      await page.setExtraHTTPHeaders(headers);

      page.setDefaultTimeout(pupOptions.timeout);

      getCollection(browser, page, options, config).then((toNuke) => {
        browser.close();

        if (config.nukeSource) {
          l.log(`Nuking ${toNuke.length} source file directories`);
          chapterCleanup(toNuke);
        }

        l.log(`DONE with ${options.url}`.green);

        if (callback) {
          callback();
        }
      });
    };
  } catch (err) {
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }
};
