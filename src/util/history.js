const fs          = require('fs');
const l           = require('./log');
const historyFile = `${process.cwd()}/out/history.json`;

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