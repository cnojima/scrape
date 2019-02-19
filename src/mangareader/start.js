const fs              = require('fs');
const path            = require('path');
const mkdirp          = require('mkdirp');
const rimraf          = require('rimraf');
const Case            = require('case');

const config          = require('../config/mangareader');
const history         = require('../util/history');
const l               = require('../util/log');
const createCbz       = require('../util/create-cbz');
const chapterCleanup  = require('../util/chapter-cleanup');

const getCollection   = require('./get-collection');
const getChapter      = require('./get-chapter');
const getPage         = require('./get-page');


module.exports = options => {
  l.log('============================');
  l.log(`START using options:`.green);
  for (const key in options) {
    l.info(`   ${key} : ${options[key]}`);
  }

  history(options.url);

  try {
    fs.accessSync(config.outDir);

    // build up collection -> chapter -> img paths, /Volumes/cbr/Yotsubato
    options.collectionPath = path.resolve(process.cwd, `${config.outDir}/${Case.title(path.basename(options.url))}`);

    mkdirp.sync(options.collectionPath);
    
    const completedChapters = [];
    
    return async () => {
      const chapters = await getCollection(options).catch(err => {
        l.error(`@getChapter got error ${err}`);
      });

      chapters.sort();

      l.debug(`chapters`);
      l.debug(chapters.join('\n   '));

      const chapterIsDone = async () => {
        if (chapters.length > 0) {
          const c = chapters.shift();
          l.info(`working on ${c}`); // https://www.mangareader.net/onepunch-man/119

          const cleansedChapter = path.basename(c).padStart(3, '0');

          // /Volumes/cbr/Yotsubato/010
          const imgDest = `${options.collectionPath}/${cleansedChapter}`;
          

          // /foo/bar/out/mangareader/comic-name/comic-name-009.cbz
          const cbzDest = `${options.collectionPath}/${path.basename(options.collectionPath)}-${cleansedChapter}.cbz`;

          // skip if CBZ exists
          if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
            mkdirp.sync(imgDest);

            // for cleanup
            completedChapters.push(imgDest);

            const pages = await getChapter(c, options).catch(err => {
              l.error(`[${c}] got error: ${err}`);
            });

            l.debug(`pages`);
            l.debug(pages.join('\n   '));

            const pageIsDone = async function() {
              if (pages.length > 0) {
                const page = pages.shift();
                const imgName = `${path.basename(page, '.jpg').padStart(3, '0')}.jpg`;
                const pageDest = `${imgDest}/${imgName}`;

                if (fs.existsSync(pageDest)) {
                  l.debug(`found ${pageDest} - skipping`);
                  pageIsDone();
                } else {
                  getPage(page, pageDest, options)
                    .then(pageIsDone)
                    .catch(err => {
                      l.error(`getPage error: ${err}`);
                    });
                }
              } else {
                l.debug(`${c} is done`);
                await createCbz(imgDest, cbzDest);
                chapterIsDone();
              }
            }
            pageIsDone();
          } else {
            l.warn(`.${cbzDest.replace(__dirname, '')} exists - skipping chapter`);
            chapterIsDone();
          }
        } else {
          l.log(`DONE with ${options.url}`);
          // chapterCleanup(completedChapters);
        }
      } 

      chapterIsDone();
    } 
  } catch (err) {
    l.error(`${config.outDir} is NOT accessible - ${err}`);
  }

};





