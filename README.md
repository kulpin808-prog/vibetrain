# VibeTrain

Минимальное приложение: статика и HTTP.

## Neon + GitHub + Railway

1. **Инициализация Neon в проекте (MCP, skills, OAuth)** — один раз из корня репозитория:

   ```bash
   npm install
   npm run neon:init
   ```

   Это команда из документации Neon (`npx neonctl@latest init`); в репозитории она проксируется на локальный `neonctl`. Откроется браузер для входа, при желании настрой Cursor через мастер.

   Только Cursor без вопросов: `npm run neon:init:cursor`.

2. **GitHub** — в [Neon Console](https://console.neon.tech) → твой проект → **Integrations** → **GitHub** → подключи репозиторий (например `kulpin808-prog/vibetrain`). В GitHub появятся **secret** `NEON_API_KEY` и **variable** `NEON_PROJECT_ID` — они нужны workflow [`.github/workflows/neon-branch.yml`](.github/workflows/neon-branch.yml) (ветки БД на PR).

3. **Railway — переменная `DATABASE_URL`**

   Сервис **не получает** её из Neon автоматически. Сделай так:

   1. [Neon Console](https://console.neon.tech) → твой проект → **Dashboard** → **Connect**.
   2. Выбери ветку для прода (обычно `main` / production), роль и БД — скопируй **Connection string** (формат `postgresql://…?sslmode=require`). При необходимости включи **Pooled connection**, если Neon так предлагает для приложений.
   3. [Railway](https://railway.com) → твой проект → **сервис** с этим репозиторием → вкладка **Variables**.
   4. **New Variable** → имя ровно **`DATABASE_URL`** → вставь скопированную строку → сохрани.
   5. Railway пересоберёт/перезапустит деплой (или нажми **Redeploy**).

   Пока в коде нет обращения к Postgres, переменная не используется, но её можно задать заранее — так не забудешь, когда подключишь БД (см. [Neon + Railway](https://neon.com/docs/guides/railway)).

Шаблон переменных: скопируй [`.env.example`](.env.example) в `.env` (не коммить). Без **`DATABASE_URL`** мини‑приложение откроется, но **админка** и **чат «Мой тренер»** через API не загрузят данные (вернётся 503).

```bash
npm install   # создаёт package-lock.json
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) (порт — `PORT`). Превью в макете телефона; полный экран в браузере: [?mock=0](http://localhost:3000/?mock=0). В Telegram Web App макет отключается автоматически.

**Прототип админки клуба** (мок-данные) — обычный файл в `public`, без префикса `/admin`:

**http://localhost:3000/desk.html**

В логе `npm start` строки `Mini App:` и `Админка (прототип):`.

Проверка без браузера: `npm run verify`.

MIT.
