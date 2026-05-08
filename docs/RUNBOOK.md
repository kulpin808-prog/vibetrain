# Runbook: деплой и эксплуатация

## Railway

- Репозиторий: GitHub `kulpin808-prog/vibetrain`.
- Ветка **prod:** обычно `main`; **staging:** отдельный сервис на `develop`.
- **Start command:** `npm run start:full` (задано в `railway.toml`).
- После **Generate Domain** добавьте в **Variables**:
  - `TELEGRAM_BOT_TOKEN`
  - `OPENAI_API_KEY`
  - `NODE_ENV=production`
  - `WEBAPP_URL` = `https://<ваш-домен>.up.railway.app`
  - `TELEGRAM_WEBAPP_URL` = то же значение, **только https**, без `/` в конце.

## BotFather

- Web App / Mini App URL должен совпадать с `TELEGRAM_WEBAPP_URL` на том же окружении.

## Типовые ошибки

| Симптом | Проверка |
|---------|----------|
| `Web App URL 'http://localhost:3000' is invalid` | На Railway не заданы `TELEGRAM_WEBAPP_URL` / `WEBAPP_URL` (HTTPS). |
| Бот молчит | Логи Railway, переменная `TELEGRAM_BOT_TOKEN`, лимиты OpenAI. |
| Форма открывается, данных нет | `tg.sendData`, логи бота `Received Web App data`. |

Подробнее про среды и ссылки: [ENVIRONMENTS.md](./ENVIRONMENTS.md).
