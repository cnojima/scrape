const fs        = require('fs');
const path      = require('path');
const urln      = require('url');
const mkdirp    = require('mkdirp');

const getPage   = require('./get-page');
const createCbz = require('../util/create-cbz');
const guessImageName = require('../util/guess-image-name');
const dump      = require('../util/dump');
const dp        = require('../util/dump-puppeteer');
const l         = require('../util/log');

const getCollection = async (page, options, config) => {
  const toNuke = [];
  const pageUrl = options.url;

  await page.goto(pageUrl);

  // we get the gatekeeper page
  await page.waitForNavigation({
    timeout: 30000,
    waitUntil: 'load'
  });

  const { selector, attribute } = config.collectionSelector;

  // await dp(page);

  const books = await page.$$eval(selector, arr => {
    const ret = [];

    if (arr.length > 0) {
      for (let i=0, n=arr.length; i<n; i++) {
        let a = arr[i];
        ret.push(a.href);
      }
    }

    return ret;
  });

  l.log(`[ @getBooks ] found [ ${books.length} volumes ] to process`);

  while (books.length > 0) {
    const url = books.pop();
    const Url = new URL(url);
    const book = path.basename(urln.format(Url, { fragment: false, unicode: true, auth: false, search: false }));
    const bookPath = `${config.destPath}/${book}`;
    const cbzDest = `${config.destPath}/${path.basename(config.destPath)}-${book}.cbz`;

    mkdirp.sync(bookPath);
    toNuke.push(bookPath);

    if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {      l.info(`found`)
      const images = await (async () => {
        await page.goto(url);
        // await dp(page);

        return await page.$$eval(config.imgSelector, arr => {
          const ret = [];

          for (let i=0, n=arr.length; i<n; i++) {
            ret.push(arr[i].src);
          }

          return ret;
        });
      })();

      // l.debug(images);

      for (let i=0, n=images.length; i<n; i++) {
        // see if we already have the page image
        let imageExists = false;
        let imgGuess;
        const guesses = guessImageName(images[i], config);

        for(const ext in guesses) {
          imgGuess = `${bookPath}/${guesses[ext]}`;

          l.debug(imgGuess.red);

          if (fs.existsSync(imgGuess)) {
            imageExists = true;
            break;
          }
        }

        if (imageExists) {
          l.debug(`@getPage_forked: found ${imgGuess} - skipping`);
        } else {
          await getPage(images[i], bookPath, options, config);
        }
      }


      if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
        await createCbz(bookPath, cbzDest);
      } else {
        l.info(`[ @getBook ] found ${cbzDest} - not rebuilding CBZ`);
      }
    } else {
      l.info(`.${cbzDest.replace(__dirname, '')} exists - skipping chapter`);
    }
  }

  return toNuke;
}
module.exports = getCollection;
