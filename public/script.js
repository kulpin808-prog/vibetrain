// Telegram Web App для Fitness Trainer AI
let tg = null;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;

        // Настройка Web App
        tg.ready();
        tg.expand();

        // Настройка темы
        applyTheme();

        console.log('Telegram Web App initialized');
        console.log('User:', tg.initDataUnsafe.user);
    } else {
        console.warn('Telegram Web App not available, running in browser mode');
    }

    // Обработчик формы
    const form = document.getElementById('workoutForm');
    form.addEventListener('submit', handleSubmit);

    // Валидация формы в реальном времени
    setupFormValidation();
});

// Применение темы Telegram
function applyTheme() {
    if (!tg) return;

    const themeParams = tg.themeParams;
    if (themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#40a7e3');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
    }
}

// Настройка валидации формы
function setupFormValidation() {
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');

    // Автоматически выбирать "тело" если ничего не выбрано
    function checkEquipmentSelection() {
        const checkedBoxes = document.querySelectorAll('input[name="equipment"]:checked');
        if (checkedBoxes.length === 0) {
            document.querySelector('input[name="equipment"][value="тело"]').checked = true;
        }
    }

    equipmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkEquipmentSelection);
    });

    // Валидация числовых полей
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            const value = parseInt(this.value);

            if (value < min) this.value = min;
            if (value > max) this.value = max;
        });
    });
}

// Обработка отправки формы
async function handleSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;

    try {
        // Показываем загрузку
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading"></div>Создаем программу...';

        // Собираем данные формы
        const formData = new FormData(event.target);
        const workoutRequest = buildWorkoutRequest(formData);

        console.log('Generated request:', workoutRequest);

        // Отправляем данные боту
        if (tg && tg.sendData) {
            // Через Telegram Web App
            const dataToSend = JSON.stringify({
                type: 'workout_request',
                data: workoutRequest
            });

            console.log('📤 Sending data to bot:', dataToSend);
            tg.sendData(dataToSend);
            console.log('✅ Data sent to Telegram bot');

            // Показываем успех и закрываем Web App
            showSuccess('Программа создана! Отправляем в чат...');
            setTimeout(() => {
                console.log('🔒 Closing Web App');
                tg.close();
            }, 2000);
        } else {
            // Для тестирования в браузере
            console.log('💻 Browser mode - workout request:', workoutRequest);
            alert('В браузере: ' + workoutRequest + '\n\nДанные отправлены боту!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Произошла ошибка. Попробуйте еще раз.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Построение запроса для бота
function buildWorkoutRequest(formData) {
    const goal = formData.get('goal');
    const experience = formData.get('experience');

    // Собираем оборудование
    const equipment = Array.from(formData.getAll('equipment'));
    const equipmentText = equipment.length > 0
        ? `Доступно оборудование: ${equipment.join(', ')}`
        : 'Только вес тела';

    // Дополнительная информация
    const limitations = formData.get('limitations')?.trim();
    const age = formData.get('age');
    const gender = formData.get('gender');
    const daysPerWeek = formData.get('daysPerWeek');
    const sessionDuration = formData.get('sessionDuration');

    let request = `${goal}, ${experience}. ${equipmentText}.`;

    if (age) request += ` Возраст: ${age} лет.`;
    if (gender) request += ` Пол: ${gender}.`;
    if (daysPerWeek) request += ` ${daysPerWeek} тренировок в неделю.`;
    if (sessionDuration) request += ` Каждая тренировка ${sessionDuration} минут.`;
    if (limitations) request += ` Ограничения: ${limitations}.`;

    return request;
}

// Показать успех
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="emoji">✅</span>
            <span class="message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Показать ошибку
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="emoji">❌</span>
            <span class="message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Стили для уведомлений
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    min-width: 300px;
    max-width: 90%;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    font-weight: 500;
}

.notification.success .notification-content {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.notification.error .notification-content {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.emoji {
    font-size: 20px;
}
`;

// Добавляем стили уведомлений
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Обработка закрытия Web App
if (tg) {
    tg.onEvent('viewportChanged', () => {
        // Адаптация под изменение размера viewport
    });

    tg.onEvent('themeChanged', () => {
        // Обновление темы при изменении
        applyTheme();
    });
}
