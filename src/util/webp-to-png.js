const fs    = require('fs');
const path  = require('path');
const spawn = require('child_process').spawn;
const dwebp = '/usr/local/bin/dwebp';


module.exports = function(imgDest, finalImg) {
  return new Promise(function(resolve, reject) {
    const args = `-nofancy -nodither -mt -o ${finalImg} ${imgDest}`;
    const child = spawn(dwebp, args.split(' '));

    child.on('close', status => {
      // console.log(`status on dwebp child ${status}`);

      fs.unlinkSync(imgDest);

      if (status === 0) {
        resolve();
      } else {
        console.log(`[WARN] webp2png failed for ${imgDest}`.yellow);
        reject(imgDest);
      }
    });

    child.on('error', err => {
      console.log(`ERROR in dwebp`, err);
      reject(err);
    });
  });
}
