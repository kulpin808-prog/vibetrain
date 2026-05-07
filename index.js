const { Telegraf } = require('telegraf');
const config = require('./config');

if (!config.TELEGRAM_BOT_TOKEN) {
  console.error(
    '❌ Нет TELEGRAM_BOT_TOKEN. Локально: добавьте в .env (см. .env.example). На Railway: Project → Service → Variables → TELEGRAM_BOT_TOKEN = токен из @BotFather'
  );
  process.exit(1);
}
if (!config.OPENAI_API_KEY) {
  console.error(
    '❌ Нет OPENAI_API_KEY. Локально: .env. На Railway: Variables → OPENAI_API_KEY'
  );
  process.exit(1);
}
const { generateWorkoutProgram } = require('./openai-service');
const { enhanceProgramWithVideos } = require('./google-sheets-service');
const { saveWorkoutProgram, getProgramUrl } = require('./notion-service');

// Simple in-memory user storage (replace with database for production)
const userRequests = new Map(); // userId -> { count: number, date: string }

// Initialize bot
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Helper function to check rate limits
function checkRateLimit(userId) {
  const today = new Date().toDateString();
  const userData = userRequests.get(userId) || { count: 0, date: '' };

  if (userData.date !== today) {
    // Reset counter for new day
    userData.count = 0;
    userData.date = today;
  }

  if (userData.count >= config.MAX_FREE_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  userData.count++;
  userRequests.set(userId, userData);

  return { allowed: true, remaining: config.MAX_FREE_REQUESTS_PER_DAY - userData.count };
}

// Basic commands
bot.start((ctx) => {
  ctx.reply(`🏋️‍♂️ Добро пожаловать в VibeTrain!

Я — ваш персональный AI-тренер. Расскажите о целях, опыте, ограничениях или травмах — подготовлю программу тренировок с видео-подсказками.

Пример запроса: "Хочу похудеть, занимаюсь 6 месяцев, есть гантели 5-10кг дома, проблемы со спиной"

<b>🚀 Новый способ:</b> Используйте удобную форму для создания программы!`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📝 Создать программу',
            web_app: {
              url: config.TELEGRAM_WEBAPP_URL
            }
          }
        ],
        [
          {
            text: '💬 Написать запрос',
            callback_data: 'manual_input'
          }
        ]
      ]
    }
  });
});

bot.help((ctx) => {
  const userId = ctx.from.id;
  const rateLimit = checkRateLimit(userId);
  const remaining = rateLimit.allowed ? rateLimit.remaining + 1 : 0; // +1 because we haven't used it yet

  ctx.reply(`📋 Как пользоваться VibeTrain:

<b>🚀 Рекомендуемый способ:</b>
Нажмите "Создать программу" - откроется удобная форма для заполнения всех данных.

<b>💬 Альтернативный способ:</b>
Просто напишите запрос текстом, например:
• "Новичок, хочу набрать массу, тренажерный зал"
• "Женщина 35 лет, похудеть после родов, только дома"
• "Бегун, добавить силовые тренировки, травма колена"

<b>🎯 Что получите:</b>
• Персональную программу на 1 неделю
• Разминку, основную тренировку, заминку
• Видео-инструкции к каждому упражнению
• Сохранение программы в базе данных

📊 Осталось запросов сегодня: ${remaining}`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📝 Создать программу',
            web_app: {
              url: config.TELEGRAM_WEBAPP_URL
            }
          }
        ]
      ]
    }
  });
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackData;

  if (callbackData === 'manual_input') {
    await ctx.answerCallbackQuery();
    await ctx.reply(`💬 Напишите ваш запрос текстом, например:

• "Новичок, хочу набрать массу, тренажерный зал"
• "Женщина 35 лет, похудеть после родов, только дома"
• "Бегун, добавить силовые тренировки, травма колена"

Я создам персональную программу с видео-инструкциями! 💪`);
  }
});

