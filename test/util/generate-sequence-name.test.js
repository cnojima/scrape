const assert = require('assert');
const gsn    = require('../../src/util/generate-sequence-name');
const config = require('../../src/config');

describe('Testing [ src/util/generate-sequence-name ]', () => {
  it('should return a good sequence name', () => {
    const url1 = 'https://readcomicsonline.ru/uploads/manga/east-of-west-2013/chapters/1/09.jpg';
    const res1 = gsn(url1, config, true);

    const url2 = 'https://2.bp.blogspot.com/-GRHO2ib4M_w/WgubctionQI/AAAAAAAABUw/4S3vUlE3o6EswbX94_pCo5mLWoDkrdoIACHMYCw/s0/RCO002_w.jpg';
    const res2 = gsn(url2, { imgPadLength: 4 }, true);

    assert.equal(res1, '009.jpg');
    assert.equal(res2, '0002.jpg');
  });
});
