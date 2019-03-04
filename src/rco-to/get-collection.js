const fs                   = require('fs');
const path                 = require('path');
const urln                 = require('url');
const mkdirp               = require('mkdirp');

const l                    = require('../util/log');
const history              = require('../util/history');
const generateSequenceName = require('../util/generate-sequence-name');
const getChapter           = require('./get-chapter');

const getCollection = (browser, page, options, config) => {

  return new Promise(async (resolve, reject) => {

    const isDone = async () => {
      if (books.length === 0) {
        history(options, config);
        resolve(toNuke);
      } else {
        l.debug(`@getCollection - ${books.length} books to process`.cyan);
        const url = books.pop();
        const Url = new URL(url);
        const book = generateSequenceName(
          path.basename(
            urln.format(
              Url, { fragment: false, unicode: true, auth: false, search: false }
            )
          ).replace('Issue-', ''),
          config,
          false,
          false
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
    }

    const toNuke = [];
    const pageUrl = options.url;

    // TOC
    await page.goto(pageUrl).catch(err => {
      l.error(`rco-to failed at ${pageUrl}`);
      l.error(err);
      process.exit(1);
    });

    // we get the gatekeeper page
    await page.waitForNavigation({
      timeout: 30000,
      waitUntil: 'load'
    }).catch(err => {
      // do nothing - we don't care
    });

    const { selector, attribute } = config.collectionSelector;

    const books = await page.$$eval(selector, arr => {
      const ret = [];

      if (arr.length > 0) {
        for (let i=0, n=arr.length; i<n; i++) {
          let a = arr[i];
          ret.push(`${a.href}&quality=hq`);
        }
      }

      return ret;
    });

    // determine if `is-complete`
    options['is-complete'] = await page.$$eval(config.completedSelector, arr => {
      for (let i=0, n=arr.length; i<n; i++) {
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
}

module.exports = getCollection;
