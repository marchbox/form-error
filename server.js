import * as fs from 'node:fs';
import * as http from 'node:http';

const PORT = 8000;

const EXT_2_MIME = new Map([
  ['html', 'text/html; charset=UTF-8'],
  ['js', 'text/javascript'],
  ['css', 'text/css'],
  ['ico', 'image/x-icon'],
]);

http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  const filename = req.url.replace(/^\//, '');
  const ext = filename.split('.')[1];
  const mimetype = EXT_2_MIME.get(ext) ?? 'text/plain';

  if (fs.existsSync(filename)) {
    res.writeHead(200, {'Content-Type': mimetype});
    fs.createReadStream(filename).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}`);

