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
const cliConfig = require('./src/config/cli-base');
const l         = require('./src/util/log');
const isEmpty   = require('./src/util/is-object-empty');
const history   = require('./out/history.json');
const options   = cli(cliConfig);

let urls = [];

if (!isEmpty(history)) {
  urls = Object.keys(history);
}

const go = async () => {
  if (urls.length > 0) {
    const url = urls.shift();
    const { options, config } = history[url];

    let start = () => {
      console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
      console.log(usage);
    }

    options.name = options.name || Case.title(path.basename(options.url));

    if (options.url.toLowerCase().indexOf('8muses') > -1) {
      start = require('./src/8muses/start')(options, config, '8muses', go);
    } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
      start = require('./src/start')(options, config, 'rco', go);
    } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
      start = require('./src/start')(options, config, 'mangakakalot', go);
    } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
      start = require('./src/start')(options, config, 'mangareader', go);
    } else if (options.url.toLowerCase().indexOf('funmanga') > -1) {
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
