/**
 * Kools gym admin — данные с сервера (Neon через /api/desk/*).
 */

const TENANT = { name: 'FitPrime Арбат', id: 'tenant_demo' };

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

function renderDashboard(clients, recentById) {
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
            ${recentRows(clients, recentById)}
          </tbody>
        </table>
      </div>
      <div class="adm-panel__foot">Данные из Postgres (Neon).</div>
    </section>`;
}

function recentRows(clients, recentById) {
    const map = recentById || {};
    const rows = [];
    for (const c of clients) {
        const ev = map[c.id];
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

function renderDrawerClient(client, events) {
    const list = events || [];
    const timeline = list
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
    clients: [],
    recentById: {},
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
    if (state.route === 'dashboard') html = renderDashboard(state.clients, state.recentById);
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

async function openDrawer(clientId) {
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) return;
    state.selectedId = clientId;
    const drawer = document.querySelector('[data-drawer]');
    const body = document.querySelector('[data-drawer-body]');
    if (!drawer || !body) return;

    let events = [];
    try {
        const r = await fetch(`/api/desk/clients/${encodeURIComponent(clientId)}/events`);
        const j = await r.json();
        if (j.ok) events = j.events;
        else showToast(j.error || 'Не удалось загрузить события');
    } catch (_) {
        showToast('Ошибка сети (события)');
    }

    body.innerHTML = renderDrawerClient(client, events);
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');

    document.querySelectorAll('[data-row-clickable]').forEach((tr) => {
        tr.classList.toggle('is-selected', tr.getAttribute('data-client-id') === clientId);
    });

    body.querySelector('[data-save-client]')?.addEventListener('click', async () => {
        const tier = body.querySelector('[data-tier-select]')?.value;
        const status = body.querySelector('[data-status-select]')?.value;
        const idx = state.clients.findIndex((c) => c.id === clientId);
        if (idx < 0) return;
        try {
            const r = await fetch(`/api/desk/clients/${encodeURIComponent(clientId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, status }),
            });
            const j = await r.json();
            if (!j.ok) {
                showToast(j.error || 'Ошибка сохранения');
                return;
            }
            state.clients[idx] = {
                ...state.clients[idx],
                tier: j.client.tier,
                status: j.client.status,
            };
            showToast('Сохранено в базе.');
            renderMain();
            await openDrawer(clientId);
        } catch (_) {
            showToast('Ошибка сети');
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
            if (id) void openDrawer(id);
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
                setTimeout(() => {
                    void openDrawer(id);
                }, 40);
            } else {
                void openDrawer(id);
            }
        });
    });
}

async function loadDeskData() {
    const main = document.getElementById('adm-main');
    if (main) {
        main.innerHTML =
            '<section class="adm-panel"><div class="adm-placeholder">Загрузка участников…</div></section>';
    }
    try {
        const r = await fetch('/api/desk/clients');
        const j = await r.json();
        if (!j.ok) {
            showToast(j.error || 'API недоступно');
            if (main) {
                main.innerHTML = `<section class="adm-panel"><div class="adm-placeholder">Нет данных: ${escapeHtml(
                    j.error || 'ошибка'
                )}. Проверьте DATABASE_URL на сервере.</div></section>`;
            }
            return;
        }
        state.clients = j.clients;
        state.recentById = j.recentById || {};
    } catch (e) {
        showToast('Ошибка сети при загрузке участников');
        if (main) {
            main.innerHTML =
                '<section class="adm-panel"><div class="adm-placeholder">Не удалось связаться с сервером.</div></section>';
        }
    }
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
    void loadDeskData().then(() => {
        renderMain();
    });
}

init();
