import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import * as process from 'node:process';

const PORT = 8000;
let isInit = true;

http.createServer(async (req, res) => {
  let filename = req.url.replace(/^\//, '');
  let mimetype = 'text/html; charset=UTF-8';
  let status = 200;

  if (!filename) {
    filename = 'demo.html';
  } else if (filename === 'index.js') {
    mimetype = 'text/javascript';
  } else {
    status = 404;
  }

  res.writeHead(status, status === 404 ? {} : {'Content-Type': mimetype});
  fs.createReadStream(filename).pipe(res);
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);

