#!/usr/bin/env node

global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};

require('./src/util/init');
const cli       = require('command-line-args');
const cliConfig = require('./src/config/cli-base');
const history   = require('./out/history.json');
const options   = cli(cliConfig);

const go = async () => {
  if (history.length > 0) {
    let config;
    const url = history.shift();

    console.log(`updating [ ${url} ]`.green);

    if (url.toLowerCase().indexOf('8muses') > -1) {
      options.url = url;
      config = require('./src/config/8muses');
      await require('./src/8muses/start')(options, config, '8muses');
    } else if (url.toLowerCase().indexOf('readcomicsonline') > -1) {
      options.url = url;
      config = require('./src/config/rco');
      await require('./src/start')(options, config, 'rco');
    } else if (url.toLowerCase().indexOf('mangakakalot') > -1) {
      options.url = url;
      config = require('./src/config/mangakakalot');
      await require('./src/start')(options, config, 'mangakakalot');
    } else if (url.toLowerCase().indexOf('mangareader') > -1) {
      options.url = url;
      config = require('./src/config/mangareader');
      await require('./src/start')(options, config, 'mangareader');
    } else if (url.toLowerCase().indexOf('funmanga') > -1) {
      options.url = url;
      config = require('./src/config/funmanga');
      await require('./src/start')(options, config, 'funmanga');
    }
  } else {
    console.log(`DONE`.green);
  }
}

go();
