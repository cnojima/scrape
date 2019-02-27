const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

module.exports = (chapterUrl, options) => {
  return req({
    url: chapterUrl,
    transform: body => cheerio.load(body)
  })
    .then($ => {
      const ret = [];
      
      $(`select.selectpicker option`).each((i, opt) => {
        const pageNum = $(opt).attr('value');
        const url = `${chapterUrl}/${pageNum}`;
        
        if (pageNum > 0 && ret.indexOf(url) < 0) {
          ret.push(url);
        }
      });
      
      return ret;
    })

    .catch(err => {
      l.error(err);
      process.exit(1);
    });
}


// const req     = require('request-promise');
// const cheerio = require('cheerio');
// const l       = require('../util/log');

// module.exports = (chapterUrl, options) => {
//   return req({
//     url: chapterUrl,
//     transform: body => cheerio.load(body)
//   })
//     .then($ => {
//       const ret = [];
      
//       $(`select.selectpicker option`).each((i, opt) => {
//         const pageNum = $(opt).attr('value');
        
//         if (pageNum > 0 && ret.indexOf(pageNum) < 0) {
//           ret.push(`${chapterUrl}/${pageNum}`);
//         }
//       });
      
//       return ret;
//     })

//     // .then(pages => {
//     //   l.info(`Chapter ${chapterUrl} has ${pages.length} pages`);

//     //   console.log(pages);process.exit();
//     // })

//     .catch(err => {
//       l.error(err);
//       process.exit(1);
//     });
// }