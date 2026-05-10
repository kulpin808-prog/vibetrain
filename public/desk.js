/**
 * Kools gym admin — прототип (мок-данные). Позже: замена fetch к API.
 */

const TENANT = { name: 'FitPrime Арбат', id: 'tenant_demo' };

const MOCK_CLIENTS = [
    {
        id: 'c1',
        name: 'Алексей Воронов',
        tg: '@avoronov',
        status: 'active',
        tier: 'pro',
        lastActivity: '2026-05-07T14:22:00',
        requests7d: 5,
        joined: '2026-03-12',
    },
    {
        id: 'c2',
        name: 'Елена Смирнова',
        tg: '@esmir',
        status: 'active',
        tier: 'free',
        lastActivity: '2026-05-06T09:10:00',
        requests7d: 2,
        joined: '2026-04-01',
    },
    {
        id: 'c3',
        name: 'Дмитрий Козлов',
        tg: '@dkozl',
        status: 'trial',
        tier: 'pro',
        lastActivity: '2026-05-05T18:40:00',
        requests7d: 8,
        joined: '2026-05-01',
    },
    {
        id: 'c4',
        name: 'Анна Петрова',
        tg: '@apetrova',
        status: 'paused',
        tier: 'free',
        lastActivity: '2026-04-28T11:00:00',
        requests7d: 0,
        joined: '2026-02-20',
    },
    {
        id: 'c5',
        name: 'Игорь Никифоров',
        tg: '@inig',
        status: 'active',
        tier: 'pro',
        lastActivity: '2026-05-07T08:05:00',
        requests7d: 3,
        joined: '2026-01-08',
    },
];

const MOCK_EVENTS = {
    c1: [
        { t: '2026-05-07T14:22:00', type: 'ai_response', label: 'Выдана программа на неделю (силовая)' },
        { t: '2026-05-07T14:20:00', type: 'ai_request', label: 'Запрос: «дома, гантели, похудеть»' },
        { t: '2026-05-05T10:00:00', type: 'open', label: 'Открытие Mini App' },
    ],
    c2: [
        { t: '2026-05-06T09:10:00', type: 'ai_response', label: 'Короткая программа (лимит free)' },
        { t: '2026-05-04T16:30:00', type: 'ai_request', label: 'Форма: цель — выносливость' },
    ],
    c3: [
        { t: '2026-05-05T18:40:00', type: 'ai_response', label: 'Программа: зал, 4 дня' },
        { t: '2026-05-05T18:38:00', type: 'ai_request', label: 'Чат с тренером' },
        { t: '2026-05-01T12:00:00', type: 'join', label: 'Привязан к клубу (QR)' },
    ],
    c4: [{ t: '2026-04-28T11:00:00', type: 'billing', label: 'Подписка приостановлена админом' }],
    c5: [
        { t: '2026-05-07T08:05:00', type: 'ai_request', label: 'Уточнение по травме колена' },
        { t: '2026-05-06T19:00:00', type: 'ai_response', label: 'Адаптированная программа' },
    ],
};

const ROUTES = {
    dashboard: {
        title: 'Дашборд',
        desc: 'Сводка по взаимодействиям клиентов с AI-тренером',
    },
    clients: {
        title: 'Участники',
        desc: 'Список клиентов клуба и активность в боте',
    },
    subscriptions: {
        title: 'Подписки AI',
        desc: 'Планы доступа к безлимитным запросам и расширенным сценариям',
    },
    settings: {
        title: 'Настройки клуба',
        desc: 'Реквизиты, уведомления и интеграции (скоро)',
    },
};

function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusPill(status) {
    const map = {
        active: { class: 'adm-pill--success', text: 'Активен' },
        trial: { class: 'adm-pill--warning', text: 'Пробный' },
        paused: { class: 'adm-pill--neutral', text: 'Пауза' },
    };
    const x = map[status] || map.paused;
    return `<span class="adm-pill ${x.class}">${x.text}</span>`;
}

function tierPill(tier) {
    const isPro = tier === 'pro';
    return `<span class="adm-pill ${isPro ? 'adm-pill--success' : 'adm-pill--neutral'}">${isPro ? 'PRO' : 'Free'}</span>`;
}

