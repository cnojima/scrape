const fs            = require('fs');
const path          = require('path');
const log           = require('./log');
const zip           = require('./zip');



/**
 * rotates current log archives to max of config.keepLogs
 * @param {!string} basename
 * @param {!array} logDirFiles Reverse sorted snapshot array of current files in logDir
 * @param {!object} config
 */
function rotateArchives(basename, logDirFiles, config) {
  const { keepLogs, logDir } = config;
  let archiveIndex = 1;
  const re = new RegExp(`${basename}\.([0-5]{1})`);

  for (let i=0, n=logDirFiles.length; i<n; i++) {
    const f = logDirFiles[i];

    if (f.search(re) > -1) {
      archiveIndex = parseInt(f.match(re)[1]);
      break;
    }
  }

  while (archiveIndex >= 0) {
    if (fs.existsSync(path.resolve(logDir, `${basename}.${archiveIndex}.zip`))) {
      if (archiveIndex + 1 > keepLogs) {
        fs.unlinkSync(path.resolve(logDir, `${basename}.${archiveIndex}.zip`));
      } else {
        fs.renameSync(path.resolve(logDir, `${basename}.${archiveIndex}.zip`), path.resolve(logDir, `${basename}.${(archiveIndex + 1)}.zip`));
      }
    }

    archiveIndex--;
  }
}

module.exports = function(config, done) {
  log.info('Rotating logs (if necessary)');
  if (fs.existsSync(config.logDir)) {
    const logFiles = [];
    const logDirFiles = fs.readdirSync(config.logDir);
    logDirFiles.sort();
    logDirFiles.reverse();

    logDirFiles.map(function(file) {
      if (file.indexOf('.log') > -1) {
        logFiles.push(file);
      }
    });

    logFiles.forEach(function(file) {
      // > maxSize?
      const overSize = (parseInt(fs.statSync(`${config.logDir}/${file}`).size, 10) / (1024 * 1000) > config.maxSize);

      if (overSize) {
        log.info(`Rotating ${file}`);

        const archivePrefix = path.basename(file, '.log');

        // rotate existing archives
        rotateArchives(archivePrefix, logDirFiles, config);

        const rotateName = `${archivePrefix}.0`;
        const rename = `${rotateName}.log`;

        fs.renameSync(`${config.logDir}/${file}`, rename);

        log.debug(`zipping ${config.logDir}/${rotateName}.zip`);

        zip({
          prefix: config.logDir,
          target: `${config.logDir}/${rotateName}.zip`,
          source: rename
        }, function() {
          fs.unlink(rename, function(err) {
            if (err) {
              log.error(err);
            }
          });
        });
      }
    });
  }

  done();
};
