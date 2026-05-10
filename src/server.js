const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT, 10) || 3000;
const publicRoot = path.join(__dirname, '..', 'public');

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
        console.log(`Mini App: http://localhost:${PORT}/`);
        console.log(`Админка (прототип): http://localhost:${PORT}/desk.html`);
    });
}

module.exports = app;
