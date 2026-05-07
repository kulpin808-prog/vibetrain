require('dotenv').config();

// Конфиг VibeTrain — секреты только из переменных окружения (.env или панель хостинга)

module.exports = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY || 'your_google_sheets_api_key_here',
  GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'your_spreadsheet_id_here',

  NOTION_API_KEY: process.env.NOTION_API_KEY || 'your_notion_api_key_here',
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID || 'your_notion_database_id_here',

  MAX_FREE_REQUESTS_PER_DAY: 2,
  AI_MODEL: 'gpt-4o',

  TEST_MODE: false,

  WEBAPP_URL: process.env.WEBAPP_URL || 'http://localhost:3000',
  TELEGRAM_WEBAPP_URL: process.env.TELEGRAM_WEBAPP_URL || process.env.WEBAPP_URL || 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
  const web = module.exports.TELEGRAM_WEBAPP_URL.trim();
  if (!web.startsWith('https://')) {
    console.error(
      '❌ NODE_ENV=production: TELEGRAM_WEBAPP_URL / WEBAPP_URL должен быть публичным HTTPS (Railway), не localhost.\n' +
        '   В Railway → Variables задайте оба:\n' +
        '   TELEGRAM_WEBAPP_URL=https://<ваш-сервис>.up.railway.app\n' +
        '   WEBAPP_URL=https://<ваш-сервис>.up.railway.app\n' +
        '   Сейчас в процессе: ' +
        web
    );
    process.exit(1);
  }
}
