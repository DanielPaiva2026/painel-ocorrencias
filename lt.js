const localtunnel = require('localtunnel'); (async () => { const tunnel = await localtunnel({ port: 3000 }); require('fs').writeFileSync('url.txt', tunnel.url); tunnel.on('close', () => {}); })();
