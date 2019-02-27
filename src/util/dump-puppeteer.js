const dump = require('./dump');

module.exports = async page => {
  const html = await page.content();

  dump(html);
};
