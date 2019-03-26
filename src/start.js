const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const getPageParallel = require('./common/get-page-parallel');
const getPageCommon = require('./common/get-page');
const getCollectionCommon = require('./common/get-collection');
const l = require('./util/log');
const chapterCleanup = require('./util/chapter-cleanup');
const generateSeqName = require('./util/generate-sequence-name.js');


let redoMax = 10;

const start = (options, config, site, callback) => {
  const getChapter = require(`./${site}/get-chapter`);
  let getPage = getPageCommon;
  let getCollection = getCollectionCommon;

  // custom getCollection controller
  if (config.useCustomGetCollection) {
    getCollection = require(`./${site}/get-collection`);
  }

  // custom getPage controller
  if (config.useCustomGetPage) {
    getPage = require(`./${site}/get-page`);
  }
  
  try {
    fs.accessSync(config.outDir);

    // build up collection -> chapter -> img paths, /Volumes/cbr/Manga/Yotsubato
    options.collectionPath = path.resolve(process.cwd, config.outDir, options.outDir, options.name);

    // RCO adds `-YYYY` to the name
    if (site === 'rco' && options.collectionPath.search(/\ [\d]{4}$/) > -1) {
      options.collectionPath = options.collectionPath.substring(0, (options.collectionPath.length - 5));
    }

    mkdirp.sync(options.collectionPath);

    const completedChapters = [];

    /**
     * @param {?goCallback} after all chapters processed, execute callback
     * @return async Function
     * @async
     */
    return async (goCallback) => {
      const chapters = await getCollection(options, config).catch((err) => {
        l.error(`@getChapter got error ${err}`);
      });

      chapters.reverse();

      const chapterIsDone = async () => {
        if (chapters.length > 0) {
          const c = chapters.shift();

          if (config.skipOmake === false
            || (path.basename(c).indexOf('.') < 0 && path.basename(c).indexOf('-') < 0)
          ) {
            l.info(`working on ${c}`);

            const cleansedChapter = generateSeqName(c, config);
            l.debug(`cleansedChapter [ ${cleansedChapter} ]`);

            // /Volumes/cbr/Yotsubato/010
            const imgDestDir = `${options.collectionPath}/${cleansedChapter}`;
            l.debug(`imgDestDir [ ${imgDestDir} ]`);

            // /foo/bar/out/mangareader/comic-name/comic-name-009.cbz
            const cbzDest = `${options.collectionPath}/${path.basename(options.collectionPath)}-${cleansedChapter}.cbz`;
            l.debug(`cbzDest [ ${cbzDest} ]`);

            // skip if CBZ exists
            if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
              mkdirp.sync(imgDestDir);

              // for cleanup
              completedChapters.push(imgDestDir);

              const pages = await getChapter(c, options).catch((err) => {
                l.error(`[${c}] got error: ${err}`);
              });

              const pageCount = pages.length;

              l.debug('pages');
              l.debug(`\n   ${pages.join('\n   ')}`);
              l.info(`${path.basename(options.collectionPath)}-${cleansedChapter} has [ ${pages.length} pages ] `);

              // parallelize the image download
              const getThePages = getPageParallel(
                config, options,
                [...pages], imgDestDir, cbzDest,
                getPage, chapterIsDone,
              );

              try {
                await getThePages();
              } catch (err) {
                global.errors = true;
                l.error(`async get-page-parallel failure: ${err}`);
              }
            } else {
              l.info(`.${cbzDest.replace(__dirname, '')} exists - skipping chapter`);
              chapterIsDone();
            }
          } else {
            l.warn(`skipping ${c} as it scans like omake`.yellow);
            chapterIsDone();
          }
        } else {
          if (config.redo === false && config.nukeSource) {
            chapterCleanup(completedChapters);
          }

          l.log(`DONE with ${options.url}`.green);

          if (global.errors) {
            l.log('ERRORS were detected.  Re-run get to retry.'.red);
            redoMax--;

            if (redoMax > 0) {
              global.errors = false;
              l.log('\n\n\n========================================'.green);
              l.log(`Re-trying fetch.  ${redoMax} attempts left.`.green);
              const restart = start(options, config, site, callback);
              (async () => await restart())();
            } else if (callback) {
              callback();
            } else if (goCallback) {
              goCallback();
            }
          } else if (callback) {
            callback();
          } else if (goCallback) {
            goCallback();
          }
        }
      };

      chapterIsDone();
    };
  } catch (err) {
    console.error(`${config.outDir} is NOT accessible - ${err}`);
  }
};


module.exports = start;
