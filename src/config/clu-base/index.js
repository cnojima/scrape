
module.exports = (cliOpts) => [
  {
    header: 'Usage',
    content: 'Scrape a single volume, or {italic collection}.'
  }, {
    header: 'Example',
    content: [
      '{bold ./go} -u {underline https://www.8muses.com/path/to/volume}',
      '{bold ./go} {italic -c} --url={underline https://www.8muses.com/path/to/series}'
    ]
  }, {
    header: 'Options',
    optionList: cliOpts
  }
];