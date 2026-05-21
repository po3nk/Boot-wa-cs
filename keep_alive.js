const http = require('http');

http.createServer((req, res) => {
  res.write("Barokah Aqiqah Bot is active!");
  res.end();
}).listen(8080);

console.log("Keep-alive server is running on port 8080");
