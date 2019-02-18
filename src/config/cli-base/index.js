module.exports = [
  {
    alias: 'u',
    defaultOption: true,
    description: 'URI to volume or collection that is a direct parent to multiple volumes.',
    name: 'url',
    type: String,
    typeLabel: '{underline https://www.8muses.com/path/to/series}',
  }, {
    alias: 'c',
    defaultValue: true,
    description: 'Set this flag to operate on the URL as a collection.',
    name: 'is-collection',
    type: Boolean,
  }, {
    alias: 'F',
    defaultValue: false,
    description: 'Overwrite existing CBZ archives when running this operation.',
    name: 'force-archive',
    type: Boolean,
  }, {
    alias: 'h',
    description: 'This help',
    name: 'help',
    type: Boolean
  }
];