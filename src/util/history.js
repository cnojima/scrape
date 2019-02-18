const fs = require('fs');


const historyFile = `${process.cwd()}/out/history.json`;

module.exports = url => {
  let history = [];

  if (fs.existsSync(historyFile)) {
    history = require(historyFile);
  }
  
  if (history.indexOf(url) < 0) {
    history.push(url);
  } else {
    console.log(`[WARN] repeat scrape of [ ${url} ]`.yellow);
  }


  fs.writeFileSync(historyFile, JSON.stringify(history.sort(), null, 2), 'utf8');
}