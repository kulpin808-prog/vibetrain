#!/usr/bin/env node
/**
 * Самопроверка маршрутов. Запуск: npm run verify
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../src/server.js');

function request(port, reqPath) {
    return new Promise((resolve, reject) => {
        http.get(
            {
                hostname: '127.0.0.1',
                port,
                path: reqPath,
            },
            (res) => {
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: Buffer.concat(chunks).toString('utf8'),
                    });
                });
            }
        ).on('error', reject);
    });
}

const publicRoot = path.join(__dirname, '..', 'public');
const deskHtml = path.join(publicRoot, 'desk.html');

const server = http.createServer(app);

server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    let failed = false;
    function ok(cond, msg) {
        if (!cond) {
            console.error('FAIL:', msg);
            failed = true;
        }
    }

    try {
        ok(fs.existsSync(deskHtml), 'public/desk.html должен существовать');

        const desk = await request(port, '/desk.html');
        ok(desk.status === 200, `/desk.html ожидали 200, получили ${desk.status}`);
        ok(
            desk.body.includes('<!DOCTYPE html>') && desk.body.includes('Kools'),
            '/desk.html должен отдавать HTML админки'
        );

        const css = await request(port, '/desk.css');
        ok(css.status === 200, `/desk.css ожидали 200, получили ${css.status}`);
        ok(css.body.includes('--adm-'), 'desk.css должен содержать токены --adm-');

        const js = await request(port, '/desk.js');
        ok(js.status === 200, `/desk.js ожидали 200, получили ${js.status}`);

        const home = await request(port, '/');
        ok(home.status === 200, `/ ожидали 200, получили ${home.status}`);
    } catch (e) {
        console.error('FAIL:', e.message);
        failed = true;
    }

    server.close(() => {
        if (failed) {
            process.exit(1);
        }
        console.log('verify: OK — /desk.html и статика открываются.');
        process.exit(0);
    });
});
