const { Router } = require('express');
const store = require('../store');

const router = Router();

function isValidStatus(status) {
  return status === undefined || store.VALID_STATUSES.includes(status);
}

router.get('/', (req, res) => {
  res.status(200).json(store.list());
});

router.post('/', (req, res) => {
  const { title, status } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!isValidStatus(status)) {
    return res.status(400).json({ error: `status must be one of ${store.VALID_STATUSES.join(', ')}` });
  }

  const task = store.create({ title, status });
  res.status(201).json(task);
});

router.get('/:id', (req, res) => {
  const task = store.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'task not found' });
  res.status(200).json(task);
});

router.put('/:id', (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'task not found' });

  const { title, status } = req.body || {};

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  if (!isValidStatus(status)) {
    return res.status(400).json({ error: `status must be one of ${store.VALID_STATUSES.join(', ')}` });
  }

  const changes = {};
  if (title !== undefined) changes.title = title;
  if (status !== undefined) changes.status = status;

  const updated = store.update(req.params.id, changes);
  res.status(200).json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'task not found' });

  store.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
