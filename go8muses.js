#!/usr/bin/env node
require('./src/util/init');
/*
https://www.8muses.com/comics/album/Hentai-and-Manga-English/Alice-no-Takarabako-Mizuryuu-Kei
*/
global.errors = {
  length: 0
};

require('colors');

const cli                = require('command-line-args');
const clu                = require('command-line-usage');
const mkdirp             = require('mkdirp');
const path               = require('path');
const puppeteer          = require('puppeteer');

const getBook            = require('./src/books').getBook;
const getBooks           = require('./src/books').getBooks;
const handleErroredBooks = require('./src/books').handleErroredBooks;
const dump               = require('./src/util/dump');
const history            = require('./src/util/history');

const cliConfig          = require('./config/8muses/cli');
const cluConfig          = require('./config/8muses/clu');
const cookies            = require('./config/8muses/cookies');
const pupOptions         = require('./config/8muses/puppeteer');

const options            = cli(cliConfig);
const usage              = clu(cluConfig);

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  global.cliOptions = options;

  history(options.url);

  console.log(`\n\n\n[ START:  using options: ===================================== ]`.green);
  for (const key in options) {
    console.log(`[         ${key} : ${options[key]}   ]`.green);
  }
}

const rootUrl            = options.url;
const headers            = require('./config/headers')(rootUrl);
const destPath           = `${process.cwd()}/out/${path.basename(rootUrl)}`;





(async () => {
  // make sure target dir exists
  mkdirp.sync(destPath);

  const browser = await puppeteer.launch(pupOptions);
  const page = await browser.newPage();

  await page.setCookie({ name: "checked", value: "1", url: "https://www.8muses.com" });
  await page.setExtraHTTPHeaders(headers);

  if (options["is-collection"]) {
    await page.goto(rootUrl);
    await getBooks(page, destPath);
  } else {
    await getBook(rootUrl, page, destPath);
  }

  if (global.errors.length > 0) {
    await handleErroredBooks(page, destPath);
  }

  await browser.close();
  dump(global.errors);
})();
