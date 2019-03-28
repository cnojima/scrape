#!/usr/bin/env node
/* eslint-disable */
require('colors');
const fs                 = require('fs');
const path               = require('path');
const mkdirp             = require('mkdirp');
const puppeteer          = require('puppeteer');
const Case               = require('case');

const dump               = require('./src/util/dump');
const history            = require('./src/util/history');
const l                  = require('./src/util/log');

const config             = require('./src/config/rco-to');
const pupOptions         = require('./src/config/puppeteer');
const cookies            = require('./src/config/rco-to/cookies');
const headers            = require('./src/config/rco-to/headers');


(async () => {
  const browser = await puppeteer.launch(pupOptions);
  const page = await browser.newPage();

  for (let i = 0, n = cookies.length; i < n; i++) {
    // eslint-disable-next-line no-await-in-loop
    await page.setCookie(cookies[i]);
  }
  await page.setExtraHTTPHeaders(headers);


  const responses = {};

  page.on('response', async (resp) => {
    const respHeaders = resp.headers();
    const request = await resp.request();
    const url = new URL(request.url()).href;

    if (url.substr(0, 4) !== 'data' && respHeaders['content-type'] && respHeaders['content-type'].indexOf('image/') > -1) {
      responses[url] = resp;
    }
  });

  page.on('load', async () => {
    console.log('@onLoad'.green);

    const images = await page.$$eval(config.imgSelector, async (arr) => {
      const ret = [];

      for (let i = 0, n = arr.length; i < n; i++) {
        ret.push(arr[i].src);
      }

      return ret;
    });

    console.log(images);
    console.log(Object.keys(responses));

    for (let i = 0, n = images.length; i < n; i++) {
      const src = images[i];

      if (responses[src]) {
        const resp = responses[src];
        const request = await resp.request();
        const url = new URL(request.url());
        const split = url.pathname.split('/');
        let filename = split[split.length - 1];
        const buffer = await resp.buffer();
        fs.writeFileSync(`./tmp/${filename}`, buffer);
        console.log(`saved ./tmp/${filename}`.green)
      } else {
        console.log(`${src} was not found in responses`.error);
      }
    }
  })

  // const pageUrl = 'https://readcomicsonline.ru/comic/wonder-woman-2016/25';
  const pageUrl = 'https://readcomiconline.to/Comic/Watchmen/Issue-2?id=14880&readType=1';

  // TOC
  await page.goto(pageUrl).catch((err) => {
    l.error(`rco-to failed at ${pageUrl}`);
    l.error(err);
    process.exit(1);
  });

  // we get the gatekeeper page
  await page.waitForNavigation({
    timeout: 120000,
    waitUntil: 'load',
  });

  // await browser.close();
})();
