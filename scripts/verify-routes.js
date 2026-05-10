#!/usr/bin/env node
/**
 * Самопроверка маршрутов без браузера. Запуск: npm run verify
 */
const http = require('http');
const app = require('../src/server.js');

function request(port, path, opts = {}) {
    return new Promise((resolve, reject) => {
        http.get(
            {
                hostname: '127.0.0.1',
                port,
                path,
                headers: opts.headers || {},
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
        const admin = await request(port, '/admin/');
        ok(admin.status === 200, `/admin/ ожидали 200, получили ${admin.status}`);
        ok(
            admin.body.includes('<!DOCTYPE html>') && admin.body.includes('Kools'),
            '/admin/ должен отдавать HTML админки'
        );

        const adminNoSlash = await request(port, '/admin');
        ok(
            adminNoSlash.status === 302 &&
                adminNoSlash.headers.location &&
                adminNoSlash.headers.location.includes('/admin/'),
            `/admin должен редиректить на /admin/ (получили ${adminNoSlash.status})`
        );

        const css = await request(port, '/admin/admin.css');
        ok(css.status === 200, `/admin/admin.css ожидали 200, получили ${css.status}`);
        ok(css.body.includes('--adm-'), 'admin.css должен содержать токены --adm-');

        const js = await request(port, '/admin/admin.js');
        ok(js.status === 200, `/admin/admin.js ожидали 200, получили ${js.status}`);

        const home = await request(port, '/');
        ok(home.status === 200, `/ ожидали 200, получили ${home.status}`);

        const junk = await request(port, '/api/nope');
        ok(
            junk.status === 404,
            `неизвестный путь ожидали 404 Express по умолчанию, получили ${junk.status}`
        );
        ok(
            !junk.body.includes('"error":"Not found"'),
            'ответ не должен быть JSON {error:Not found} из нашего сервера (его мы не задаём)'
        );
    } catch (e) {
        console.error('FAIL:', e.message);
        failed = true;
    }

    server.close(() => {
        if (failed) {
            process.exit(1);
        }
        console.log('verify: все проверки прошли (admin и статика).');
        process.exit(0);
    });
});
