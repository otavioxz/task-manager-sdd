const { randomUUID } = require('crypto');

const VALID_STATUSES = ['pending', 'in_progress', 'done'];

const tasks = new Map();

function list() {
  return Array.from(tasks.values());
}

function get(id) {
  return tasks.get(id);
}

function create({ title, status }) {
  const task = {
    id: randomUUID(),
    title,
    status: status || 'pending',
    createdAt: new Date().toISOString(),
  };
  tasks.set(task.id, task);
  return task;
}

function update(id, changes) {
  const existing = tasks.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...changes };
  tasks.set(id, updated);
  return updated;
}

function remove(id) {
  return tasks.delete(id);
}

module.exports = { VALID_STATUSES, list, get, create, update, remove };
