#!/usr/bin/env node

global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};

require('./src/util/init');
const path = require('path');
const Case = require('case');
const cli       = require('command-line-args');
const cliConfig = require('./src/config/cli-base');
const l = require('./src/util/log');
const history   = require('./out/history.json');
const options   = cli(cliConfig);

const go = async () => {
  if (history.length > 0) {
    let config;
    options.url = history.shift();

    let start = () => {
      console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
      console.log(usage);
    }

    options.name = options.name || Case.title(path.basename(options.url));

    if (options.url.toLowerCase().indexOf('8muses') > -1) {
      config = require('./src/config/8muses');
      start = require('./src/8muses/start')(options, config, '8muses', go);
    } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
      config = require('./src/config/rco');
      start = require('./src/start')(options, config, 'rco', go);
    } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
      config = require('./src/config/mangakakalot');
      start = require('./src/start')(options, config, 'mangakakalot', go);
    } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
      config = require('./src/config/mangareader');
      start = require('./src/start')(options, config, 'mangareader', go);
    } else if (options.url.toLowerCase().indexOf('funmanga') > -1) {
      config = require('./src/config/funmanga');
      start = require('./src/start')(options, config, 'funmanga', go);
    }

    l.setLogLevel(process.env.LOG_LEVEL || config.logLevel);
    l.setLogName(`${config.logDir}/${Case.snake(options.name)}.log`);

    l.log('============================');
    l.log(`UPDATING using options:`.green);
    for (const key in options) {
      l.log(`   ${key} : ${options[key]}`);
    }

    await start();

  } else {
    console.log(`DONE`.green);
  }
}

go();
