const fs                      = require('fs');
const path                    = require('path');
const req                     = require('request-promise');

const handleTiles             = require('./tiles');
const { tileQuery, imgQuery } = require('./queries');
const webp2png                = require('./util/webp-to-png');
const queueError              = require('./util/queue-error');

let getBook;



const handlePage = arr => {
  let ret = '';

  if (arr.length === 1) {
    arr.forEach(img => {
      // console.log(img.src);
      ret = img.src;
    });
  } else if(arr.length > 1) {
    console.log(`[WARN] @handlePage found more than 1 [${imgQuery}]`.yellow);
  } else {
    console.log(`[ERROR] @handlePage did not an image that matches ${imgQuery}`.red);
  }

  return ret;
}

const getPage = (url, dest, page, book) => {
  return new Promise(async function(resolve, reject) {
    // console.log(`[ @getPage ] getting page from ${url}`);

    const pageNum = path.basename(url).padStart(3, '0');
    const imgDest = `${dest}/${pageNum}.webp`;
    const finalImg = `${path.dirname(imgDest)}/${path.basename(imgDest, '.webp')}.png`;

    if (fs.existsSync(finalImg)) {
      resolve();
    } else if (fs.existsSync(imgDest)) {
      if (global.cliOptions.convertwebp) {
        await webp2png(imgDest, finalImg).catch(err => {
          if (global.cliOptions["is-collection"]) {
            reject(err);
          }
        });
      }
    } else {
      await page.goto(url, { waitUntil: ['networkidle2']});

      try {
        const img = await page.$$eval(imgQuery, handlePage);
        const headers = require('../src/config/headers')(url);

        // fetch img asset and save
        await req.get({
          method: 'GET',
          headers,
          encoding: null,
          url : img
        }).then(function (res) {
          const buffer = Buffer.from(res, 'utf8');
          fs.writeFileSync(imgDest, buffer);
        }).catch(err => {
          console.log(`error in downloading img ${err}`);
          reject(`wtf: ${img}`)
        });

        // convert webp to png
        if (global.cliOptions.convertwebp) {
          await webp2png(imgDest, finalImg).catch(err => {
            queueError(err, book, url);
            resolve(); // continue silently as we'll retry the bad ones
          });
        }
      } catch (err) {
        console.log(` --- page.$$eval could not match ${imgQuery}`);
        // instead of an `image`/leaf-node, we have an `album`
        // reject('no img found ')
        console.log(`[INFO] expected an image, got an album - recursing in`.cyan);

        await getBook(url, page, dest);
      }
    }
    resolve();
  });
}

const getPages = async (page, dest, book, fnGetBook) => {
  if (!getBook) {
    getBook = fnGetBook;
  }

  const pages = await page.$$eval(tileQuery, handleTiles);

  console.log(`[ @getPages ] Current volume has ${pages.length} pages`);

  while(pages.length > 0) {
    await getPage(pages.shift(), dest, page, book).catch(err => {
      console.log(`[ @getPages ] caught err: ${err}`);
    });
    process.stdout.write(`...${pages.length} left          \r`);
  }
}

module.exports = {
  getPage, getPages, handlePage
};