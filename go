#!/usr/bin/env node

global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};

require('./src/util/init');

const config = require('./src/config');

process.env.LOG_LEVEL = config.logLevel;

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
  let start = () => {
    console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
    console.log(usage);    
  }

  global.cliOptions = options;

  if (options.url.toLowerCase().indexOf('8muses') > -1) {
    start = require('./src/8muses/start')(options);
  } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
    start = require('./src/rco/start')(options);
  } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
    start = require('./src/mangakakalot/start')(options);
  } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
    start = require('./src/mangareader/start')(options);
  }

  (async () => await start())();
}
