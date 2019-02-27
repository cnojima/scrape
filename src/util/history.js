const fs          = require('fs');
const l           = require('./log');
const historyFile = `${process.cwd()}/out/history.json`;

/**
 * Archives config and options used at time of scrape for updates.
 * @param {!object} options Full options from CLI and defaults
 * @param {!object} config Full site-based config with overrides used during scrape.
 */
module.exports = (options, config) => {
  let history = {};

  if (fs.existsSync(historyFile)) {
    history = require(historyFile);
  }

  if (history[options.url]) {
    l.warn(`repeat scrape of [ ${options.url} ]`);
  }

  history[options.url] = {
    options,
    config
  };

  const newHistory = {};
  const urls = Object.keys(history);
  urls.sort();

  urls.forEach(url => {
    newHistory[url] = history[url];
  });

  fs.writeFileSync(historyFile, JSON.stringify(newHistory, null, 2), 'utf8');
}