function computeKpis(clients) {
    const active = clients.filter((c) => c.status === 'active' || c.status === 'trial').length;
    const requests = clients.reduce((s, c) => s + c.requests7d, 0);
    const pro = clients.filter((c) => c.tier === 'pro').length;
    return { active, requests, pro };
}

function renderDashboard(clients) {
    const kpi = computeKpis(clients);
    return `
    <div class="adm-kpi-grid">
      <article class="adm-kpi">
        <p class="adm-kpi__label">Активные клиенты</p>
        <p class="adm-kpi__value">${kpi.active}</p>
        <p class="adm-kpi__hint">Статусы «Активен» и «Пробный»</p>
      </article>
      <article class="adm-kpi">
        <p class="adm-kpi__label">Запросы к AI (7 дн.)</p>
        <p class="adm-kpi__value">${kpi.requests}</p>
        <p class="adm-kpi__hint">Сумма по всем участникам</p>
      </article>
      <article class="adm-kpi">
        <p class="adm-kpi__label">PRO подписка</p>
        <p class="adm-kpi__value">${kpi.pro}</p>
        <p class="adm-kpi__hint">Можно управлять в разделе «Подписки AI»</p>
      </article>
    </div>
    <section class="adm-panel">
      <div class="adm-panel__head">
        <h2 class="adm-panel__title">Недавняя активность</h2>
        <div class="adm-panel__tools">
          <a class="adm-btn adm-btn--subtle" href="#/clients">Все участники</a>
        </div>
      </div>
      <div class="adm-panel__body adm-table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th>Участник</th>
              <th>Событие</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            ${recentRows(clients)}
          </tbody>
        </table>
      </div>
      <div class="adm-panel__foot">Прототип: данные статичны. Подключение API — в следующей итерации.</div>
    </section>`;
}

