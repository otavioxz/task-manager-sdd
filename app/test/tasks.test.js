const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('criterio 1: sempre responde 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /tasks', () => {
  it('criterio 2: cria uma tarefa valida e ela aparece em GET /tasks', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudar SDD' });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe('Estudar SDD');
    expect(created.body.status).toBe('pending');
    expect(created.body.id).toBeDefined();

    const list = await request(app).get('/tasks');
    expect(list.status).toBe(200);
    expect(list.body.some((t) => t.id === created.body.id)).toBe(true);
  });

  it('criterio 3: sem title retorna 400 e nao persiste', async () => {
    const before = await request(app).get('/tasks');

    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);

    const after = await request(app).get('/tasks');
    expect(after.body.length).toBe(before.body.length);
  });

  it('criterio 4: status invalido retorna 400', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', status: 'invalido' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks/:id', () => {
  it('criterio 5: id inexistente retorna 404', async () => {
    const res = await request(app).get('/tasks/nao-existe');
    expect(res.status).toBe(404);
  });
});

describe('PUT /tasks/:id', () => {
  it('criterio 6: atualiza e reflete no GET /tasks/:id', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Original' });
    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ title: 'Atualizado', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Atualizado');
    expect(res.body.status).toBe('done');

    const fetched = await request(app).get(`/tasks/${created.body.id}`);
    expect(fetched.body.title).toBe('Atualizado');
    expect(fetched.body.status).toBe('done');
  });

  it('criterio 7: id inexistente retorna 404', async () => {
    const res = await request(app).put('/tasks/nao-existe').send({ title: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('criterio 8: deleta e passa a retornar 404 no GET', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Para deletar' });

    const del = await request(app).delete(`/tasks/${created.body.id}`);
    expect(del.status).toBe(204);

    const fetched = await request(app).get(`/tasks/${created.body.id}`);
    expect(fetched.status).toBe(404);
  });

  it('criterio 9: id inexistente retorna 404', async () => {
    const res = await request(app).delete('/tasks/nao-existe');
    expect(res.status).toBe(404);
  });
});
