try {
    require('dotenv').config();
} catch (_) {
    /* optional */
}

const express = require('express');
const path = require('path');
const { mountApi } = require('./apiRoutes');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT, 10) || 3000;
const publicRoot = path.join(__dirname, '..', 'public');

mountApi(app);

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
    (async () => {
        try {
            await db.initSchemaAndSeed();
            if (db.isDatabaseConfigured()) {
                const ping = await db.pingDatabase();
                if (ping.ok) {
                    console.log('Neon/Postgres: подключение ок, схема и сид готовы.');
                } else {
                    console.warn('DATABASE_URL задан, но БД недоступна:', ping);
                }
            } else {
                console.warn('DATABASE_URL не задан — /api/desk и чат вернут 503.');
            }
        } catch (e) {
            console.error('Ошибка инициализации БД (проверьте DATABASE_URL):', e);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Mini App: http://localhost:${PORT}/`);
            console.log(`Админка: http://localhost:${PORT}/desk.html`);
            console.log(`API health: http://localhost:${PORT}/api/health`);
        });
    })();
}

module.exports = app;