// Universal message handler for all message types
bot.on('message', async (ctx) => {
  console.log('📨 Received message:', {
    type: ctx.updateType,
    hasWebAppData: !!ctx.message?.web_app_data,
    hasText: !!ctx.message?.text,
    message: ctx.message
  });

  // Handle Web App data
  if (ctx.message?.web_app_data) {
    try {
      console.log('📱 Received Web App data:', ctx.message.web_app_data);
      const webAppData = JSON.parse(ctx.message.web_app_data.data);
      console.log('📋 Parsed Web App data:', webAppData);

      if (webAppData.type === 'workout_request') {
        console.log('🚀 Processing Web App workout request:', webAppData.data);
        return await processWorkoutRequest(ctx, webAppData.data);
      }
    } catch (error) {
      console.error('❌ Error parsing Web App data:', error);
      await ctx.reply('❌ Ошибка обработки данных из формы. Попробуйте еще раз.');
      return;
    }
  }

  // Handle text messages
  if (ctx.message?.text) {
    const userMessage = ctx.message.text;

    // Skip commands
    if (userMessage.startsWith('/')) return;

    // Process as regular workout request
    await processWorkoutRequest(ctx, userMessage);
  }
});

// Unified workout request processor
async function processWorkoutRequest(ctx, userMessage) {
  const userId = ctx.from.id;
  const userName = ctx.from.username || ctx.from.first_name || 'Unknown';

  console.log(`🎯 Starting workout request processing for user ${userId}`);
  console.log(`📝 User message: "${userMessage}"`);

  try {
    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      console.log(`⏰ Rate limit exceeded for user ${userId}`);
      await ctx.reply(`⏰ Вы исчерпали лимит бесплатных запросов на сегодня (${config.MAX_FREE_REQUESTS_PER_DAY}).

Попробуйте завтра или обратитесь за подпиской PRO для большего количества запросов! ⭐`);
      return;
    }

    console.log(`✅ Rate limit OK, remaining: ${rateLimit.remaining}`);
    await ctx.reply('🔄 Анализирую ваш запрос и создаю персональную программу... Это займет около 30 секунд.');

    // Step 1: Generate personalized workout with AI
    console.log(`🤖 Calling OpenAI for user ${userId}...`);
    const workoutProgram = await generateWorkoutProgram(userMessage);
    console.log(`✅ AI response received, length: ${workoutProgram.length}`);

    // Step 2: Add video links from Google Sheets
    console.log('🎥 Adding video links...');
    const enhancedProgram = await enhanceProgramWithVideos(workoutProgram);
    console.log(`✅ Videos added, enhanced length: ${enhancedProgram.length}`);

    // Step 3: Save to Notion
    console.log('📝 Saving to Notion...');
    await saveWorkoutProgram(userId, userName, enhancedProgram);
    console.log('✅ Saved to Notion');

    // Step 4: Send response to user
    console.log('📤 Sending response to user...');
    let responseMessage = `✅ Ваша персональная программа тренировок готова!\n\n`;
    responseMessage += `📝 Запрос: "${userMessage}"\n\n`;
    responseMessage += `💪 Программа на 1 неделю:\n\n${enhancedProgram}\n\n`;
    responseMessage += `🏆 Следуйте программе, прогрессируйте постепенно!\n`;
    responseMessage += `📊 Осталось запросов сегодня: ${rateLimit.remaining}`;

    console.log(`📄 Response message length: ${responseMessage.length}`);

    // Send in chunks if message is too long (Telegram limit is 4096 chars)
    const maxLength = 4000;
    if (responseMessage.length > maxLength) {
      console.log('📄 Message too long, splitting into chunks...');
      const chunks = [];
      let currentChunk = '';

      const lines = responseMessage.split('\n');
      for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength) {
          chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      console.log(`📄 Split into ${chunks.length} chunks`);
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await ctx.reply(chunks[i]);
        } else {
          await ctx.reply(`📄 Продолжение (${i + 1}/${chunks.length}):\n\n${chunks[i]}`);
        }
      }
    } else {
      await ctx.reply(responseMessage);
    }

    console.log(`✅ Workout program successfully sent to user ${userId}`);

  } catch (error) {
    console.error('❌ Error processing workout request:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    await ctx.reply('❌ Произошла ошибка при создании программы. Попробуйте перефразировать запрос или обратитесь к администратору.');
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Произошла ошибка в работе бота.');
});

// Webhook только если явно задан WEBHOOK_URL; иначе polling (удобно для Railway и локалки)
const WEBHOOK_URL = process.env.WEBHOOK_URL;
if (process.env.NODE_ENV === 'production' && WEBHOOK_URL) {
  const PORT = process.env.PORT || 3000;
  bot.launch({
    webhook: {
      domain: WEBHOOK_URL,
      port: PORT
    }
  });
  console.log(`🤖 VibeTrain запущен на порту ${PORT} (webhook)`);
} else {
  bot.launch();
  console.log('🤖 VibeTrain запущен (long polling)');
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
