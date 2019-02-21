const rimraf = require('rimraf');
const l      = require('./log');

/**
 * Final operation in `./go` process.
 * After CBZs are generated and moved to the final location, remove temporary/raw image assets
 *
 * @param {!array} completedChapters Array of full paths to chapter directories.
 */
module.exports = completedChapters => {
  completedChapters.forEach(toDel => {
    l.info(`rmdir ${toDel}`);
    rimraf(toDel, () => {
      l.debug(`nuked ${toDel}`);
    });
  });
};
