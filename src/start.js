const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const getPageParallel = require('./common/get-page-parallel');
const getPageCommon = require('./common/get-page');
const getCollectionCommon = require('./common/get-collection');
const l = require('./util/log');
const chapterCleanup = require('./util/chapter-cleanup');
const generateSeqName = require('./util/generate-sequence-name.js');

// custom controllers, pre-import for eslint & node 11.x
const getChapterFunmanga = require('./funmanga/get-chapter');
const getChapterMangakakalot = require('./mangakakalot/get-chapter');
const getChapterMangareader = require('./mangareader/get-chapter');
const getChapterOmgbeaupeep = require('./omgbeaupeep/get-chapter');
const getChapterRco = require('./rco/get-chapter');
const getChapterRcoTo = require('./rco-to/get-chapter');

const getCollectionMangareader = require('./mangareader/get-collection');
const getCollectionOmgbeaupeep = require('./omgbeaupeep/get-collection');
const getCollectionRcoTo = require('./rco-to/get-collection');

const getPageMangakakalot = require('./mangakakalot/get-page');
const getPageOmgbeaupeep = require('./omgbeaupeep/get-page');


let redoMax = 10;

// eslint-disable-next-line consistent-return
const start = (options, config, site, callback) => {
  let getChapter;
  let getCollection;
  let getPage;

  switch (site) {
    default:
      getChapter = () => {
        l.error(`${site} is unsupported.  Please add getChapter()`);
        process.exit(1);
      };
      getPage = getPageCommon;
      getCollection = getCollectionCommon;
      // eslint-disable-next-line no-fallthrough

    case 'funmanga':
      getChapter = getChapterFunmanga;
      break;

    case 'mangakakalot':
      getChapter = getChapterMangakakalot;
      getPage = getPageMangakakalot;
      break;

    case 'mangareader':
      getChapter = getChapterMangareader;
      getCollection = getCollectionMangareader;
      break;

    case 'omgbeaupeep':
      getChapter = getChapterOmgbeaupeep;
      getCollection = getCollectionOmgbeaupeep;
      getPage = getPageOmgbeaupeep;
      break;

    case 'rco':
      getChapter = getChapterRco;
      break;

    case 'rco-to':
      getChapter = getChapterRcoTo;
      getCollection = getCollectionRcoTo;
      break;
  }

  try {
    fs.accessSync(config.outDir);

    // build up collection -> chapter -> img paths, /Volumes/cbr/Manga/Yotsubato
    options.collectionPath = path.resolve(process.cwd, config.outDir, options.outDir, options.name);

    // RCO adds `-YYYY` to the name
    if (site === 'rco' && options.collectionPath.search(/ [\d]{4}$/) > -1) {
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
              l.info(`${path.basename(options.collectionPath)}-${cleansedChapter} has [ ${pageCount} pages ] `);

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
              (async () => {
                await restart();
                return null;
              })();
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
