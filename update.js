#!/usr/bin/env node
process.env.LOG_LEVEL = 'LOG';
global = {
  ...global,
  completedVolumes: [],
  errors: {
    length: 0
  },
};

require('./src/util/init');
const cli = require('command-line-args');
const history = require('./out/history.json');

const go = () => {
  if (history.length > 0) {
    const url = history.shift();

    if (url.toLowerCase().indexOf('8muses') > -1) {
      const options = cli(require('./src/config/8muses/cli'));
      options.url = url;
      global.config = require('./src/config/8muses');
      (async () => {await require('./src/8muses/start')(options); go()});
    } else if (url.toLowerCase().indexOf('readcomicsonline') > -1) {
      const options = cli(require('./src/config/rco/cli'));
      options.url = url;
      global.config = require('./src/config/rco');
      (async () => {await require('./src/rco/start')(options); go()});
    } else if (url.toLowerCase().indexOf('mangakakalot') > -1) {
      const options = cli(require('./src/config/mangakakalot/cli'));
      options.url = url;
      global.config = require('./src/config/mangakakalot');
      (async () => {await require('./src/mangakakalot/start')(options); go()});
    } else if (url.toLowerCase().indexOf('mangareader') > -1) {
      const options = cli(require('./src/config/mangareader/cli'));
      options.url = url;
      global.config = require('./src/config/mangareader');
      (async () => {await require('./src/mangareader/start')(options); go()});
    } else if (url.toLowerCase().indexOf('funmanga') > -1) {
      const options = cli(require('./src/config/funmanga/cli'));
      options.url = url;
      global.config = require('./src/config/funmanga');
      (async () => {await require('./src/funmanga/start')(options); go()});
    }
  } else {
    console.log(`DONE`.green);
  }
}

go();