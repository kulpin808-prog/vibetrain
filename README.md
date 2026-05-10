# VibeTrain

Минимальное приложение: статика и HTTP.

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
