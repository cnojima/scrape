module.exports = {
  defaultViewport: {
    width  : 1200,
    height : 1000
  },

  headless: true,
  // headless: false, // launch headful mode

  ignoreHTTPSErrors: true,

  devtools: false,
  // slowMo: 250, // slow down puppeteer script so that it's easier to follow visually

  timeout: 45000,
};
