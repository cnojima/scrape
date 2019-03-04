const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const l = require('./log');

/**
 * Generates one CBZ volume.
 *
 * @param {!string} dirPath Full path to the directory containing
                            alphabetically ordered images as pages.
 * @param {!string} bookName Full path to the final destination of the CBZ volume
 * @param {?cb} cb (optional) Callback function that will be called
                              when the CBZ operation has completed.
 * @return {promise}
 */
const createCbz = (dirPath, bookName, cb) => new Promise((async (resolve, reject) => {
  l.info(`[ @createCbz ] for ${bookName}`);

  let output;

  // create a file to stream archive data to.
  try {
    output = fs.createWriteStream(bookName);
  } catch (err) {
    global.errors = true;
    l.error(`archive.directory error : ${err}`);
    if (fs.existsSync(bookName)) {
      l.warn(`ERROR in createCbz - deleting bad archive [ ${bookName} ]`);
      fs.unlinkSync(bookName);
    }
  }

  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });


  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', () => {
    l.log(`[ @createCbz onClose ] ${path.basename(bookName)} finalized at ${(archive.pointer() / 1024 / 1024).toFixed(1)} Mb`.green);

    if (cb) {
      // l.log(`[ @createCbz onClose ] calling cb()`);
      cb();
    } else {
      // l.log(`[ @createCbz onClose ] calling resolve()`);
      resolve();
    }
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', (err) => {
    global.errors = true;

    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', (err) => {
    global.errors = true;
    l.error(`ERROR in createCbz - deleting bad archive [ ${bookName} ]`);

    if (fs.existsSync(bookName)) {
      fs.unlinkSync(bookName);
    }

    reject(err);
  });

  // pipe archive data to the file
  try {
    // l.log(`[ @createCbz ] pipe output`);
    archive.pipe(output);
  } catch (err) {
    global.errors = true;
    l.error(`archive.directory error : ${err}`);
    if (fs.existsSync(bookName)) {
      l.warn(`ERROR in createCbz - deleting bad archive [ ${bookName} ]`);
      fs.unlinkSync(bookName);
    }
  }

  // append files from a sub-directory, putting its contents at the root of archive
  try {
    // l.log(`[ @createCbz ] archive.directory()`);
    archive.directory(dirPath, false);
  } catch (err) {
    global.errors = true;
    l.error(`archive.directory error : ${err}`);
    if (fs.existsSync(bookName)) {
      l.warn(`ERROR in createCbz - deleting bad archive [ ${bookName} ]`);
      fs.unlinkSync(bookName);
    }
  }

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method
  try {
    // l.log(`[ @createCbz ] archive.finalize()`);
    archive.finalize();
  } catch (err) {
    global.errors = true;
    l.error(`archive.directory error : ${err}`);
    if (fs.existsSync(bookName)) {
      l.warn(`ERROR in createCbz - deleting bad archive [ ${bookName} ]`);
      fs.unlinkSync(bookName);
    }
  }
}));

module.exports = createCbz;
