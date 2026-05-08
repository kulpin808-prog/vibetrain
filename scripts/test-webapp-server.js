// Простой тестовый сервер для Web App
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Разный порт для тестирования
const publicRoot = path.join(__dirname, '..', 'public');

// Middleware для обработки JSON
app.use(express.json());

// Раздача статических файлов Web App
app.use(express.static(publicRoot));

// Логируем все запросы
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// Web App endpoint
app.get('/', (req, res) => {
  console.log('📱 Serving Web App');
  res.sendFile(path.join(publicRoot, 'index.html'));
});

// API endpoint для тестирования
app.post('/api/test', (req, res) => {
  console.log('📡 Test API called:', req.body);
  res.json({ success: true, received: req.body });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test Web App server running on port ${PORT}`);
  console.log(`📱 Web App available at: http://localhost:${PORT}`);
});
