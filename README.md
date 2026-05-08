# VibeTrain / Kools 🤖💪

AI-тренер в Telegram: программы тренировок и Mini App-форма.

**Открыть Web App в браузере (прод):** [https://kools.up.railway.app](https://kools.up.railway.app) · тест формы: `/test`  
**Документация (среды, архитектура, деплой):** папка **[docs/](docs/)** — начните с [docs/README.md](docs/README.md). **Дерево каталогов:** [docs/STRUCTURE.md](docs/STRUCTURE.md).

## ✅ Статус проекта

- ✅ **Node.js и зависимости** установлены
- ✅ **Telegram-бот** + **Web App**
- ✅ **OpenAI** для генерации программ
- 🔄 **Google Sheets** — опционально, видео к упражнениям
- 🔄 **Notion** — опционально, сохранение программ

## GitHub — это не всё

Репозиторий хранит код. Чтобы **клиенты** пользовались ботом 24/7, нужны ещё:

1. **Хостинг** с Node.js (например [Railway](https://railway.app) с деплоем из GitHub)
2. **Переменные окружения** на хостинге: `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, публичные `TELEGRAM_WEBAPP_URL` и `WEBAPP_URL` (HTTPS)
3. **OpenAI** с пополненным балансом API — иначе ответы модели не поедут
4. В **@BotFather** у Mini App указать тот же HTTPS URL, что у Web App на хостинге

Подробнее: **[docs/RUNBOOK.md](docs/RUNBOOK.md)** и **[docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)**. Исторический файл `DEPLOYMENT.md` дублирует часть сценариев.

## 🚀 Быстрый старт

Скопируйте переменные:

```bash
cp .env.example .env
# Откройте .env и вставьте TELEGRAM_BOT_TOKEN и OPENAI_API_KEY
```

### Осталось настроить (опционально):
```javascript
GOOGLE_SHEETS_API_KEY: 'нужно_создать_в_Google_Cloud',
GOOGLE_SHEETS_SPREADSHEET_ID: 'нужно_загрузить_Excel_в_Google_Sheets',
NOTION_API_KEY: 'нужно_создать_в_Notion_Developers',
NOTION_DATABASE_ID: 'нужно_создать_базу_в_Notion'
```

### 4. Настройка Google Sheets
1. Создайте новую таблицу Google Sheets
2. В колонке A: названия упражнений (например, "жим гантелей лежа")
3. В колонке B: ссылки на YouTube видео
4. Опубликуйте таблицу и скопируйте ID из URL
5. Создайте API ключ в Google Cloud Console

### 5. Настройка Notion
1. Создайте новую базу данных в Notion
2. Добавьте свойства: Name, UserID, Date
3. Скопируйте ID базы данных из URL
4. Создайте integration token в Notion Developers

### 6. Запуск

**Только бот** (если Web App уже где-то отдельно крутится):

```bash
cd /Users/sergejkulpin/.cursor-tutor
npm start
```

**Бот + Web App на одной машине** (удобно для продакшена на одном сервисе):

```bash
npm run start:full
```

Для разработки с автоперезагрузкой бота:

```bash
npm run dev
```

**После настройки Google Sheets и Notion будет полный функционал:**
- Видео-ссылки к упражнениям
- Сохранение программ в Notion

## 🧪 Тестирование

### Тестирование всех компонентов:
```bash
npm test
```

### Тестирование Web App локально:
```bash
# Запуск Web App сервера
npm run webapp

# Открыть: http://localhost:3000
```

### Тестирование в Telegram:

**🚀 Новый способ (рекомендуемый):**
1. Напишите боту: `/start`
2. Нажмите: "📝 Создать программу"
3. Заполните удобную Web App форму
4. Получите персональную программу!

**💬 Старый способ (текстом):**
1. Отправьте запрос: "Новичок, хочу похудеть, дома с гантелями"
2. Получите AI-генерированную программу

### Развертывание для постоянной работы:
Смотрите `DEPLOYMENT.md` для подробных инструкций по развертыванию на сервере.

**Быстрый старт с Railway:**
1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения
4. Разверните - бот будет работать 24/7! 🚀

## 📋 Функционал MVP

- ✅ Персонализированные тренировки на основе AI
- ✅ Интеграция видео-ссылок из Google Sheets
- ✅ Хранение программ в Notion
- ✅ Ограничение запросов (2 в день для бесплатных)
- ✅ Команды /start и /help

## 🏗 Архитектура

```
User Request → Rate Limit Check → OpenAI Generation → Video Enhancement → Notion Storage → Telegram Response
```

### Модули:
- `src/index.js` — основной бот и обработка сообщений
- `src/services/openai-service.js` — генерация программ через GPT
- `src/services/google-sheets-service.js` — загрузка видео-ссылок / локальные данные
- `src/services/notion-service.js` — сохранение программ
- `src/config.js` — настройки и ключи из env

## 🎯 Примеры использования

Пользователь пишет: *"Хочу похудеть, новичок, только дома, есть коврик"*

Бот отвечает программой на 1 неделю с:
- Разминкой (3 упражнения)
- Основной тренировкой (6+ упражнений)
- Заминкой (3 упражнения)
- Видео-ссылками на каждое упражнение
- Ссылкой на полную программу в Notion

## 📊 Метрики успеха

- Daily Active Users (DAU)
- Конверсия запросов в завершенные программы
- Удовлетворенность пользователей
- Техническая надежность (>95% успешных генераций)

## 🔧 Разработка

### Добавление новых функций:
1. Создайте новый модуль в отдельном файле
2. Импортируйте в `src/index.js`
3. Добавьте обработку в соответствующий handler

### Логирование:
Все ошибки логируются в консоль. Для продакшена добавьте Winston или аналог.

### Безопасность:
- Никогда не коммитите API ключи
- Используйте переменные окружения для продакшена
- Валидируйте входные данные

## 📝 TODO

- [ ] Добавить базу данных для пользователей (MongoDB/PostgreSQL)
- [ ] Система подписок PRO
- [ ] Аналитика использования
- [ ] Улучшенное распознавание упражнений для видео
- [ ] Интеграция с Google Analytics

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

---

Создано с ❤️ для любителей фитнеса
