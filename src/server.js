const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const publicRoot = path.join(__dirname, '..', 'public');
const adminRoot = path.join(__dirname, '..', 'admin');
const adminIndex = path.join(adminRoot, 'index.html');

function pathOnly(req) {
    return req.originalUrl.split('?')[0];
}

if (!fs.existsSync(adminIndex)) {
    console.error('[admin] Нет файла:', adminIndex, '(проверьте, что вы в корне репозитория и папка admin на месте)');
}

/**
 * Сначала явно отдаём HTML по /admin/, потом static — иначе часть окружений Express
 * не срабатывает на вложенном Router/только static, и запрос падает в 404 { error: Not found }.
 */
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const p = pathOnly(req);
    if (p === '/admin') {
        return res.redirect(302, '/admin/');
    }
    if (p === '/admin/') {
        return res.sendFile(adminIndex, (err) => {
            if (err) next(err);
        });
    }
    next();
});

app.use(
    '/admin',
    express.static(adminRoot, {
        index: false,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
        },
    })
);

app.use(
    express.static(publicRoot, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
        },
    })
);

app.get('/', (req, res) => {
    res.sendFile(path.join(publicRoot, 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Web: http://localhost:${PORT}/`);
        console.log(`Admin: http://localhost:${PORT}/admin/`);
    });
}

module.exports = app;
