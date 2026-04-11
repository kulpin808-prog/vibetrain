const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обработки JSON
app.use(express.json());

// Добавляем заголовки для Telegram Web App
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Раздача статических файлов Web App
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
    }
}));

// Webhook endpoint для Telegram (если используется)
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        webapp_url: config.WEBAPP_URL
    });
});

// Web App endpoint - возвращает HTML
app.get('/', (req, res) => {
    console.log('🌐 Serving main Web App page');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test endpoint
app.get('/test', (req, res) => {
    console.log('🧪 Serving test Web App page');
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// API endpoint для обработки данных из Web App (опционально)
app.post('/api/workout-request', (req, res) => {
    console.log('📡 Workout request received:', req.body);
    res.json({
        success: true,
        message: 'Request processed',
        received: req.body
    });
});

// Telegram Web App validation endpoint
app.get('/validate', (req, res) => {
    const initData = req.query.initData;
    console.log('🔍 Web App validation request:', { initData: initData ? 'present' : 'missing' });
    res.json({ valid: true, message: 'Web App is configured correctly' });
});

// Обработка 404
app.use((req, res) => {
    console.log('❌ 404 Not found:', req.url);
    res.status(404).json({ error: 'Not found' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 VibeTrain Web App на порту ${PORT}`);
        console.log(`📱 Web App available at: http://localhost:${PORT}`);
        console.log(`🔗 Web App URL for BotFather: ${config.WEBAPP_URL}`);
        console.log(`🧪 Test page: http://localhost:${PORT}/test`);
    });
}

module.exports = app;
