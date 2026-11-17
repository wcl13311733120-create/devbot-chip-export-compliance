const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const C = require('./lib/compliance');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'assessments.json');

app.use(express.json());
app.use(express.static(__dirname));

function load() { try { const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); return Array.isArray(d) ? d : []; } catch (e) { return []; } }
function save(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/policies', (req, res) => res.json(C.searchPolicies(req.query.q || '')));
app.get('/api/chips', (req, res) => res.json(C.searchChips(req.query.q || '')));
app.get('/api/nodes', (req, res) => res.json(C.NODES));
app.get('/api/top-policies', (req, res) => res.json(C.topPolicies(parseInt(req.query.n) || 5)));
app.get('/api/assess', (req, res) => {
  const r = C.assessChip(req.query.chip, req.query.dest, req.query.use || '');
  if (!r) return res.status(404).json({ error: '芯片不存在' });
  res.json(r);
});
app.get('/api/assess/supply', (req, res) => {
  const ids = (req.query.nodes || '').split(',').filter(Boolean);
  res.json(C.assessSupplyChain(ids));
});
app.get('/api/report', (req, res) => {
  const r = C.buildReport(req.query.chip, req.query.dest, req.query.use || '');
  if (!r) return res.status(404).json({ error: '无法生成' });
  res.json({ report: r });
});
app.post('/api/track', (req, res) => {
  const { chipId = '', dest = '', useCase = '', note = '' } = req.body || {};
  const a = C.assessChip(chipId, dest, useCase);
  if (!a) return res.status(400).json({ error: '芯片不存在' });
  const rec = { id: crypto.randomUUID(), ts: new Date().toISOString(), chipId, chipName: a.chip.name, dest, useCase, note, snapshot: { score: a.score, level: a.level, compliance: a.compliance } };
  const all = load(); all.unshift(rec); save(all.slice(0, 200));
  res.json(rec);
});
app.get('/api/tracking', (req, res) => res.json(load()));

app.listen(PORT, () => console.log(`Chip Export Compliance running on http://localhost:${PORT}`));
