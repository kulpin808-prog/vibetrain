# Среды и ссылки на Web App

## Открыть форму в браузере

| Среда | URL | Когда использовать |
|--------|-----|---------------------|
| **Продакшен** | [https://kools.up.railway.app](https://kools.up.railway.app) | То, что видят пользователи; код с ветки `main`, деплой Railway |
| **Локально** | [http://localhost:3000](http://localhost:3000) | После `npm run webapp` на своём ПК |
| **Тест / staging** | *отдельный домен Railway* (см. ниже) | Ветка `develop`, отельный сервис, чтобы не трогать прод |

Страница тестовой формы без Telegram: локально [http://localhost:3000/test](http://localhost:3000/test); на проде — `https://kools.up.railway.app/test`.

## Как получить отдельную ссылку на «тестовое» приложение

Сейчас публичный хост один — **kools** (прод). Чтобы иметь **второй URL** только для экспериментов из `develop`:

1. В [Railway](https://railway.app) создайте **новый проект** (или второй сервис в том же проекте).
2. **Deploy from GitHub** → репозиторий `vibetrain` → в настройках сервиса укажите **ветку `develop`** (не `main`).
3. Те же **Start Command** и образ: `npm run start:full` (как в `railway.toml`).
4. **Variables**: отдельный тестовый **Telegram-бот** (токен от BotFather), свои `OPENAI_*`, свой **Generate Domain**, например `kools-staging.up.railway.app`.
5. В **BotFather** у тестового бота Web App URL = этот staging-домен.

Так вы получите постоянную **тестовую ссылку для браузера** и не смешиваете её с продом.

## Переменные по средам (кратко)

Локально — файл **`.env`** (не в git). На Railway — **Variables** сервиса.

Обязательные: `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, в проде — `TELEGRAM_WEBAPP_URL` и `WEBAPP_URL` как **HTTPS** публичного домена этого сервиса (см. [RUNBOOK.md](./RUNBOOK.md)).
