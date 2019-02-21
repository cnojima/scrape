const fs    = require('fs');
const path  = require('path');
const spawn = require('child_process').spawn;
const dwebp = '/usr/local/bin/dwebp';


/**
 * Converts a WEBP image asset to a PNG using installed `dwebp` utility.
 * WEBP asset is deleted after successful operation.
 * 
 * @param {!string} webpImg Full path to the WEBP image asset
 * @param {!string} finalImg Full path to the new PNG asset
 * @return {promise}
 */
module.exports = function(webpImg, finalImg) {
  return new Promise(function(resolve, reject) {
    const args = `-nofancy -nodither -mt -o ${finalImg} ${webpImg}`;
    const child = spawn(dwebp, args.split(' '));

    child.on('close', status => {
      fs.unlinkSync(webpImg);

      if (status === 0) {
        resolve();
      } else {
        l.warn(`webp2png failed for ${webpImg}`.yellow);
        reject(webpImg);
      }
    });

    child.on('error', err => {
      l.error(`ERROR in dwebp`, err);
      reject(err);
    });
  });
}