function recentRows(clients) {
    const rows = [];
    for (const c of clients) {
        const ev = (MOCK_EVENTS[c.id] || [])[0];
        if (ev) rows.push({ c, ev });
    }
    rows.sort((a, b) => new Date(b.ev.t) - new Date(a.ev.t));
    return rows
        .slice(0, 6)
        .map(
            ({ c, ev }) => `
      <tr data-row-clickable data-client-id="${c.id}">
        <td><span class="adm-table__cell-title">${escapeHtml(c.name)}</span><br><span class="adm-table__cell-muted">${escapeHtml(c.tg)}</span></td>
        <td>${escapeHtml(ev.label)}</td>
        <td class="adm-table__cell-muted">${formatDateTime(ev.t)}</td>
      </tr>`
        )
        .join('');
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderClientsTable(clients) {
    if (!clients.length) {
        return `<div class="adm-panel"><div class="adm-placeholder">Никого не найдено по запросу.</div></div>`;
    }
    return `
    <section class="adm-panel">
      <div class="adm-panel__head">
        <h2 class="adm-panel__title">${clients.length} участников</h2>
        <div class="adm-panel__tools">
          <button type="button" class="adm-btn" data-export-mock disabled title="Скоро">Экспорт CSV</button>
        </div>
      </div>
      <div class="adm-panel__body adm-table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Telegram</th>
              <th>Статус</th>
              <th>План</th>
              <th>Запросы (7д)</th>
              <th>Последняя активность</th>
            </tr>
          </thead>
          <tbody>
            ${clients
                .map(
                    (c) => `
            <tr data-row-clickable data-client-id="${c.id}">
              <td><span class="adm-table__cell-title">${escapeHtml(c.name)}</span><br><span class="adm-table__cell-muted">с ${formatDate(c.joined)}</span></td>
              <td>${escapeHtml(c.tg)}</td>
              <td>${statusPill(c.status)}</td>
              <td>${tierPill(c.tier)}</td>
              <td>${c.requests7d}</td>
              <td class="adm-table__cell-muted">${formatDateTime(c.lastActivity)}</td>
            </tr>`
                )
                .join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderSubscriptions(clients) {
    const pro = clients.filter((c) => c.tier === 'pro');
    const free = clients.filter((c) => c.tier === 'free');
    return `
    <div class="adm-kpi-grid">
      <article class="adm-kpi">
        <p class="adm-kpi__label">PRO</p>
        <p class="adm-kpi__value">${pro.length}</p>
        <p class="adm-kpi__hint">Безлимит запросов (в прототипе)</p>
      </article>
      <article class="adm-kpi">
        <p class="adm-kpi__label">Free</p>
        <p class="adm-kpi__value">${free.length}</p>
        <p class="adm-kpi__hint">С дневными лимитами</p>
      </article>
    </div>
    <section class="adm-panel">
      <div class="adm-panel__head">
        <h2 class="adm-panel__title">Назначение плана</h2>
      </div>
      <div class="adm-panel__body" style="padding: 20px;">
        <p style="margin:0 0 12px; color: var(--adm-text-muted); font-size: 14px;">
          Выберите участника в списке слева и измените план в карточке. Ниже — быстрый обзор PRO.
        </p>
        <div class="adm-table-wrap">
          <table class="adm-table">
            <thead>
              <tr><th>Участник</th><th>План</th><th>Статус</th><th></th></tr>
            </thead>
            <tbody>
              ${pro
                  .map(
                      (c) => `
              <tr>
                <td class="adm-table__cell-title">${escapeHtml(c.name)}</td>
                <td>${tierPill(c.tier)}</td>
                <td>${statusPill(c.status)}</td>
                <td><button type="button" class="adm-btn adm-btn--subtle" data-open-client="${c.id}">Открыть</button></td>
              </tr>`
                  )
                  .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}

function renderSettings() {
    return `
    <section class="adm-panel">
      <div class="adm-panel__head">
        <h2 class="adm-panel__title">Клуб</h2>
      </div>
      <div class="adm-panel__body" style="padding: 20px;">
        <p style="margin:0; color: var(--adm-text-muted); max-width: 36em; line-height: 1.5;">
          Здесь будут: название и юрлицо, пригласительные ссылки и QR для привязки клиентов, webhooks в вашу CRM,
          роли сотрудников и журнал действий админов. Сейчас это заглушка прототипа.
        </p>
      </div>
    </section>`;
}

function renderDrawerClient(client) {
    const events = MOCK_EVENTS[client.id] || [];
    const timeline = events
        .map(
            (e) => `
      <li>
        <span class="adm-timeline__time">${formatDateTime(e.t)}</span>
        ${escapeHtml(e.label)}
      </li>`
        )
        .join('');

    return `
      <h2 class="adm-drawer__title">${escapeHtml(client.name)}</h2>
      <p class="adm-drawer__subtitle">${escapeHtml(client.tg)} · в клубе с ${formatDate(client.joined)}</p>

      <div class="adm-detail-section">
        <p class="adm-detail-section__label">Подписка AI</p>
        <div class="adm-form-row">
          <label for="drawer-tier">Тариф</label>
          <select id="drawer-tier" class="adm-select" data-tier-select data-client-id="${client.id}">
            <option value="free" ${client.tier === 'free' ? 'selected' : ''}>Free</option>
            <option value="pro" ${client.tier === 'pro' ? 'selected' : ''}>PRO</option>
          </select>
        </div>
        <div class="adm-form-row">
          <label for="drawer-status">Статус участия</label>
          <select id="drawer-status" class="adm-select" data-status-select data-client-id="${client.id}">
            <option value="active" ${client.status === 'active' ? 'selected' : ''}>Активен</option>
            <option value="trial" ${client.status === 'trial' ? 'selected' : ''}>Пробный</option>
            <option value="paused" ${client.status === 'paused' ? 'selected' : ''}>Пауза</option>
          </select>
        </div>
        <button type="button" class="adm-btn adm-btn--primary" data-save-client style="width:100%">Сохранить изменения</button>
      </div>

      <div class="adm-detail-section">
        <p class="adm-detail-section__label">Лента событий</p>
        <ul class="adm-timeline">
          ${timeline || '<li class="adm-table__cell-muted">Пока нет событий</li>'}
        </ul>
      </div>`;
}

function showToast(message) {
    const region = document.querySelector('[data-toast-region]');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'adm-toast';
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

const state = {
    route: 'dashboard',
    search: '',
    clients: [...MOCK_CLIENTS],
    selectedId: null,
};

function getFilteredClients() {
    const q = state.search.trim().toLowerCase();
    if (!q) return state.clients;
    return state.clients.filter(
        (c) => c.name.toLowerCase().includes(q) || c.tg.toLowerCase().includes(q)
    );
}

function syncNav() {
    document.querySelectorAll('[data-route]').forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('data-route') === state.route);
    });
}

