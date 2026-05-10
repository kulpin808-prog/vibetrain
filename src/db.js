const { Pool } = require('pg');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS desk_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tg TEXT NOT NULL,
  status TEXT NOT NULL,
  tier TEXT NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL,
  requests_7d INT NOT NULL DEFAULT 0,
  joined_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS desk_events (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES desk_clients(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_desk_events_client_time ON desk_events(client_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS trainer_threads (
  id TEXT PRIMARY KEY,
  reply_index INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trainer_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES trainer_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_messages_thread ON trainer_messages(thread_id, id ASC);
`;

/** Те же данные, что были в desk.js (мок) — один раз засеиваются в пустую БД */
const SEED_CLIENTS = [
    ['c1', 'Алексей Воронов', '@avoronov', 'active', 'pro', '2026-05-07T14:22:00Z', 5, '2026-03-12'],
    ['c2', 'Елена Смирнова', '@esmir', 'active', 'free', '2026-05-06T09:10:00Z', 2, '2026-04-01'],
    ['c3', 'Дмитрий Козлов', '@dkozl', 'trial', 'pro', '2026-05-05T18:40:00Z', 8, '2026-05-01'],
    ['c4', 'Анна Петрова', '@apetrova', 'paused', 'free', '2026-04-28T11:00:00Z', 0, '2026-02-20'],
    ['c5', 'Игорь Никифоров', '@inig', 'active', 'pro', '2026-05-07T08:05:00Z', 3, '2026-01-08'],
];

const SEED_EVENTS = [
    ['c1', '2026-05-07T14:22:00Z', 'ai_response', 'Выдана программа на неделю (силовая)'],
    ['c1', '2026-05-07T14:20:00Z', 'ai_request', 'Запрос: «дома, гантели, похудеть»'],
    ['c1', '2026-05-05T10:00:00Z', 'open', 'Открытие Mini App'],
    ['c2', '2026-05-06T09:10:00Z', 'ai_response', 'Короткая программа (лимит free)'],
    ['c2', '2026-05-04T16:30:00Z', 'ai_request', 'Форма: цель — выносливость'],
    ['c3', '2026-05-05T18:40:00Z', 'ai_response', 'Программа: зал, 4 дня'],
    ['c3', '2026-05-05T18:38:00Z', 'ai_request', 'Чат с тренером'],
    ['c3', '2026-05-01T12:00:00Z', 'join', 'Привязан к клубу (QR)'],
    ['c4', '2026-04-28T11:00:00Z', 'billing', 'Подписка приостановлена админом'],
    ['c5', '2026-05-07T08:05:00Z', 'ai_request', 'Уточнение по травме колена'],
    ['c5', '2026-05-06T19:00:00Z', 'ai_response', 'Адаптированная программа'],
];

let pool;

function getPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL не задан');
    }
    if (!pool) {
        const isLocal =
            process.env.DATABASE_URL.includes('localhost') ||
            process.env.DATABASE_URL.includes('127.0.0.1');
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 5,
            idleTimeoutMillis: 20_000,
            ssl: isLocal ? false : { rejectUnauthorized: false },
        });
    }
    return pool;
}

function isDatabaseConfigured() {
    return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

async function pingDatabase() {
    if (!isDatabaseConfigured()) {
        return { ok: false, reason: 'not_configured' };
    }
    try {
        const p = getPool();
        await p.query('SELECT 1 AS x');
        return { ok: true };
    } catch (e) {
        return { ok: false, reason: 'error', error: e instanceof Error ? e.message : String(e) };
    }
}

async function initSchemaAndSeed() {
    if (!isDatabaseConfigured()) {
        return;
    }
    const p = getPool();
    await p.query(SCHEMA);

    const { rows } = await p.query('SELECT COUNT(*)::int AS c FROM desk_clients');
    if (rows[0].c > 0) {
        return;
    }

    for (const row of SEED_CLIENTS) {
        await p.query(
            `INSERT INTO desk_clients (id, name, tg, status, tier, last_activity, requests_7d, joined_date)
       VALUES ($1,$2,$3,$4,$5,$6::timestamptz,$7,$8::date)`,
            row
        );
    }
    for (const ev of SEED_EVENTS) {
        await p.query(
            `INSERT INTO desk_events (client_id, occurred_at, type, label)
       VALUES ($1,$2::timestamptz,$3,$4)`,
            ev
        );
    }
}

function mapClientRow(r) {
    return {
        id: r.id,
        name: r.name,
        tg: r.tg,
        status: r.status,
        tier: r.tier,
        lastActivity: new Date(r.last_activity).toISOString(),
        requests7d: r.requests_7d,
        joined: r.joined_date,
    };
}

async function deskListClients() {
    const p = getPool();
    const { rows: clients } = await p.query(
        `SELECT id, name, tg, status, tier, last_activity, requests_7d, joined_date
     FROM desk_clients ORDER BY name`
    );

    const { rows: recent } = await p.query(`
    SELECT DISTINCT ON (client_id) client_id, occurred_at AS t, type, label
    FROM desk_events
    ORDER BY client_id, occurred_at DESC
  `);
    const recentMap = new Map(recent.map((x) => [x.client_id, x]));

    return clients.map((c) => ({
        ...mapClientRow(c),
        _recent: recentMap.get(c.id) || null,
    }));
}

async function deskListEvents(clientId) {
    const p = getPool();
    const { rows } = await p.query(
        `SELECT occurred_at AS t, type, label FROM desk_events
     WHERE client_id = $1 ORDER BY occurred_at DESC`,
        [clientId]
    );
    return rows.map((r) => ({
        t: new Date(r.t).toISOString(),
        type: r.type,
        label: r.label,
    }));
}

async function deskUpdateClient(clientId, { tier, status }) {
    const p = getPool();
    const { rows } = await p.query(
        `UPDATE desk_clients
     SET tier = COALESCE($2, tier), status = COALESCE($3, status)
     WHERE id = $1
     RETURNING id, name, tg, status, tier, last_activity, requests_7d, joined_date`,
        [clientId, tier ?? null, status ?? null]
    );
    return rows[0] ? mapClientRow(rows[0]) : null;
}

const DEMO_REPLIES = [
    'Понял. Запиши три тренировки в неделю и сон не меньше 7 часов — это база для прогресса.',
    'Могу предложить лёгкую разминку 8 минут перед следующей сессией. Напиши, что у тебя за оборудование дома.',
    'Хороший вопрос. Если что‑то болит — остановись и уточним нагрузку, без геройства.',
];

async function trainerListMessages(threadId) {
    const p = getPool();
    const { rows } = await p.query(
        `SELECT role, content, created_at FROM trainer_messages
     WHERE thread_id = $1 ORDER BY id ASC`,
        [threadId]
    );
    return rows.map((r) => ({
        role: r.role,
        content: r.content,
        t: new Date(r.created_at).toISOString(),
    }));
}

async function trainerAppendExchange(threadId, userText) {
    const p = getPool();
    const client = await p.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO trainer_threads (id, reply_index) VALUES ($1, 0)
       ON CONFLICT (id) DO NOTHING`,
            [threadId]
        );
        const { rows: idxRows } = await client.query(
            `SELECT reply_index FROM trainer_threads WHERE id = $1 FOR UPDATE`,
            [threadId]
        );
        const idx = idxRows[0]?.reply_index ?? 0;
        const reply = DEMO_REPLIES[idx % DEMO_REPLIES.length];
        const nextIdx = (idx + 1) % DEMO_REPLIES.length;

        await client.query(`INSERT INTO trainer_messages (thread_id, role, content) VALUES ($1,'user',$2)`, [
            threadId,
            userText,
        ]);
        await client.query(
            `INSERT INTO trainer_messages (thread_id, role, content) VALUES ($1,'assistant',$2)`,
            [threadId, reply]
        );
        await client.query(`UPDATE trainer_threads SET reply_index = $2 WHERE id = $1`, [threadId, nextIdx]);
        await client.query('COMMIT');
        return { assistant: reply };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

module.exports = {
    getPool,
    isDatabaseConfigured,
    pingDatabase,
    initSchemaAndSeed,
    deskListClients,
    deskListEvents,
    deskUpdateClient,
    trainerListMessages,
    trainerAppendExchange,
};
