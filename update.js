#!/usr/bin/env node --inspect

global = {
  ...global,
  completedVolumes: []
};

require('./src/util/init');
const path         = require('path');
const { execSync } = require('child_process');
const merge        = require('deepmerge');
const Case         = require('case');
const cli          = require('command-line-args');
const cliConfig    = require('./src/config/cli-base');
const l            = require('./src/util/log');
const logRot       = require('./src/util/log-rotate');
const isEmpty      = require('./src/util/is-object-empty');
const history      = require('./out/history.json');
const options      = cli(cliConfig);

let urls = [];

if (!isEmpty(history)) {
  urls = Object.keys(history);
}

const go = () => {
  if (urls.length > 0) {
    const url = urls.shift();
    let { options, config } = history[url];

    if (options['is-complete'] || options.url.toLowerCase().indexOf('8muses') > -1) {
      go();
    } else {
      let start = () => {
        console.log(`\n\n\n[ ${options.url} ] is not supported`.yellow);
        go();
      }

      options.name = options.name || Case.title(path.basename(options.url));
      options['force-archive'] = false;

      // readcomiconline.to
      if (options.url.toLowerCase().indexOf('readcomiconline.to') > -1) {
        config = merge(require('./src/config/rco-to'), config);
        start = require('./src/rco-to/start')(options, config, 'rco-to', go);
      } else

      if (options.url.toLowerCase().indexOf('omgbeaupeep') > -1) {
        config = merge(require('./src/config/omgbeaupeep'), config);
        start = require('./src/start')(options, config, 'omgbeaupeep', go);
      } else if (options.url.toLowerCase().indexOf('readcomicsonline') > -1) {
        config = merge(require('./src/config/rco'), config);
        start = require('./src/start')(options, config, 'rco', go);
      } else if (options.url.toLowerCase().indexOf('mangakakalot') > -1) {
        config = merge(require('./src/config/mangakakalot'), config);
        start = require('./src/start')(options, config, 'mangakakalot', go);
      } else if (options.url.toLowerCase().indexOf('mangareader') > -1) {
        config = merge(require('./src/config/mangareader'), config);
        start = require('./src/start')(options, config, 'mangareader', go);
      } else if (options.url.toLowerCase().indexOf('funmanga') > -1) {
        config = merge(require('./src/config/funmanga'), config);
        start = require('./src/start')(options, config, 'funmanga', go);
      }

      l.setLogLevel(process.env.LOG_LEVEL || config.logLevel);
      l.setLogName(`${config.logDir}/${Case.snake(options.name)}.log`);

      logRot(config, () => {
        l.log('\n============================');
        l.log(`UPDATING using options:`);
        for (const key in options) {
          l.log(`   ${key} : ${options[key]}`);
        }

        (async () => {
          await start();
        })();
      });
    }
  } else {
    console.log(`DONE`.green);
    l.log('Starting YAC Librar(ies) Updates - this may take a few minutes.'.green);
    execSync('./bin/update-yac.sh');
  }
}

go();
