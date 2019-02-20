const fs                  = require('fs');
const path                = require('path');
const mkdirp              = require('mkdirp');
const rimraf              = require('rimraf');
const Case                = require('case');

const getPageParallel     = require('./common/get-page-parallel');
const getPageCommon       = require('./common/get-page');
const getCollectionCommon = require('./common/get-collection');
const l                   = require('./util/log');
const chapterCleanup      = require('./util/chapter-cleanup');
const generateSeqName     = require('./util/generate-sequence-name.js');


module.exports = (options, config, site) => {
  const getChapter  = require(`./${site}/get-chapter`);
  let getPage       = getPageCommon;
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
    options.collectionPath = path.resolve(process.cwd, `${config.outDir}/${options.name}`);

    // RCO adds `-YYYY` to the name
    if (site === 'rco' && options.collectionPath.search(/\ [\d]{4}$/) > -1) {
      options.collectionPath = options.collectionPath.substring(0, (options.collectionPath.length - 5));
    }

    mkdirp.sync(options.collectionPath);
    
    const completedChapters = [];
    
    return async () => {
      const chapters = await getCollection(options, config).catch(err => {
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

            const cleansedChapter = generateSeqName(c, config);

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
              } catch (err) {
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





