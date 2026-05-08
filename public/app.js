/**
 * Макет телефона в браузере по умолчанию.
 * Без макета: Telegram Mini App (есть initData) или ?mock=0 в URL.
 */
function usePhoneMockup() {
    const q = new URLSearchParams(window.location.search);
    if (q.get('mock') === '0') return false;
    if (window.Telegram?.WebApp?.initData) return false;
    return true;
}

function mountApp() {
    const root = document.getElementById('app');
    if (!root) return;

    root.appendChild(document.getElementById('app-template').content.cloneNode(true));

    const main = document.getElementById('app-main');
    main.appendChild(document.getElementById('view-workouts-template').content.cloneNode(true));
    main.appendChild(document.getElementById('view-trainer-template').content.cloneNode(true));

    const tabs = root.querySelectorAll('.app__tab');
    const panels = Array.from(main.children).filter(
        (el) => el.classList.contains('view') && el.getAttribute('role') === 'tabpanel'
    );

    function activate(viewId) {
        tabs.forEach((tab) => {
            const on = tab.dataset.view === viewId;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach((panel) => {
            const on = panel.id === `panel-${viewId}`;
            panel.classList.toggle('view--hidden', !on);
            panel.hidden = !on;
        });
        if (viewId === 'trainer') {
            requestAnimationFrame(() => scrollChatToEnd());
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activate(tab.dataset.view));
    });

    activate('workouts');
    initWorkoutSegment(root);
    initTrainerChat(root);
}

function initWorkoutSegment(root) {
    const group = root.querySelector('[data-segment-group]');
    if (!group) return;

    const buttons = group.querySelectorAll('.segment__btn');
    const panels = root.querySelectorAll('[data-workouts-panel]');

    function setMode(mode) {
        group.dataset.active = mode;
        buttons.forEach((btn) => {
            const on = btn.dataset.segment === mode;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach((panel) => {
            const on = panel.dataset.workoutsPanel === mode;
            panel.classList.toggle('workouts-panel--hidden', !on);
            panel.hidden = !on;
        });
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => setMode(btn.dataset.segment));
    });

    setMode('ready');
}

function createChatRow(role, text) {
    const row = document.createElement('div');
    row.className = `chat__row chat__row--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat__bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    return row;
}

function scrollChatToEnd() {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    el.scrollTop = el.scrollHeight;
}

function initTrainerChat(root) {
    const form = root.querySelector('#chat-form');
    const input = root.querySelector('#chat-input');
    const messages = root.querySelector('#chat-messages');
    if (!form || !input || !messages) return;

    messages.appendChild(
        createChatRow(
            'assistant',
            'Привет! Я твой AI‑тренер. Расскажи цель и уровень — задам пару вопросов, как в чате. Здесь пока демо: ответы имитация, позже подключим реальную модель.'
        )
    );

    function resizeInput() {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    }

    input.addEventListener('input', resizeInput);

    const demoReplies = [
        'Понял. Запиши три тренировки в неделю и сон не меньше 7 часов — это база для прогресса.',
        'Могу предложить лёгкую разминку 8 минут перед следующей сессией. Напиши, что у тебя за оборудование дома.',
        'Хороший вопрос. Если что‑то болит — остановись и уточним нагрузку, без геройства.',
    ];
    let replyIndex = 0;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        messages.appendChild(createChatRow('user', text));
        input.value = '';
        resizeInput();
        scrollChatToEnd();

        const typingRow = document.createElement('div');
        typingRow.className = 'chat__row chat__row--assistant chat__row--typing';
        typingRow.innerHTML =
            '<div class="chat__bubble"><span class="chat__typing" aria-hidden="true"><i></i><i></i><i></i></span></div>';
        messages.appendChild(typingRow);
        scrollChatToEnd();

        window.setTimeout(() => {
            typingRow.remove();
            const reply = demoReplies[replyIndex % demoReplies.length];
            replyIndex += 1;
            messages.appendChild(createChatRow('assistant', reply));
            scrollChatToEnd();
        }, 900);
    });
}

function initTelegramChrome() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    const p = tg.themeParams;
    if (p?.bg_color) {
        document.documentElement.style.setProperty('--app-surface', p.bg_color);
    }
    if (p?.text_color) {
        document.documentElement.style.setProperty('--app-text', p.text_color);
    }
    if (p?.hint_color) {
        document.documentElement.style.setProperty('--app-muted', p.hint_color);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!usePhoneMockup()) {
        document.body.classList.add('app-native');
    }
    initTelegramChrome();
    mountApp();
});
