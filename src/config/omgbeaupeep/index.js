/**
 * CONFIG FOR
 * http://www.omgbeaupeep.com
 */
const config = require('../');

module.exports = {
  ...config,

  name        : 'omgbeaupeep',

  throttled   : 5,

  // pause before performing file-count sanity check in ms
  pauseBeforeSanity : 2000,

  outDir      : `/Volumes/cbr/Western`,

  useCustomGetCollection: true,
  useCustomGetPage: true,

  skipOmake: false,

  nukeSource: true,

  completedSelector: '',

  imgSelector : 'img.picture',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'value',
    selector: 'select[name="chapter"] option',
  },
};
