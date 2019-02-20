const base = require('../cli-base');

module.exports = [
  ...base,
  {
    alias: 'c',
    defaultValue: true,
    description: 'Set this flag to operate on the URL as a collection.',
    name: 'is-collection',
    type: Boolean,
  }
];