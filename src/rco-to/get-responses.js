module.exports = (page, handleResponses) => {
  const responses = [];
  page.on('response', resp => {
    responses.push(resp);
  });

  page.on('load', () => {
    responses.map(async (resp, i) => {
      const request = await resp.request();
      const url = new URL(request.url);

      const split = url.pathname.split('/');
      let filename = split[split.length - 1];
      if (!filename.includes('.')) {
        filename += '.html';
      }

      const buffer = await resp.buffer();
      fs.writeFileSync(filename, buffer);
    });
  });
};
