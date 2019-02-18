const rimraf = require('rimraf');
const l      = require('./log');

module.exports = completedChapters => {
  l.log(`@chapterCleanup - pausing for a momemnt to allow CBZ process to complete`);
  
  setTimeout(() => {
    completedChapters.forEach(toDel => {
      l.info(`rmdir ${toDel}`);
      rimraf(toDel, () => {
        l.debug(`nuked ${toDel}`);
      });
    });
  }, 13000);
};