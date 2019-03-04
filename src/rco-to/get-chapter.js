/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop, no-loop-func */
const fs = require('fs');
const path = require('path');

const createCbz = require('../util/create-cbz');
const generateSequenceName = require('../util/generate-sequence-name');
const guessImageName = require('../util/guess-image-name');
const l = require('../util/log');


module.exports = async (options, config, browser, page, url, bookPath, cbzDest, isDone) => {
  // find all responses with contentType image/*
  const responses = {};
  let images = [];

  /**
   * handle response from rco.to
   */
  const handleResponse = async (resp) => {
    const headers = resp.headers();
    const request = await resp.request();
    const { href } = new URL(request.url());

    if (href.substr(0, 4) !== 'data' && headers['content-type'] && headers['content-type'].indexOf('image/') > -1) {
      responses[href] = resp;
    }
  };


  /**
   * handle loading of page, process images
   */
  const handleLoad = async () => {
    images = await page.$$eval(config.imgSelector, async (arr) => {
      const ret = [];

      for (let i = 0, n = arr.length; i < n; i++) {
        ret.push(arr[i].src);
      }

      return ret;
    });

    let expectedImages = 0;

    l.info(`@load for [ ${url} ] - we have ${images.length} images loaded`);

    for (let i = 0, n = images.length; i < n; i++) {
      // see if we already have the page image
      let imageExists = false;
      let imgGuess;

      // some images are masked do not have a predictable order or extension
      const pageNumber = generateSequenceName(`${i + 1}`, config, true, false);
      const guesses = guessImageName(pageNumber, config);

      for (const ext in guesses) {
        imgGuess = `${bookPath}/${guesses[ext]}`;

        if (fs.existsSync(imgGuess)) {
          imageExists = true;
          break;
        }
      }

      if (imageExists) {
        expectedImages++;
        l.debug(`@getPage_forked: found ${imgGuess} - skipping`);
      } else {
        const src = images[i];

        l.debug(`working on ${src}`);

        // if response URL matches a comicbook page, save it.
        if (responses[src]) {
          const resp = responses[src];
          const imgFinalName = `${bookPath}/${pageNumber}`;
          const buffer = await resp.buffer();
          let ext = path.extname(src);

          if (!ext) {
            ext = `.${path.basename(resp.headers()['content-type'])}`;
          }

          l.info(`saving ${imgFinalName}${ext}`);

          try {
            fs.writeFileSync(`${imgFinalName}${ext}`, buffer);
            expectedImages++;
          } catch (err) {
            global.errors = true;
            l.error(`fs.writeFileSync failed with ${err} - trying again`);

            setTimeout(() => {
              l.info(`retrying ${imgFinalName}${ext}`.cyan);

              try {
                fs.writeFileSync(`${imgFinalName}${ext}`, buffer);
                expectedImages++;
              } catch (err2) {
                l.error(`after 2 attempts ${imgFinalName}${ext} was unable to be saved`);
              }
            }, 100);
          }
        } else {
          l.error(`${src} was not found in responses`.error);
        }
      }
    }

    if (images.length > 0) {
      if (images.length === expectedImages) {
        if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
          page.removeListener('load', handleLoad);
          page.removeListener('response', handleResponse);
          createCbz(bookPath, cbzDest, isDone);
        } else {
          global.errors = true;
          l.info(`[ @getBook ] found ${cbzDest} - not rebuilding CBZ`);
          isDone();
        }
      } else {
        l.warn(`expected ${images.length} images - found ${expectedImages} - not generating an incomplete CBZ`);
        isDone();
      }
    } else {
      l.warn(`[ @get-collection ] no images were detected - captcha for [ ${url} ]?`);
      await page.screenshot({
        path: `out/${url.replace(/[^a-z0-9\-._]/gi, '_')}.png`,
      });
      // isDone(); if captcha, allow for manual non-headless
    }
  };


  page.on('response', handleResponse);
  page.on('load', handleLoad);


  await page.goto(url).catch((err) => {
    l.error(`going to [${url}] failed with ${err}`);
    process.exit();
  });
  // we'll allow 15s for error
  await page.waitForNavigation({
    timeout: 45000,
    // waitUntil: 'networkidle0'
  }).catch(() => {
    // do nothing - we don't care
    // console.log(err);
  });
};
