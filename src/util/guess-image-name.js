const path = require('path');

/**
 * Utility to generate possible local image resource names to determine if they already exist.
 *
 * @param {!String} baseName "https://www.funmanga.com/History-s-Strongest-Disciple-Kenichi/112/7"
 * @param {!Object} config Project config
 * @return {Object}
 */
module.exports = (pageUrl, config) => {
  const pageNum = path.basename(pageUrl);
  const guess = pageNum.padStart(config.imgPadLength, '0');

  // console.log(pageUrl.cyan, guess.green);

  return {
    jpg: `${guess}.jpg`,
    png: `${guess}.png`,
    webp: `${guess}.webp`,
    gif: `${guess}.gif`,
  };
};
