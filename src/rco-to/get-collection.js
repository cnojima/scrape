const fs                   = require('fs');
const path                 = require('path');
const urln                 = require('url');
const mkdirp               = require('mkdirp');

const getPage              = require('./get-page');
const createCbz            = require('../util/create-cbz');
const generateSequenceName = require('../util/generate-sequence-name');
const guessImageName       = require('../util/guess-image-name');
const dump                 = require('../util/dump');
const dp                   = require('../util/dump-puppeteer');
const l                    = require('../util/log');
const history              = require('../util/history');

const getCollection = (page, options, config) => {

  return new Promise(async (resolve, reject) => {

    const isDone = () => {
      cbzToDo--;

      if (cbzToDo <= 0) {
        history(options, config);
        resolve(toNuke);
      } else {
        l.debug(`cbzToDo has ${cbzToDo} archives to build`);
      }
    }

    let cbzToDo = 0;
    const toNuke = [];
    const pageUrl = options.url;

    await page.goto(pageUrl).catch(err => {
      l.error(`rco-to failed at ${pageUrl}`);
      l.error(err);
      process.exit(1);
    });

    // we get the gatekeeper page
    await page.waitForNavigation({
      timeout: 30000,
      waitUntil: 'load'
    });

    const { selector, attribute } = config.collectionSelector;

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

    options['is-complete'] = await page.$$eval(config.completedSelector, arr => {
      for (let i=0, n=arr.length; i<n; i++) {
        if (arr[i].innerText.indexOf('Completed') > 0) {
          return true;
        }
      }

      return false;
    });

    if (options['is-complete'] === true) {
      l.warn(`${options.name} is COMPLETE - setting flag`);
    }

    l.log(`[ @getBooks ] found [ ${books.length} volumes ] to process`);

    const doWork = async () => {
      if (books.length > 0) {

        while (books.length > 0) {
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

          if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
            cbzToDo++;

            const images = await (async () => {
              await page.goto(url).catch(err => {
                l.error(`going to [${url}] failed with ${err}`);
              });

              return await page.$$eval(config.imgSelector, arr => {
                const ret = [];

                for (let i=0, n=arr.length; i<n; i++) {
                  ret.push(arr[i].src);
                }

                return ret;
              });
            })();

            console.log(images);

            for (let i=0, n=images.length; i<n; i++) {
              // see if we already have the page image
              let imageExists = false;
              let imgGuess;

              // some images are masked do not have a predictable order or extension
              let pageNumber = generateSequenceName(`${i+1}`, config, true, false);
              const guesses = guessImageName(pageNumber, config);

              for(const ext in guesses) {
                imgGuess = `${bookPath}/${guesses[ext]}`;

                if (fs.existsSync(imgGuess)) {
                  imageExists = true;
                  break;
                }
              }

              if (imageExists) {
                l.debug(`@getPage_forked: found ${imgGuess} - skipping`);
              } else {
                await getPage(images[i], pageNumber, bookPath, options, config);
              }
            }

            if (images.length > 0) {
              if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
                createCbz(bookPath, cbzDest, isDone);
              } else {
                l.info(`[ @getBook ] found ${cbzDest} - not rebuilding CBZ`);
                isDone();
              }
            } else {
              l.error(`[ @get-collection ] no images were detected - captcha for [ ${url} ]?`);
              isDone();
            }
          } else {
            l.info(`.${cbzDest.replace(__dirname, '')} exists - skipping chapter`);
            isDone();
          }
        }
      } else {
        isDone();
      }
    };

    await doWork();
  });
}

module.exports = getCollection;
