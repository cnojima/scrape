#!/usr/bin/env node --inspect

global = {
  ...global,
  completedVolumes: []
};

require('./src/util/init');
const { execSync } = require('child_process');
const path         = require('path');
const Case         = require('case');
const cli          = require('command-line-args');
const clu          = require('command-line-usage');
const cliConfig    = require('./src/config/cli-base');
const cluConfig    = require('./src/config/clu-base')(cliConfig);
const l            = require('./src/util/log');
const logRot       = require('./src/util/log-rotate');
const history      = require('./src/util/history');

const options      = cli(cliConfig);
const usage        = clu(cluConfig);
let config;

l.setLogLevel('LOG');

if (!options.url) {
  console.log(usage);
  process.exit();
} else {
  let start = () => {
    console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
    console.log(usage);
  }

  const checkUrl = options.url.toLowerCase();

  options.name = options.name || Case.title(path.basename(options.url));

  if (checkUrl.indexOf('8muses') > -1) {
    config = require('./src/config/8muses');
    start = require('./src/8muses/start')(options, config, '8muses');
  } else



  // readcomiconline.to
  if (checkUrl.indexOf('readcomiconline.to') > -1) {
    config = require('./src/config/rco-to');
    start = require('./src/rco-to/start')(options, config, 'rco-to');
  } else



  // readcomicsonline.ru
  if (checkUrl.indexOf('readcomicsonline') > -1) {
    config = require('./src/config/rco');
    start = require('./src/start')(options, config, 'rco');
  } else
  // mangakakalot
  if (checkUrl.indexOf('mangakakalot') > -1 || checkUrl.indexOf('mangelo') > -1) {
    config = require('./src/config/mangakakalot');
    start = require('./src/start')(options, config, 'mangakakalot');
  } else
  // mangareader
  if (checkUrl.indexOf('mangareader') > -1) {
    config = require('./src/config/mangareader');
    start = require('./src/start')(options, config, 'mangareader');
  } else
  // funmanga
  if (checkUrl.indexOf('funmanga') > -1) {
    config = require('./src/config/funmanga');
    start = require('./src/start')(options, config, 'funmanga');
  } else
  // omgbeaupeep
  if (checkUrl.indexOf('omgbeaupeep') > -1) {
    config = require('./src/config/omgbeaupeep');
    start = require('./src/start')(options, config, 'omgbeaupeep');
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

    l.log(`UPDATING using config:`);
    for (const key in config) {
      l.log(`   ${key} : ${config[key]}`);
    }

    history(options, config);

    (async () => {
      await start(() => {
        if (options['update']) {
          l.log('Starting YAC Librar(ies) Updates - this may take a few minutes.'.green);
          execSync('./bin/update-yac.sh');
        }
      });
    })();
  });
}
