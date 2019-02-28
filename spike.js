#!/usr/bin/env node

require('./src/util/init');
const fs = require('fs');
const path       = require('path');
const url        = require('url');
const Case       = require('case');
const cli        = require('command-line-args');

const cliConfig  = require('./src/config/cli-base');
const l          = require('./src/util/log');
const history    = require('./archive/history-old.json');
const newHistory = require('./src/util/history');

const generateSequenceName = require('./src/util/generate-sequence-name');


const config = require('./src/config/rco-to');
// const url = ''https://2.bp.blogspot.com/-cLmxnTqDD_8/WguaAzb2EvI/AAAAAAAABBc/HkgGSeOvHEMKippF3H-T1DwpBlhwV6Z1wCHMYCw/s0/RCO008_w.jpg';
const s = 'https://2.bp.blogspot.com/ire5GUyLquyR6bmT7Bw9oQDC2LpYU3mXA4AfrLxmbv5tC8So084dHcfHP2_KXDBfrPLYOWkkp3q7=s0';
const foo = generateSequenceName(s, config, true);
console.log(path.extname(s));
console.log(path.extname('foo.jpg'));
console.log(path.basename('0'))
console.log(foo);

console.log(path.basename('image/jpeg'));

// const test = `https://readcomiconline.to/Comic/Sandman-Presents-Petrefax/Issue-1?id=125109`
// const myURL = new URL(test);

// console.log(url.format(myURL, { fragment: false, unicode: true, auth: false, search: false }));



// global = {
//   ...global,
//   completedVolumes: [],
//   errors: {
//     length: 0
//   },
// };


// const go = async () => {
//   if (history.length > 0) {
//     const options   = cli(cliConfig);
//     let config;

//     options.url = history.shift();
//     options.name = Case.title(path.basename(options.url));

//     if (options.url.toLowerCase().indexOf('8muses') > -1) {
//       config = require('./src/config/8muses');
//     } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
//       config = require('./src/config/rco');
//     } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
//       config = require('./src/config/mangakakalot');
//     } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
//       config = require('./src/config/mangareader');
//     } else if (options.url.toLowerCase().indexOf('funmanga') > -1) {
//       config = require('./src/config/funmanga');
//     }

//     l.setLogLevel(process.env.LOG_LEVEL || config.logLevel);
//     l.setLogName(`${config.logDir}/${Case.snake(options.name)}.log`);


//     newHistory(options, config);
//     go();

//   } else {
//     console.log(`DONE`.green);
//   }
// }

// go();
