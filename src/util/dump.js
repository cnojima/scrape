/** 
 * Debug utility to dump to console a given JS object
 * @param {!any} o
 */
module.exports = o => console.log(require('util').inspect(o, null, 2));
