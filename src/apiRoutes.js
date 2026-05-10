const express = require('express');
const db = require('./db');

function jsonError(res, status, message) {
    res.status(status).json({ ok: false, error: message });
}

function requireDb(res) {
    if (!db.isDatabaseConfigured()) {
        jsonError(res, 503, 'База не настроена: задайте DATABASE_URL (Neon).');
        return null;
    }
    return true;
}

function mountApi(app) {
    const router = express.Router();
    router.use(express.json({ limit: '1mb' }));

    router.get('/health', async (_req, res) => {
        const configured = db.isDatabaseConfigured();
        let dbOk = false;
        let dbDetail = configured ? null : 'not_configured';
        if (configured) {
            const ping = await db.pingDatabase();
            dbOk = ping.ok;
            dbDetail = ping.ok ? 'ok' : ping.reason === 'error' ? ping.error : ping.reason;
        }
        res.json({
            ok: true,
            dbConfigured: configured,
            dbReachable: dbOk,
            dbDetail: dbDetail || undefined,
        });
    });

    router.get('/desk/clients', async (_req, res) => {
        if (!requireDb(res)) return;
        try {
            const rows = await db.deskListClients();
            const clients = rows.map(({ _recent, ...c }) => c);
            const recentById = Object.fromEntries(rows.map((r) => [r.id, r._recent]));
            res.json({ ok: true, clients, recentById });
        } catch (e) {
            console.error(e);
            jsonError(res, 500, e instanceof Error ? e.message : 'Ошибка БД');
        }
    });

    router.get('/desk/clients/:id/events', async (req, res) => {
        if (!requireDb(res)) return;
        try {
            const events = await db.deskListEvents(req.params.id);
            res.json({ ok: true, events });
        } catch (e) {
            console.error(e);
            jsonError(res, 500, e instanceof Error ? e.message : 'Ошибка БД');
        }
    });

    router.patch('/desk/clients/:id', async (req, res) => {
        if (!requireDb(res)) return;
        try {
            const { tier, status } = req.body || {};
            const updated = await db.deskUpdateClient(req.params.id, { tier, status });
            if (!updated) {
                jsonError(res, 404, 'Клиент не найден');
                return;
            }
            res.json({ ok: true, client: updated });
        } catch (e) {
            console.error(e);
            jsonError(res, 500, e instanceof Error ? e.message : 'Ошибка БД');
        }
    });

    router.get('/trainer/threads/:threadId/messages', async (req, res) => {
        if (!requireDb(res)) return;
        try {
            const messages = await db.trainerListMessages(req.params.threadId);
            res.json({ ok: true, messages });
        } catch (e) {
            console.error(e);
            jsonError(res, 500, e instanceof Error ? e.message : 'Ошибка БД');
        }
    });

    router.post('/trainer/threads/:threadId/messages', async (req, res) => {
        if (!requireDb(res)) return;
        try {
            const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
            if (!text) {
                jsonError(res, 400, 'Пустое сообщение');
                return;
            }
            const result = await db.trainerAppendExchange(req.params.threadId, text);
            const messages = await db.trainerListMessages(req.params.threadId);
            res.json({ ok: true, assistant: result.assistant, messages });
        } catch (e) {
            console.error(e);
            jsonError(res, 500, e instanceof Error ? e.message : 'Ошибка БД');
        }
    });

    app.use('/api', router);

    return router;
}

module.exports = { mountApi };
