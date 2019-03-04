const base = require('../cli-base');

module.exports = [
  ...base,

  {
    alias: 'c',
    defaultValue: false,
    description: 'Set this flag to operate on the URL as a collection.',
    name: 'is-collection',
    type: Boolean,
  }, {
    alias: 'w',
    defaultValue: false,
    description: 'Set this flag to convert webp files to png format.',
    name: 'convertwebp',
    type: Boolean,
  },
];
