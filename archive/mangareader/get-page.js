// const fs              = require('fs');
// const path            = require('path');
// const req             = require('request-promise');
// const cheerio         = require('cheerio');

// const config          = require('../config/mangareader');
// const l               = require('../util/log');
// const generateImgName = require('../util/generate-sequence-name');

// module.exports = (pageUrl, imgDestDir, options) => {
//   // go to HTML page
//   l.debug(`@getPage going to [ ${pageUrl} ] for [ ${imgDestDir} ]`.cyan)

//   return req({
//     url: pageUrl,
//     timeout: config.reqTimeout,
//     transform: body => cheerio.load(body)
//   })
//     .then($ => {
//       return $(config.imgSelector).attr('src');
//     })

//     .then(imgUrl => {
//         l.debug(`GET'ing ${imgUrl}`);

//         req.get({
//           method: 'GET',
//           encoding: null,
//           url : imgUrl
//         }).then(function (res) {
//           l.info(`saving ${imgDestDir}`);
//           const buffer = Buffer.from(res, 'utf8');
//           fs.writeFileSync(`${imgDestDir}`, buffer);
//         }).catch(err => {
//           l.error(`error in downloading img ${err}`);
//           throw `wtf: ${imgUrl}`;
//         });
//       })

//       .catch(err => {
//         l.error(err);
//         process.exit(1);
//       });
// }
