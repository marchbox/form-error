Bun.serve({
  port: 4113,
  hostname: 'localhost',
  async fetch(req) {
    const url = new URL(req.url);
    let filename = url.pathname.replace('/', '');
    let contentType = 'text/html';

    if (url.pathname.endsWith('favicon.ico')) {
      return new Response('', {status: 404});
    }

    if (url.pathname === '/') {
      filename = 'demo.html';
    }

    if (filename.endsWith('.js')) {
      contentType = 'text/javascript';
    }

    const file = Bun.file(filename);
    return new Response(await file.text(), {
      headers: {
        'Content-Type': contentType,
      },
    });
  }
});

