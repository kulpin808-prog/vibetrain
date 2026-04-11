# 🧪 Тестирование Telegram Web App

## 🚀 Проблема решена!

Web App не загружался потому что **в BotFather не настроена ссылка на Web App**.

## 📋 Решение: Настройка публичного URL

### Вариант 1: Ngrok (рекомендуется для тестирования)

#### Шаг 1: Установите Ngrok
```bash
# Скачайте с https://ngrok.com/download
# Или через brew:
brew install ngrok/ngrok/ngrok

# Авторизуйтесь (получите токен на сайте ngrok)
ngrok config add-authtoken YOUR_TOKEN_HERE
```

#### Шаг 2: Запустите tunneling
```bash
# В одном терминале запустите Web App сервер
npm run webapp

# В другом терминале запустите ngrok
ngrok http 3000
```

Ngrok покажет публичный URL типа: `https://abc123.ngrok-free.app`

#### Шаг 3: Настройте переменную
```bash
export TELEGRAM_WEBAPP_URL=https://abc123.ngrok-free.app
```

#### Шаг 4: Перезапустите бота
```bash
npm start
```

### Вариант 2: Railway (для production)

1. **Разверните Web App на Railway:**
   ```bash
   # Создайте новый проект на Railway
   # Загрузите код из папки проекта
   # Railway даст URL типа: https://fitness-webapp.up.railway.app
   ```

2. **Настройте переменную:**
   ```bash
   export TELEGRAM_WEBAPP_URL=https://fitness-webapp.up.railway.app
   ```

## 🤖 Настройка в BotFather

### Шаг 1: Откройте BotFather
```
/mybots
# Выберите вашего бота
```

### Шаг 2: Настройте Web App
```
Bot Settings → Web Apps → Create a Web App
Name: Создать программу тренировок
URL: https://abc123.ngrok-free.app (или ваш Railway URL)
```

### Шаг 3: Проверьте
Теперь при нажатии "📝 Создать программу" откроется ваш Web App!

## 🧪 Тестирование

### Тест 1: Проверка доступности
```bash
# Запустите сервер
npm run webapp

# Проверьте в браузере
open http://localhost:3000
open http://localhost:3000/test
```

### Тест 2: Тестирование в Telegram
1. Напишите боту `/start`
2. Нажмите "📝 Создать программу"
3. Должно открыться Web App
4. Заполните форму → "Отправить"
5. Проверьте логи бота на наличие:
   ```
   📱 Received Web App data
   🚀 Processing Web App workout request
   ```

### Тест 3: Проверка отправки данных
```bash
# В браузере откройте http://localhost:3000/test
# Заполните форму и нажмите "Отправить"
# Должно появиться сообщение об успехе
# Проверьте логи бота
```

## 🐛 Возможные проблемы

### Web App не открывается в Telegram:
- Проверьте URL в BotFather
- Убедитесь что сервер запущен
- Ngrok/Railway URL должен быть HTTPS

### Данные не доходят до бота:
- Проверьте логи: `📱 Received Web App data`
- Убедитесь что `tg.sendData()` вызывается
- Проверьте `TELEGRAM_WEBAPP_URL` в config

### Ошибка CORS:
- Сервер уже настроен с правильными заголовками
- Проверьте что Web App загружается с того же домена

## 📱 Мобильное тестирование

Web App автоматически адаптируется под мобильные устройства Telegram.

### Тестирование на разных устройствах:
- iPhone Safari
- Android Chrome
- Desktop Telegram
- Mobile Telegram App

## 🎯 Следующие шаги

1. **Настройте ngrok** и получите публичный URL
2. **Настройте BotFather** с этим URL
3. **Запустите бота** и Web App сервер
4. **Протестируйте** полную интеграцию
5. **При необходимости** разверните на Railway для постоянной работы

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи сервера и бота
2. Сравните URL в BotFather и config
3. Убедитесь что оба сервиса запущены

**Готово к полноценному тестированию!** 🚀
