const cliOpts = require('./cli.js');

module.exports = [
  {
    header: 'Usage',
    content: 'Scrape a single volume, or {italic collection}.'
  }, {
    header: 'Example',
    content: [
      '{bold ./go} -u {underline https://readcomicsonline.ru/path/to/volume}',
      '{bold ./go} {italic -c} --url={underline https://readcomicsonline.ru/path/to/series}'
    ]
  }, {
    header: 'Options',
    optionList: cliOpts
  }
]