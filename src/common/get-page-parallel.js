const fs             = require('fs');
const l              = require('../util/log');
const guessImageName = require('../util/guess-image-name');
const createCbz      = require('../util/create-cbz');


/**
 * Parallelizes page & image fetches up to the `throttled` value in the site config.
 * If the operation finds failures in the image download, the `config.redo` flag will be set to true
 * and execution will continue.
 *
 * @param {!object} options Options from CLI arguments
 * @param {!object} config Configuration for the supported site.
 * @param {!array} pages Array of URIs to a given collection's pages.
 * @param {!string} imgDestDir Full path to the image save destination directory (chapter root).
 * @param {!string} cbzDest Full path to the CBZ save directory (collection root).
 * @param {!AsyncFunction} getPage Async function to retrieve a given page/image - this can be site-specific.
 * @param {!function} chapterIsDone Callback function called when all pages and images are downloaded.
 * @return {AsyncFunction}
 */
module.exports = function(
  config,
  options,
  pages,
  imgDestDir,
  cbzDest,
  getPage,
  chapterIsDone,
) {

  const pageCount = pages.length;
  const pagesDownloading = [];
  let pipes = 0;

  /**
   * @async
   */
  async function getPage_forked() {

    if (pages.length > 0) {
      while (pipes <= config.throttled && pages.length > 0) {
        const pageUrl = pages.shift();
        // l.debug(`fork for ${pageUrl}`.red);

        // see if we already have the page image
        let imageExists = false;
        let imgGuess;
        const guesses = guessImageName(pageUrl, config, true, false);

        for(const ext in guesses) {
          imgGuess = `${imgDestDir}/${guesses[ext]}`;

          if (fs.existsSync(imgGuess)) {
            imageExists = true;
            break;
          }
        }

        if (imageExists) {
          l.debug(`@getPage_forked: found ${imgGuess} - skipping`);
        } else {
          pipes++;

          setTimeout(() => {
            pagesDownloading.push(getPage(pageUrl, imgDestDir, options, config)
              .then(() => {
                pipes--;
              })
              .catch(err => {
                global.errors = true;
                l.error(`getPage error: ${err}`);
              }));
          }, 1);
        }
      }

      setTimeout(getPage_forked, 100);
    } else if(pages.length === 0 && pipes === 0) {

      Promise.all(pagesDownloading).then(async () => {
        l.debug(`All pagesDownloading promises resolved.`.green);

        const imgs = fs.readdirSync(imgDestDir);

        if (pageCount === imgs.length) {
          await createCbz(imgDestDir, cbzDest, chapterIsDone).catch(err => {
            global.errors = true;
            l.error(`caught createCbz error ${err}`);
          });
        } else {
          global.errors = true;
          console.log(`DIR [ ${imgDestDir} ]: page count does NOT match image count`.red, `pages ${pageCount}`.cyan, `images: ${imgs.length}`);
          config.redo = true;
          chapterIsDone();
        }
      }).catch(err => {
        global.errors = true;
        l.warn(`allPromises for get-page-parallel caught an error: ${err}`);
      });

    } else {
      setTimeout(getPage_forked, 100);
    }
  }

  return getPage_forked;
};
