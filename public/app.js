/**
 * Макет телефона в браузере по умолчанию.
 * Без макета: Telegram Mini App (есть initData) или ?mock=0 в URL.
 * ?forceLight=1 — всегда светлая тема (отладка поверх тёмного Telegram).
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

const THEME_LIGHT = {
    surface: '#ffffff',
    elevated: '#f5f5f7',
    text: '#1d1d1f',
    muted: '#86868b',
    separator: 'rgba(60, 60, 67, 0.12)',
    accent: '#1d1d1f',
    tabInactive: '#86868b',
};

const THEME_DARK = {
    surface: '#1c1c1e',
    elevated: '#2c2c2e',
    text: '#f5f5f7',
    muted: '#8e8e93',
    separator: 'rgba(255, 255, 255, 0.12)',
    accent: '#f5f5f7',
    tabInactive: '#8e8e93',
};

function applyThemeTokens(t) {
    const r = document.documentElement.style;
    r.setProperty('--app-surface', t.surface);
    r.setProperty('--app-elevated', t.elevated);
    r.setProperty('--app-text', t.text);
    r.setProperty('--app-muted', t.muted);
    r.setProperty('--app-separator', t.separator);
    r.setProperty('--app-accent', t.accent);
    r.setProperty('--app-tab-inactive', t.tabInactive);
}

/**
 * Раньше подставляли themeParams.bg_color напрямую — при тёмной теме Telegram в чате
 * WebApp получает тёмные цвета и всё приложение «перекрашивалось», хотя дизайн белый.
 * Теперь: явно смотрим Telegram.WebApp.colorScheme (light | dark) и задаём свои палитры;
 * фон мини-приложения синхронизируем через setBackgroundColor там, где доступно.
 */
function initTelegramChrome() {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
        document.documentElement.removeAttribute('data-tg-theme');
        document.documentElement.style.removeProperty('--app-surface');
        document.documentElement.style.removeProperty('--app-elevated');
        document.documentElement.style.removeProperty('--app-text');
        document.documentElement.style.removeProperty('--app-muted');
        document.documentElement.style.removeProperty('--app-separator');
        document.documentElement.style.removeProperty('--app-accent');
        document.documentElement.style.removeProperty('--app-tab-inactive');
        return;
    }

    tg.ready();
    tg.expand();

    const q = new URLSearchParams(window.location.search);
    const forceLight = q.get('forceLight') === '1';

    function apply() {
        const scheme = forceLight || tg.colorScheme !== 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-tg-theme', scheme);

        if (scheme === 'light') {
            applyThemeTokens(THEME_LIGHT);
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
            if (typeof tg.setBackgroundColor === 'function') {
                try {
                    tg.setBackgroundColor('#ffffff');
                } catch (_) {
                    /* ignore */
                }
            }
            if (typeof tg.setHeaderColor === 'function') {
                try {
                    tg.setHeaderColor('#ffffff');
                } catch (_) {
                    /* ignore */
                }
            }
        } else {
            applyThemeTokens(THEME_DARK);
            const bg = tg.themeParams?.bg_color || THEME_DARK.surface;
            const header = tg.themeParams?.secondary_bg_color || tg.themeParams?.header_bg_color || bg;
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
            if (typeof tg.setBackgroundColor === 'function') {
                try {
                    tg.setBackgroundColor(bg);
                } catch (_) {
                    /* ignore */
                }
            }
            if (typeof tg.setHeaderColor === 'function') {
                try {
                    tg.setHeaderColor(header);
                } catch (_) {
                    /* ignore */
                }
            }
        }
    }

    apply();

    if (typeof tg.onEvent === 'function') {
        tg.onEvent('themeChanged', apply);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTelegramChrome();
    if (!usePhoneMockup()) {
        document.body.classList.add('app-native');
    }
    mountApp();
});
