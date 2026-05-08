> **Актуальная навигация:** [docs/README.md](docs/README.md) · среды и URL — [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).

# 🚀 Быстрый запуск Fitness Trainer AI

## 🔥 Немедленное тестирование

### Шаг 1: Запустите сервисы
```bash
# Терминал 1: Web App сервер
npm run webapp

# Терминал 2: Бот
npm start
```

### Шаг 2: Тестирование Web App
1. Откройте: `http://localhost:3000/test`
2. Заполните форму
3. Нажмите "Отправить"
4. Проверьте логи в терминале бота

### Шаг 3: Тестирование в Telegram
1. Напишите боту `/start`
2. Нажмите "📝 Создать программу"
3. Заполните форму в Web App
4. Должна создаться программа

## 📋 Структура проекта

```
fitness-trainer-ai/
├── index.js                 # 🤖 Основной бот
├── server.js               # 🌐 Web App сервер
├── video-database.json     # 🎥 База видео
├── config.js              # ⚙️ Настройки
├── public/                # 📱 Web App файлы
│   ├── index.html        # Форма создания программ
│   ├── styles.css        # Стили
│   └── script.js         # Логика Web App
└── test-webapp-server.js # 🧪 Тестовый сервер
```

## 🔗 Как связаны бот и Web App

```
Пользователь в Telegram
    ↓
Нажимает "Создать программу"
    ↓
Открывается Web App (веб-страница)
    ↓
Пользователь заполняет форму
    ↓
Web App отправляет данные боту
    ↓
Бот получает данные и создает программу
    ↓
Бот отправляет готовую программу в чат
```

## 🛠️ Настройка для production

### Railway (рекомендуется)
1. **Создайте 2 проекта:**
   - `fitness-bot` - для бота
   - `fitness-webapp` - для Web App

2. **Переменные для бота:**
   ```
   TELEGRAM_BOT_TOKEN=ваш_токен
   OPENAI_API_KEY=ваш_ключ
   WEBAPP_URL=https://fitness-webapp.up.railway.app
   ```

3. **Переменные для Web App:**
   ```
   NODE_ENV=production
   ```

4. **BotFather настройка:**
   - Команда: `/setwebapp`
   - URL: `https://fitness-webapp.up.railway.app`

## 🐛 Отладка проблем

### Web App не отправляет данные:
```bash
# Проверьте логи сервера
npm run webapp

# Проверьте логи бота
npm start
```

### Бот не получает данные:
- Проверьте `WEBAPP_URL` в config
- Убедитесь что Web App развернут с HTTPS
- Проверьте логи на наличие `📱 Received Web App data`

### Кнопка не открывает Web App:
- Настройте Web App в BotFather
- Проверьте URL в Railway

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи в терминале
2. Сравните с `WEBAPP_SETUP.md`
3. Проверьте настройки в BotFather

**Готово к тестированию!** 🎉
