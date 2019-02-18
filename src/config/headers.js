module.exports = rootUrl => {
  return {
    "accept"                    : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "accept-language"           : "en-US,en;q=0.9,pt;q=0.8",
    "cache-control"             : "no-cache",
    "dnt"                       : "1",
    "pragma"                    : "no-cache",
    "referer"                   : rootUrl,
    "upgrade-insecure-requests" : "1",
    "user-agent"                : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
  }
}