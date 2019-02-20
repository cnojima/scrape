#!/usr/bin/env node
require('colors');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const unzip = require('../src/util/unzip');




const files = fs.readdirSync('./');
const cwd = process.cwd();


function processCbz() {
  if (files.length > 0) {
    const f = files.shift();

    if (f.indexOf('cbz') > -1) {
      console.log(`working on ${f}`.white);
      const focusCbz = path.resolve(cwd, f);
      const chapterNumber = path.basename(f, '.cbz').substr(path.basename(f, '.cbz').length - 3);
      const unzipDir = path.resolve(cwd, chapterNumber);
      const incorrectJpg = path.resolve(cwd, chapterNumber, `${chapterNumber}.jpg`)

      // mkdir unzip path
      mkdirp.sync(unzipDir);

      // unzip target cbz to that dir
      unzip(focusCbz, unzipDir, true, (err, dest) => {
        if (!err) {
          // remove incorrect jpg
          if (fs.existsSync(incorrectJpg)) {
            fs.unlinkSync(incorrectJpg);
          }

          // remove cbz
          fs.unlinkSync(focusCbz);

          // continue
          processCbz();
        }
      });
    } else {
      processCbz();
    }
  } else {
    console.log('DONE'.green)
  }
}

processCbz();