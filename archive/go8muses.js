#!/usr/bin/env node
require('./src/util/init');

global.errors = {
  length: 0
};

global.completedVolumes = [];

require('colors');

const cli                = require('command-line-args');
const clu                = require('command-line-usage');
const mkdirp             = require('mkdirp');
const path               = require('path');
const puppeteer          = require('puppeteer');

const getBook            = require('./src/8muses/books').getBook;
const getBooks           = require('./src/8muses/books').getBooks;
const handleErroredBooks = require('./src/8muses/books').handleErroredBooks;
const dump               = require('./src/util/dump');
const history            = require('./src/util/history');
const l                  = require('./src/util/log');
const chapterCleanup     = require('./src/util/chapter-cleanup');

const cliConfig          = require('./src/config/8muses/cli');
const cluConfig          = require('./src/config/8muses/clu');
const cookies            = require('./src/config/8muses/cookies');
const pupOptions         = require('./src/config/8muses/puppeteer');

const options            = cli(cliConfig);
const usage              = clu(cluConfig);

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  global.cliOptions = options;

  l.log('============================');
  l.log(`START using options:`.green);
  for (const key in options) {
    l.log(`   ${key} : ${options[key]}`.green);
  }
  
  history(options.url);
}

const rootUrl            = options.url;
const headers            = require('./src/config/8muses/headers')(rootUrl);
const destPath           = `${process.cwd()}/out/8muses/${path.basename(rootUrl)}`;

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

  chapterCleanup(global.completedVolumes);
})();