function syncHeader() {
    const meta = ROUTES[state.route];
    const title = document.querySelector('[data-page-title]');
    const desc = document.querySelector('[data-page-desc]');
    if (title) title.textContent = meta.title;
    if (desc) desc.textContent = meta.desc;
}

function renderMain() {
    const main = document.getElementById('adm-main');
    if (!main) return;
    let html = '';
    const clients = getFilteredClients();
    if (state.route === 'dashboard') html = renderDashboard(state.clients);
    else if (state.route === 'clients') html = renderClientsTable(clients);
    else if (state.route === 'subscriptions') html = renderSubscriptions(state.clients);
    else if (state.route === 'settings') html = renderSettings();
    main.innerHTML = html;
    bindTableRows();
    bindSubscriptionOpens();
}

function parseHash() {
    const h = (window.location.hash || '#/dashboard').replace(/^#\/?/, '');
    const name = h.split('/')[0] || 'dashboard';
    return ROUTES[name] ? name : 'dashboard';
}

function navigate(route) {
    state.route = route;
    window.location.hash = `#/${route}`;
}

function onHashChange() {
    state.route = parseHash();
    state.selectedId = null;
    closeDrawer();
    syncNav();
    syncHeader();
    renderMain();
}

function openDrawer(clientId) {
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) return;
    state.selectedId = clientId;
    const drawer = document.querySelector('[data-drawer]');
    const body = document.querySelector('[data-drawer-body]');
    if (!drawer || !body) return;
    body.innerHTML = renderDrawerClient(client);
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');

    document.querySelectorAll('[data-row-clickable]').forEach((tr) => {
        tr.classList.toggle('is-selected', tr.getAttribute('data-client-id') === clientId);
    });

    body.querySelector('[data-save-client]')?.addEventListener('click', () => {
        const tier = body.querySelector('[data-tier-select]')?.value;
        const status = body.querySelector('[data-status-select]')?.value;
        const idx = state.clients.findIndex((c) => c.id === clientId);
        if (idx >= 0) {
            state.clients[idx] = { ...state.clients[idx], tier, status };
            showToast('Сохранено локально (прототип).');
            renderMain();
            openDrawer(clientId);
        }
    });
}

function closeDrawer() {
    const drawer = document.querySelector('[data-drawer]');
    if (drawer) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
    }
    state.selectedId = null;
    document.querySelectorAll('[data-row-clickable]').forEach((tr) => tr.classList.remove('is-selected'));
}

function bindTableRows() {
    document.querySelectorAll('[data-row-clickable]').forEach((tr) => {
        tr.addEventListener('click', () => {
            const id = tr.getAttribute('data-client-id');
            if (id) openDrawer(id);
        });
    });
}

function bindSubscriptionOpens() {
    document.querySelectorAll('[data-open-client]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-open-client');
            if (state.route !== 'clients') {
                navigate('clients');
                setTimeout(() => openDrawer(id), 40);
            } else {
                openDrawer(id);
            }
        });
    });
}

function init() {
    document.querySelector('[data-tenant-name]').textContent = TENANT.name;

    document.querySelectorAll('[data-route]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(link.getAttribute('data-route'));
        });
    });

    document.querySelector('[data-drawer-close]')?.addEventListener('click', closeDrawer);

    document.querySelector('[data-global-search]')?.addEventListener('input', (e) => {
        state.search = e.target.value;
        if (state.route === 'clients') renderMain();
    });

    document.querySelector('[data-action-invite]')?.addEventListener('click', () => {
        showToast('В прототипе приглашения не отправляются — будет API.');
    });

    document.querySelector('[data-admin-profile]')?.addEventListener('click', () => {
        showToast('Профиль администратора — позже (SSO / смена пароля).');
    });

    window.addEventListener('hashchange', onHashChange);
    state.route = parseHash();
    syncNav();
    syncHeader();
    renderMain();
}

init();
