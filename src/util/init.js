require('colors');
const fs = require('fs');
const mkdirp = require('mkdirp');
const config = require('../config');

if (!fs.existsSync(config.logDir)) mkdirp.sync(config.logDir);

if (!fs.existsSync(config.outDir)) mkdirp.sync(config.outDir);
