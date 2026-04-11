// Тест обработки Web App данных
const config = require('./config');

// Мокаем ctx объект как в Telegraf
const mockCtx = {
  from: {
    id: 123456789,
    username: 'testuser',
    first_name: 'Test'
  },
  reply: async (message) => {
    console.log('📤 Bot reply:', message);
  },
  message: {
    web_app_data: {
      data: JSON.stringify({
        type: 'workout_request',
        data: 'Похудеть, новичок. Доступно оборудование: гантели, коврик. Возраст: 25 лет.'
      })
    }
  }
};

// Имитируем обработчик Web App данных
async function testWebAppProcessing() {
  console.log('🧪 Testing Web App data processing...\n');

  try {
    // Проверяем наличие web_app_data
    if (mockCtx.message.web_app_data) {
      console.log('📱 Web App data detected');
      const webAppData = JSON.parse(mockCtx.message.web_app_data.data);
      console.log('📋 Parsed data:', webAppData);

      if (webAppData.type === 'workout_request') {
        console.log('✅ Valid workout request detected');
        console.log('📝 Request data:', webAppData.data);

        // Здесь должна вызываться processWorkoutRequest
        console.log('🚀 Would call processWorkoutRequest with:', webAppData.data);

        await mockCtx.reply('✅ Web App данные обработаны успешно!');
      } else {
        console.log('❌ Invalid request type:', webAppData.type);
      }
    } else {
      console.log('❌ No Web App data found');
    }
  } catch (error) {
    console.error('❌ Error processing Web App data:', error);
  }
}

// Запуск теста
testWebAppProcessing();
