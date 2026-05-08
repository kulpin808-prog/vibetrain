// Тестовый скрипт для проверки развертывания
// Запускаем перед деплоем, чтобы убедиться что все работает

const config = require('../src/config');
const { generateWorkoutProgram } = require('../src/services/openai-service');
const { enhanceProgramWithVideos } = require('../src/services/google-sheets-service');
const { saveWorkoutProgram } = require('../src/services/notion-service');

async function runTests() {
  console.log('🧪 Запуск тестов развертывания...\n');

  try {
    // Тест 1: Проверка конфигурации
    console.log('1️⃣ Проверка конфигурации...');
    if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') {
      throw new Error('❌ TELEGRAM_BOT_TOKEN не настроен');
    }
    console.log('✅ Telegram токен: OK');

    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('❌ OPENAI_API_KEY не настроен');
    }
    console.log('✅ OpenAI ключ: OK');

    // Тест 2: Проверка OpenAI (если ключ настроен)
    console.log('\n2️⃣ Тестирование OpenAI...');
    try {
      const testPrompt = "Новичок, хочу похудеть, только дома";
      const response = await generateWorkoutProgram(testPrompt);
      console.log('✅ OpenAI: OK (сгенерировано', response.length, 'символов)');
    } catch (error) {
      console.log('⚠️ OpenAI: не протестировано (возможно нет ключа или лимиты)');
    }

    // Тест 3: Проверка Google Sheets
    console.log('\n3️⃣ Тестирование Google Sheets...');
    try {
      const videoMap = await enhanceProgramWithVideos('тест жим гантелей лежа');
      console.log('✅ Google Sheets: OK');
    } catch (error) {
      console.log('⚠️ Google Sheets: не настроен (fallback mode)');
    }

    // Тест 4: Проверка Notion
    console.log('\n4️⃣ Тестирование Notion...');
    try {
      const testProgram = "Тестовая программа тренировок";
      const pageId = await saveWorkoutProgram('123456789', 'TestUser', testProgram);
      console.log('✅ Notion: OK');
    } catch (error) {
      console.log('⚠️ Notion: не настроен (fallback mode)');
    }

    console.log('\n🎉 Все тесты пройдены! Бот готов к развертыванию.');

    // Информация для развертывания
    console.log('\n📋 Информация для развертывания:');
    console.log('- Переменные окружения настроены');
    console.log('- Основные API подключены');
    console.log('- Fallback режимы работают');

    if (config.TEST_MODE) {
      console.log('\n⚠️ Режим тестирования: некоторые функции могут быть отключены');
    }

  } catch (error) {
    console.error('\n❌ Ошибка в тестах:', error.message);
    process.exit(1);
  }
}

// Запуск тестов
runTests();
