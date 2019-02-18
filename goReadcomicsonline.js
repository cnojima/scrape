#!/usr/bin/env node
require('./src/util/init');

process.env.LOG_LEVEL = 'INFO';

/*
https://readcomicsonline.ru/comic/saga-2012
*/
const fs = require('fs');
const path          = require('path');
const mkdirp        = require('mkdirp');
const rimraf        = require('rimraf');
const cli           = require('command-line-args');
const clu           = require('command-line-usage');

const config        = require('./src/config');
const cliConfig     = require('./src/config/rco/cli');
const cluConfig     = require('./src/config/rco/clu');
const history       = require('./src/util/history');
const l             = require('./src/util/log');
const createCbz     = require('./src/util/create-cbz');
const options       = cli(cliConfig);
const usage         = clu(cluConfig);

const getCollection = require('./src/rco/get-collection');
const getChapter    = require('./src/rco/get-chapter');
const getPage       = require('./src/rco/get-page');

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  history(options.url);

  l.info(`\n\nSTART using options:`.green);
  
  for (const key in options) {
    l.info(`   ${key} : ${options[key]}`);
  }
}

// build up collection -> chapter -> img paths
options.collectionPath = `${config.outDir}/rco/${path.basename(options.url)}`;

// RCO adds `-YYYY` to the name
if (options.collectionPath.search(/\-[\d]{4}$/) > -1) {
  options.collectionPath = options.collectionPath.substring(0, (options.collectionPath.length - 5));
}
mkdirp.sync(options.collectionPath);


const completedChapters = [];


(async () => {
  const chapters = await getCollection(options).catch(err => {
    l.error(`@getChapter got error ${err}`);
  });

  chapters.sort();

  l.debug(`chapters`);
  l.debug(chapters.join('\n   '));

  const chapterIsDone = async () => {
    if (chapters.length > 0) {
      const c = chapters.pop();
      l.info(`working on ${c}`);

      // /foo/bar/out/rco/comic-name/009
      const imgDest = `${options.collectionPath}/${path.basename(c).padStart(3, '0')}`;
      mkdirp.sync(imgDest);
      // /foo/bar/out/rco/comic-name/comic-name-009.cbz
      const cbzDest = `${options.collectionPath}/${path.basename(options.collectionPath)}-${path.basename(c).padStart(3, '0')}.cbz`;

      // skip if CBZ exists
      if (!fs.existsSync(cbzDest) || options['force-archive'] === true) {
        const pages = await getChapter(c, options).catch(err => {
          l.error(`[${c}] got error: ${err}`);
        });

        l.debug(`pages`);
        l.debug(pages.join('\n   '));

        const pageIsDone = async function() {
          if (pages.length > 0) {
            const page = pages.pop();
            const pageDest = `${imgDest}/${path.basename(page).padStart(3, '0')}.jpg`;

            if (fs.existsSync(pageDest)) {
              l.debug(`found ${imgDest} - skipping`);
              pageIsDone();
            } else {
              getPage(page, pageDest, options)
                .then(pageIsDone)
                .catch(err => {
                  l.error(`getPage error: ${err}`);
                });
            }
          } else {
            l.info(`${c} is done`);
            await createCbz(imgDest, cbzDest);
            completedChapters.push(imgDest);
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

      setTimeout(() => {
        completedChapters.forEach(toDel => {
          l.info(`rmdir ${toDel}`);
          rimraf(toDel, () => {
            l.debug(`nuked ${toDel}`);
          });
        });
      }, 3000);
    }
  } 

  chapterIsDone();
})();