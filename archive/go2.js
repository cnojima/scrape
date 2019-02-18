#!/usr/bin/env node
const rootUrl    = `https://www.8muses.com/comics/album/Various-Authors/Stjepan-Sejic-aka-Shiniez/Sunstone`;

const fs         = require('fs');
const path       = require('path');
const mkdirp     = require('mkdirp');
const puppeteer  = require('puppeteer');
const req        = require('request-promise');

const webp2png   = require('./src/util/webp-to-png');
const createCbz  = require('./src/util/create-cbz');
const pupOptions = require('./config/puppeteer');
const headers    = require('./config/headers')(rootUrl);
const cookies    = require('./config/cookies');

const destPath   = `${process.cwd()}/out/${path.basename(rootUrl)}`;
const tileQuery  = 'a.c-tile.t-hover';
const imgQuery   = 'img.image';




const handleTiles = arr => {
  const ret = [];

  if (arr.length > 0) {
    for (let i=0, n=arr.length; i<n; i++) {
      let a = arr[i];
      if (a.innerHTML.indexOf('iframe') < 0) {
        // console.log(a.href);
        ret.push(a.href);
      }
    }
  }

  return ret;
};

const handlePage = arr => {
  let ret = '';

  if (arr.length > 0) {
    arr.forEach(img => {
      // console.log(img.src);
      ret = img.src;
    });
  }

  return ret;
}

const getPage = (url, dest, page) => {
  return new Promise(async function(resolve, reject) {
    // console.log(`[ @getPage ] getting page from ${url}`);

    const pageNum = path.basename(url).padStart(3, '0');
    const imgDest = `${dest}/${pageNum}.webp`;
    //const finalImg = `${path.dirname(imgDest)}/${path.basename(imgDest, '.webp')}.png`;
    const finalImg = `${path.dirname(imgDest)}/${path.basename(imgDest, '.webp')}.jpg`;

    //if (fs.existsSync(finalImg)) {
    if (fs.existsSync(finalImg)) {
      resolve();
    } else if (fs.existsSync(imgDest)) {
      await webp2png(imgDest, finalImg).catch(err => {
        reject(err);
      });
    } else {
      await page.goto(url);
      const img = await page.$$eval(imgQuery, handlePage);

      if (img) {
        // fetch img asset and save
        await req.get({
          method: 'GET',
          headers,
          encoding: null,
          url : img
        }).then(function (res) {
          const buffer = Buffer.from(res, 'utf8');
          fs.writeFileSync(imgDest, buffer);
        })/*.then(() => { webp2png(imgDest, finalImg); })*/.catch(err => {
          console.log(`error in downloading img ${err}`);
          reject(`wtf: ${img}`)
        });

        await webp2png(imgDest, finalImg).catch(err => {
          reject(err);
        });
      } else {
        reject('no img found ')
      }
    }
    resolve();
  });
}

const getPages = async (page, dest) => {
  const pages = await page.$$eval(tileQuery, handleTiles);

  console.log(`[ @getPages ] Current volume has ${pages.length} pages`);

  while(pages.length > 0) {
    await getPage(pages.shift(), dest, page).catch(err => {
      console.log(`ERROR caught at getPages ${err}`);
    });
    process.stdout.write(`...${pages.length} left          \r`);
  }
}


const getBook = (book, page) => {
  return new Promise(async function(resolve, reject) {
    console.log(`[ @getBook ] going to ${book}`);

    const dir = path.basename(book);
    const dest = `${destPath}/${dir}`;
    const bookName = `${path.basename(destPath)}-${dir}.cbz`;
    mkdirp.sync(dest);

    await page.goto(book);

    await getPages(page, dest);

    await createCbz(dest, bookName);

    resolve();
  });
};

/**
 * @param {PuppetPage} page
 * @return {Promise}
 */
const getBooks = async page => {
  const books = await page.$$eval(tileQuery, handleTiles);

  while (books.length > 0) {
    await getBook(books.shift(), page);
  }
};



(async () => {
  // make sure target dir exists
  mkdirp.sync(destPath);

  const browser = await puppeteer.launch(pupOptions);
  const page = await browser.newPage();

  // console.log
  // page.on('console', msg => console.log(msg.text()));

  await page.setCookie({ name: "checked", value: "1", url: "https://www.8muses.com" });
  await page.setExtraHTTPHeaders(headers)
  await page.goto(rootUrl);
  await getBooks(page);

  await browser.close();
})();
