const fs                 = require('fs');
const path               = require('path');
const mkdirp             = require('mkdirp');
const puppeteer          = require('puppeteer');
const Case               = require('case');

const dump               = require('../util/dump');
const history            = require('../util/history');
const l                  = require('../util/log');
const chapterCleanup     = require('../util/chapter-cleanup');

const getCollection      = require('./get-collection');
const pupOptions         = require('../config/puppeteer');
const cookies            = require('../config/rco-to/cookies');


/**
 * @return {Function}
 */
module.exports = (options, config, site, callback) => {
  const headers  = require(`../config/${site}/headers`);
  const destPath = path.resolve(process.cwd, `${config.outDir}/${options.name}`);

  try {
    fs.accessSync(config.outDir);

    return async () => {
      // make sure target dir exists
      mkdirp.sync(destPath);

      config.destPath = destPath;

      const browser = await puppeteer.launch(pupOptions);
      const page = await browser.newPage();

      for (let i=0, n=cookies.length; i<n; i++) {
        await page.setCookie(cookies[i]);
      }
      await page.setExtraHTTPHeaders(headers);

      const toNuke = await getCollection(page, options, config);

      await browser.close();

      if (config.nukeSource) {
        l.log(`Nuking ${toNuke.length} source file directories`);
        chapterCleanup(toNuke);
      }

      l.log(`DONE with ${options.url}`.green);

      if (callback) {
        callback();
      }
    };
  } catch (err) {
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }
};
