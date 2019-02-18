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
    defaultValue: false,
    description: 'Set this flag to operate on the URL as a collection.',
    name: 'is-collection',
    type: Boolean,
    // typeLabel: '{underline []}',
  }, {
    alias: 'w',
    defaultValue: false,
    description: 'Set this flag to operate on the URL as a collection.',
    name: 'convertwebp',
    type: Boolean,
    // typeLabel: '{underline []}',
  }, {
    alias: 'F',
    defaultValue: false,
    description: 'Overwrite existing CBZ archives when running this operation.',
    name: 'force-archive',
    type: Boolean,
    // typeLabel: '{underline []}',
  },
];