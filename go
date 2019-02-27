#!/usr/bin/env node
global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};

require('./src/util/init');

const path      = require('path');
const Case      = require('case');
const cli       = require('command-line-args');
const clu       = require('command-line-usage');
const cliConfig = require('./src/config/cli-base');
const cluConfig = require('./src/config/clu-base')(cliConfig);
const l         = require('./src/util/log');
const logRot    = require('./src/util/log-rotate');
const history   = require('./src/util/history');

const options   = cli(cliConfig);
const usage     = clu(cluConfig);
let config;

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  let start = () => {
    console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
    console.log(usage);
  }

  options.name = options.name || Case.title(path.basename(options.url));

  if (options.url.toLowerCase().indexOf('8muses') > -1) {
    config = require('./src/config/8muses');
    start = require('./src/8muses/start')(options, config, '8muses');
  } else



  // readcomiconline.to
  if (options.url.toLowerCase().indexOf('readcomiconline.to') > -1) {
    config = require('./src/config/rco-to');
    start = require('./src/start')(options, config, 'rco-to');
  } else
  // readcomicsonline.ru
  if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
    config = require('./src/config/rco');
    start = require('./src/start')(options, config, 'rco');
  } else
  // mangakakalot
  if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
    config = require('./src/config/mangakakalot');
    start = require('./src/start')(options, config, 'mangakakalot');
  } else
  // mangareader
  if (options.url.toLowerCase().indexOf('mangareader') > -1) {
    config = require('./src/config/mangareader');
    start = require('./src/start')(options, config, 'mangareader');
  } else
  // funmanga
  if (options.url.toLowerCase().indexOf('funmanga') > -1) {
    config = require('./src/config/funmanga');
    start = require('./src/start')(options, config, 'funmanga');
  }

  config.logLevel = (process.env.LOG_LEVEL || config.logLevel);

  l.setLogLevel(config.logLevel);
  l.setLogName(`${config.logDir}/${Case.snake(options.name)}.log`);

  logRot(config, () => {
    l.log('============================');
    l.log(`START using options:`.green);
    for (const key in options) {
      l.log(`   ${key} : ${options[key]}`);
    }

    history(options, config);

    (async () => await start())();
  });
}
