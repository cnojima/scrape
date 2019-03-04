const path = require('path');

module.exports = (badWebp, book, pageUrl) => {
  const volumeRoot = path.dirname(badWebp);

  if (!global.errors[volumeRoot]) {
    global.errors[volumeRoot] = {
      url: book,
      page: [pageUrl],
    };
    global.errors.length++;
  } else if (global.errors[volumeRoot]) {
    global.errors[volumeRoot].page.push(pageUrl);
  }
};
