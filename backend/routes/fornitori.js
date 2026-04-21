const router = require("express").Router();
const m = require("../models/fornitori");

router.get("/",       async (req, res) => { try { res.json(await m.getAll()); } catch(e) { res.status(500).json({ error: e.message }); } });
router.post("/",      async (req, res) => { try { await m.create(req.body); res.status(201).json({ ok: true }); } catch(e) { res.status(500).json({ error: e.message }); } });
router.put("/:id",    async (req, res) => { try { await m.update(req.params.id, req.body); res.json({ ok: true }); } catch(e) { res.status(500).json({ error: e.message }); } });
router.delete("/:id", async (req, res) => { try { await m.remove(req.params.id); res.json({ ok: true }); } catch(e) { res.status(500).json({ error: e.message }); } });

module.exports = router;