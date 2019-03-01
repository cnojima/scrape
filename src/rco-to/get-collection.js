const l                    = require('../util/log');
const history              = require('../util/history');
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
        getChapter(options, config, browser, page, url, toNuke, isDone);
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
      l.error(err);
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
