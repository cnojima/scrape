#!/usr/bin/env node

process.env.LOG_LEVEL = 'DEBUG';

global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};
require('./src/util/init');
const cli         = require('command-line-args');
const clu         = require('command-line-usage');
const cliConfig   = require('./src/config/cli-base');
const cluConfig   = require('./src/config/clu-base')(cliConfig);
const options     = cli(cliConfig);
const usage       = clu(cluConfig);

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  global.cliOptions = options;

  if (options.url.toLowerCase().indexOf('8muses') > -1) {
    const start8muse = require('./src/8muses/start')(options);
    (async () => await start8muse())();
  } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
    const startrco = require('./src/rco/start')(options);
    (async () => await startrco())();
  } else {
    console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
    console.log(usage);    
  }
}
