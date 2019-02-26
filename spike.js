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
const history   = require('./archive/history-old.json');
const newHistory = require('./src/util/history');

const go = async () => {
  if (history.length > 0) {
    const options   = cli(cliConfig);
    let config;

    options.url = history.shift();
    options.name = Case.title(path.basename(options.url));

    if (options.url.toLowerCase().indexOf('8muses') > -1) {
      config = require('./src/config/8muses');
    } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
      config = require('./src/config/rco');
    } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
      config = require('./src/config/mangakakalot');
    } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
      config = require('./src/config/mangareader');
    } else if (options.url.toLowerCase().indexOf('funmanga') > -1) {
      config = require('./src/config/funmanga');
    }

    l.setLogLevel(process.env.LOG_LEVEL || config.logLevel);
    l.setLogName(`${config.logDir}/${Case.snake(options.name)}.log`);


    newHistory(options, config);
    go();

  } else {
    console.log(`DONE`.green);
  }
}

go();
