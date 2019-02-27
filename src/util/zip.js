const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');
const config   = require('../config');
const log      = require('./log');

/**
 * Generates zip file from folder name
 * @param {!object} item data object with target, source, final
 * @param {!function} done
 */
module.exports = function(item, done) {
  log.debug(`zipping ${item.target}`);

  const zipFile = item.target;
  const sourceFolder = item.source;
  const archive = archiver('zip', {
    prefix : item.prefix || `./resources/locales/`,
    store  : config.zipStore
  });

  const output = fs.createWriteStream(zipFile);

  // listen for all archive data to be written
  output.on('close', function() {
    log.log(`${path.basename(zipFile)} creation complete`);
    log.log(`${archive.pointer()} total bytes`);
    log.log('archiver has been finalized and the output file descriptor has closed.');
    done(item);
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    log.error(err.toString());
    throw err;
  });

  archive.pipe(output);

  if (fs.statSync(sourceFolder).isDirectory()) {
    archive.directory(sourceFolder, './');
  } else {
    // archive.file(sourceFolder);
    archive.append(fs.createReadStream(sourceFolder), { name: path.basename(sourceFolder) });
  }

  archive.finalize();
};
