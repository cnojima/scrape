require('colors');
const mkdirp = require('mkdirp');
const config = require('../config');

mkdirp.sync(config.logDir);
mkdirp.sync(config.outDir);