const fs = require('fs');
const l = require('../util/log');
const guessImageName = require('../util/guess-image-name');
const createCbz = require('../util/create-cbz');


/**
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
  let pipes = 0;

  async function getPage_forked() {
    // console.log(`[ ${pipes} ] pipes`.cyan, `[ ${pages.length} ] pages`.green);

    if (pages.length > 0) {
      while (pipes <= config.throttled && pages.length > 0) {

        const pageUrl = pages.shift();
        // console.log(`fork for ${pageUrl}`.red);

        // see if we already have the page image
        let imageExists = false;
        let imgGuess;
        const guesses = guessImageName(pageUrl, config);

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

          getPage(pageUrl, imgDestDir, options, config)
            .then(() => {
              pipes--;
            })
            .catch(err => {
              l.error(`getPage error: ${err}`);
            });
        }
      }

      setTimeout(getPage_forked, 100);
    } else if(pages.length === 0 && pipes === 0) {
      l.debug(` ...pausing for ${config.pauseBeforeSanity / 1000}s before performing file-count sanity check`.green);

      setTimeout(() => {
        const imgs = fs.readdirSync(imgDestDir);
        if (pageCount === imgs.length) {
          createCbz(imgDestDir, cbzDest);
          // chapterIsDone();
        } else {
          console.log(`DIR [ ${imgDestDir} ]:`);
          console.log(`page count does NOT match image count`.red, `pages ${pageCount}`.cyan, `images: ${imgs.length}`);
          // chapterIsDone();
        }
      }, config.pauseBeforeSanity);
      
      chapterIsDone();
    } else {
      setTimeout(getPage_forked, 100);
    }
  }

  return getPage_forked;
};
