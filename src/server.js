const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT, 10) || 3000;
const publicRoot = path.join(__dirname, '..', 'public');
const adminRoot = path.join(__dirname, '..', 'admin');
const adminIndex = path.join(adminRoot, 'index.html');

/** Иначе Express может трактовать /admin и /admin/ как один путь — редирект и HTML ломаются в браузере. */
app.set('strict routing', true);

if (!fs.existsSync(adminIndex)) {
    console.error('[admin] Нет файла:', adminIndex, '(проверьте, что вы в корне репозитория и папка admin на месте)');
}

app.get('/admin', (req, res) => {
    const host = req.get('host') || `localhost:${PORT}`;
    const proto = req.protocol || 'http';
    res.redirect(302, `${proto}://${host}/admin/`);
});

app.get('/admin/', (req, res, next) => {
    res.sendFile(adminIndex, (err) => {
        if (err) next(err);
    });
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
