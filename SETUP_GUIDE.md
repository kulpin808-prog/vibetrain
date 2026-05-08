> **Актуальная навигация:** [docs/README.md](docs/README.md).

# 🚀 Настройка Fitness Trainer AI Bot

## ✅ Уже настроено:
- ✅ Node.js и зависимости
- ✅ Telegram бот токен
- ✅ OpenAI API ключ
- ✅ Базовая структура бота

## 🔧 Нужно настроить:

### 1. Google Sheets (база видео упражнений)

**Шаг 1:** Загрузите файл `Копия Workout Database 1200+.xlsx` в Google Sheets
1. Откройте [sheets.google.com](https://sheets.google.com)
2. Создайте новую таблицу или загрузите Excel файл
3. Файл находится: `~/Downloads/Копия Workout Database 1200+.xlsx`

**Шаг 2:** Получите Spreadsheet ID
- В URL таблицы найдите ID между `/d/` и `/edit`
- Пример: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
- Скопируйте этот ID

**Шаг 3:** Создайте Google Sheets API ключ
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API
4. Создайте API ключ в разделе "Credentials"
5. Скопируйте API ключ

**Шаг 4:** Задайте ключи в `.env` или обновите значения по умолчанию в `src/config.js`
```javascript
GOOGLE_SHEETS_API_KEY: 'ваш_api_ключ_здесь',
GOOGLE_SHEETS_SPREADSHEET_ID: 'ваш_spreadsheet_id_здесь',
```

### 2. Notion (хранение программ)

**Шаг 1:** Создайте базу данных в Notion
1. Создайте новую страницу в Notion
2. Добавьте базу данных с типом "Table"
3. Добавьте свойства:
   - Name (Title)
   - UserID (Text)
   - Date (Date)

**Шаг 2:** Получите Database ID
- В URL базы данных найдите ID после последнего `/`
- Пример: `https://notion.so/workspace/[DATABASE_ID]`
- Или откройте базу в Notion и скопируйте ID

**Шаг 3:** Создайте Notion API ключ
1. Перейдите в [Notion Developers](https://developers.notion.com)
2. Создайте новое integration
3. Скопируйте Internal Integration Token
4. Поделитесь базой данных с integration

**Шаг 4:** Задайте ключи в `.env` или обновите значения по умолчанию в `src/config.js`
```javascript
NOTION_API_KEY: 'ваш_notion_api_ключ_здесь',
NOTION_DATABASE_ID: 'ваш_database_id_здесь',
```

## 🏃‍♂️ Запуск бота

```bash
cd /Users/sergejkulpin/.cursor-tutor
npm start
```

Для разработки с перезагрузкой:
```bash
npm run dev
```

## 🧪 Тестирование

1. **Базовое тестирование:** Напишите боту `/start`
2. **Тест программы:** Отправьте сообщение "Новичок, хочу набрать массу, только гантели"
3. **Проверьте логи:** В консоли должны появляться сообщения о генерации

## 📊 Структура базы данных упражнений

Ваша Excel таблица имеет колонки:
- **Column B:** Название упражнения (Exercise)
- **Column C:** Короткая демонстрация (Short YouTube Demonstration)
- **Column D:** Подробное объяснение (In-Depth YouTube Explanation)

Бот использует колонки B и C для поиска видео по названию упражнения.

## 🔍 Поиск видео

Бот ищет видео по нормализованным названиям упражнений:
- Убирает специальные символы
- Приводит к нижнему регистру
- Ищет частичные совпадения

## 📈 Мониторинг

- Логи работы бота выводятся в консоль
- Ошибки сохраняются в логах
- Статистика использования доступна в коде

## 🆘 Проблемы и решения

**Проблема:** Бот не отвечает в Telegram
**Решение:** Проверьте токен бота и запустите `npm start`

**Проблема:** Ошибка OpenAI
**Решение:** Проверьте API ключ и баланс в OpenAI

**Проблема:** Нет видео в программах
**Решение:** Настройте Google Sheets API и проверьте структуру таблицы

**Проблема:** Notion не сохраняет программы
**Решение:** Проверьте API ключ и права доступа к базе данных
