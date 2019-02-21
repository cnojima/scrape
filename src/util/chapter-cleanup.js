const rimraf = require('rimraf');
const l      = require('./log');

module.exports = completedChapters => {
  completedChapters.forEach(toDel => {
    l.info(`rmdir ${toDel}`);
    rimraf(toDel, () => {
      l.debug(`nuked ${toDel}`);
    });
  });
};