const fs          = require('fs');
const l           = require('./log');
const historyFile = `${process.cwd()}/out/history.json`;

/**
 * Writes root URI to a given collection for re-evaluating/updates
 * @param {!string} url Full URI to the TOC page of a collection
 */
module.exports = url => {
  let history = [];

  if (fs.existsSync(historyFile)) {
    history = require(historyFile);
  }
  
  if (history.indexOf(url) < 0) {
    history.push(url);
  } else {
    l.warn(`repeat scrape of [ ${url} ]`);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history.sort(), null, 2), 'utf8');
}
