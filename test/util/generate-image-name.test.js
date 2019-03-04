// const assert = require('assert');
const expect = require('expect.js');
const gsn    = require('../../src/util/guess-image-name');
const config = require('../../src/config');

describe('Testing [ src/util/guess-image-name ]', () => {
  it('should return a map of possible image names', () => {
    const url = "https://www.funmanga.com/History-s-Strongest-Disciple-Kenichi/112/7";
    const res = gsn(url, config);

    expect(res).to.eql({
      jpg: `007.jpg`,
      jpeg: `007.jpeg`,
      png: `007.png`,
      webp: `007.webp`,
      gif: `007.gif`,
    });
  });

  it('should handle URLs that contain extensions', () => {
    const url = "https://www.funmanga.com/History-s-Strongest-Disciple-Kenichi/112/7/ddd-image-07-w.jpg";
    const res = gsn(url, config);

    expect(res).to.eql({
      jpg: `007.jpg`,
      jpeg: `007.jpeg`,
      png: `007.png`,
      webp: `007.webp`,
      gif: `007.gif`,
    });
  });


  xit('should handle image names with numbers outside of the expected sequence', () => {
    const url = "https://www.funmanga.com/History-s-Strongest-Disciple-Kenichi/112/7/chapter-0777-image-07-w.jpg";
    const res = gsn(url, config);

    expect(res).to.eql({
      jpg: `007.jpg`,
      jpeg: `007.jpeg`,
      png: `007.png`,
      webp: `007.webp`,
      gif: `007.gif`,
    });
  });
});
