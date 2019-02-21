const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');
const l        = require('./log');

const createCbz = (dirPath, bookName, cb) => {
  return new Promise(async function(resolve, reject) {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(bookName);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
     
    l.debug(`[ @createCbz ] for ${bookName}`);

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
      l.log(`[ @createCbz ] ${path.basename(bookName)} finalized at ${(archive.pointer() / 1024 / 1024).toFixed(1)} Mb`.green);

      if (cb) {
        cb();
      }
    });
     
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });
     
    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });
     
    // pipe archive data to the file
    archive.pipe(output);
     
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(dirPath, false);
     
    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    resolve();
  });
}

module.exports = createCbz;