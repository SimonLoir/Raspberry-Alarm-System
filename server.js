require('dotenv').config({ path: '.env.local' });
// server.js
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { createServer } = require('http');
const { parse } = require('url');
const { spawn } = require('child_process');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        const address = `http://${hostname}:${port}`;
        console.log(`> Ready on ${address}`);
        try {
            const python = spawn('python3', [process.cwd() + '/core/core.py']);
            python.stdout.on('data', (data) => {
                try {
                    const d = JSON.parse(data.toString().trim());
                    console.log(d);
                    fetch(address + '/api/sensor/' + d.code, {
                        headers: {
                            Authorization: 'Bearer ' + process.env.API_KEY,
                        },
                    });
                } catch (error) {}
            });
            python.on('spawn', () => {
                console.log('Python script spawned');
            });
            python.on('error', (err) => {
                console.log(err);
            });
        } catch (error) {
            console.log(error);
        }
    });
});
