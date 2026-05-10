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

3. **Railway** — в сервисе открой **Variables** и задай **`DATABASE_URL`** = connection string из Neon (**Connect** в дашборде, ветка, с которой должен работать прод). Автоматически `neonctl init` Railway не связывает; строку копируешь вручную. Подробнее: [Use Neon Postgres with Railway](https://neon.com/docs/guides/railway).

Шаблон переменных: скопируй [`.env.example`](.env.example) в `.env` (не коммить).

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
