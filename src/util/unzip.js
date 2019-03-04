const fs = require('fs');
const path = require('path');
const unzip = require('extract-zip');
const rimraf = require('rimraf');
const config = require('../config');
const log = require('./log');


/**
 * Unzips an archive to the destination directory.
 *
 * @param {!string} file Absolute path to zip file
 * @param {!string} dest Absolute path to dest folder for unzip
 * @param {?boolean} fresh If true, will rimraf if dest folder exists
 * @param {!function} callback
 */
module.exports = function (file, dest, fresh, callback) {
  fresh = fresh || false;

  // preserve old arrity pre-refactor
  if (typeof dest !== 'string') {
    callback = dest;
    dest = path.resolve(config.workDir, path.basename(file, '.zip'));
  }

  log.info(`Unzipping [ ${file} ]`);

  if (fresh && fs.existsSync(dest)) {
    rimraf.sync(dest);
  }

  unzip(file, {
    dir: dest,
  }, (err) => {
    if (err) {
      log.error(`unzip failed with err [ ${err} ]`);
    } else {
      log.debug(`unzip'd [ ${file} ] to [ ${dest} ]`);
      callback(err, dest);
    }
  });
};
