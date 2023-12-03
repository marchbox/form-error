import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

const PORT = 8000;

http.createServer(async (req, res) => {
  let filename = req.url.replace(/^\//, '');
  let mimetype = 'text/html; charset=UTF-8';

  if (!filename) {
    filename = 'demo.html';
  } else {
    mimetype = 'text/javascript';
  }

  res.writeHead(200, {'Content-Type': mimetype});
  fs.createReadStream(filename).pipe(res);
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);

