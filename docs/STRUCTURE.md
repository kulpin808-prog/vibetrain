# Структура репозитория

```
.
├── data/                    # Данные, не требующие логики (JSON)
│   └── video-database.json  # Соответствие упражнений → ссылки на видео
├── docs/                    # Вся актуальная документация
├── public/                  # Статика Mini App (HTML/CSS/JS)
├── scripts/                 # Утилиты и тесты из командной строки (не продакшен entrypoint)
│   ├── test-deployment.js
│   ├── test-webapp.js
│   └── test-webapp-server.js
├── src/                     # Исходный код приложения
│   ├── config.js            # Env + проверка production URL
│   ├── index.js             # Telegram-бот (entry для npm start)
│   ├── server.js            # Express, раздача public/ (entry для npm run webapp)
│   └── services/            # Сервисы без привязки к Telegram/HTTP
│       ├── openai-service.js
│       ├── google-sheets-service.js
│       └── notion-service.js
├── .cursor/                 # Пример MCP (github), локальный .cursor/mcp.json в .gitignore
├── .env.example
├── package.json
├── railway.toml             # Start: npm run start:full
└── README.md
```

## Точки входа

| Команда | Что запускается |
|---------|------------------|
| `npm start` | `src/index.js` — только бот |
| `npm run webapp` | `src/server.js` — только HTTP + статика |
| `npm run start:full` | оба процесса (Railway) |
| `npm test` | `scripts/test-deployment.js` |

## Где править типичные задачи

| Задача | Файл |
|--------|------|
| Промпт / модель OpenAI | `src/services/openai-service.js` |
| Токены и URL | `.env` локально; Railway Variables; `src/config.js` для правил |
| Команды бота, лимиты, склейка ответа | `src/index.js` |
| Маршруты HTTP, CORS | `src/server.js` |
| Форма Mini App | `public/*` |
| Видео к упражнениям | `data/video-database.json`, при необходимости логика в `src/services/google-sheets-service.js` |
