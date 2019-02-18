module.exports = arr => {
  const ret = [];

  if (arr.length > 0) {
    for (let i=0, n=arr.length; i<n; i++) {
      let a = arr[i];
      
      if (a.innerHTML.indexOf('iframe') < 0) {
        // console.log(a.href);
        ret.push(a.href);
      }
    }
  }

  return ret;
};
