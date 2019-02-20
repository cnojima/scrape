const fs              = require('fs');
const path            = require('path');
const mkdirp          = require('mkdirp');
const rimraf          = require('rimraf');
const Case            = require('case');

const config          = require('../config/funmanga');
const getPageParallel = require('../common/get-page-parallel');
const history         = require('../util/history');
const l               = require('../util/log');
const createCbz       = require('../util/create-cbz');
const chapterCleanup  = require('../util/chapter-cleanup');
const generateImgName = require('../util/generate-img-name');
const guessImageName  = require('../util/guess-image-name');

const getCollection   = require('./get-collection');
const getChapter      = require('./get-chapter');
const getPage         = require('./get-page');


module.exports = options => {
  l.setLogName(`${config.logDir}/${Case.snake(path.basename(options.url))}.log`);

  l.log('============================');
  l.log(`START using options:`.green);
  for (const key in options) {
    l.log(`   ${key} : ${options[key]}`);
  }

  history(options.url);

  try {
    fs.accessSync(config.outDir);

    // build up collection -> chapter -> img paths, /Volumes/cbr/Manga/Yotsubato
    options.collectionPath = path.resolve(process.cwd, `${config.outDir}/${Case.title(path.basename(options.url))}`);

    mkdirp.sync(options.collectionPath);
    
    const completedChapters = [];
    
    return async () => {
      const chapters = await getCollection(options).catch(err => {
        l.error(`@getChapter got error ${err}`);
      });

      chapters.reverse();

      l.debug(`chapters`);
      l.debug(chapters.join('\n   '));






      const chapterIsDone = async () => {
        if (chapters.length > 0) {
          const c = chapters.shift();

          if (path.basename(c).indexOf('.') < 0 || config.skipOmake === false) {

            l.info(`working on ${c}`);

            const cleansedChapter = path.basename(c).padStart(config.chapterPadLength, '0');

            // /Volumes/cbr/Yotsubato/010
            const imgDestDir = `${options.collectionPath}/${cleansedChapter}`;

            // /foo/bar/out/mangareader/comic-name/comic-name-009.cbz
            const cbzDest = `${options.collectionPath}/${path.basename(options.collectionPath)}-${cleansedChapter}.cbz`;

            // skip if CBZ exists
            if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
              mkdirp.sync(imgDestDir);

              // for cleanup
              completedChapters.push(imgDestDir);

              const pages = await getChapter(c, options).catch(err => {
                l.error(`[${c}] got error: ${err}`);
              });

              const pageCount = pages.length;

              l.debug(`pages`);
              l.debug(`\n   ${pages.join('\n   ')}`);
              l.info(`${path.basename(options.collectionPath)}-${cleansedChapter} has [ ${pages.length} pages ] `)

              // parallelize the image download
              const getThePages = getPageParallel(
                config, options,
                [...pages], imgDestDir, cbzDest,
                getPage, chapterIsDone,
              );

              try {
                await getThePages();
              } catch(err) {
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
          l.log(`DONE with ${options.url}`);
          
          if (config.nukeSource) {
            chapterCleanup(completedChapters);
          }
        }
      } 

      chapterIsDone();
    } 
  } catch (err) {
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }

};





