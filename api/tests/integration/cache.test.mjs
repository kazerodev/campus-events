import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createTestApp, validEvent } from '../helpers/testApp.mjs';

describe('caching of GET endpoints', () => {
  let app;
  let db;

  beforeEach(async () => {
    ({ app, db } = await createTestApp());
  });

  it('serves a repeated GET from the cache instead of the database', async () => {
    await request(app).post('/api/events').send(validEvent({ title: 'Cached' }));
    await request(app).get('/api/events');

    await db.Event.update({ title: 'Changed behind the API' }, { where: {} });
    const res = await request(app).get('/api/events');

    assert.deepEqual(res.body.map((e) => e.title), ['Cached']);
  });

  it('GET /events shows a new event right after POST', async () => {
    await request(app).get('/api/events');

    await request(app).post('/api/events').send(validEvent({ title: 'New one' }));
    const res = await request(app).get('/api/events');

    assert.deepEqual(res.body.map((e) => e.title), ['New one']);
  });

  it('GET /events/:id shows the update right after PATCH', async () => {
    const created = await request(app).post('/api/events').send(validEvent());
    await request(app).get(`/api/events/${created.body.id}`);

    await request(app).patch(`/api/events/${created.body.id}`).send({ title: 'Renamed' });
    const res = await request(app).get(`/api/events/${created.body.id}`);

    assert.equal(res.body.title, 'Renamed');
  });

  it('GET /events/:id returns 404 right after DELETE', async () => {
    const created = await request(app).post('/api/events').send(validEvent());
    await request(app).get(`/api/events/${created.body.id}`);
    await request(app).get('/api/events');

    await request(app).delete(`/api/events/${created.body.id}`);
    const one = await request(app).get(`/api/events/${created.body.id}`);
    const list = await request(app).get('/api/events');

    assert.equal(one.status, 404);
    assert.equal(list.body.length, 0);
  });

  it('spotsLeft, registrations and stats are updated right after a registration', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ title: 'Seats', capacity: 2 }));
    const id = created.body.id;
    await request(app).get(`/api/events/${id}`);
    await request(app).get(`/api/events/${id}/registrations`);
    await request(app).get('/api/stats');

    await request(app).post(`/api/events/${id}/registrations`).send({ name: 'Ada', email: 'ada@example.com' });
    const event = await request(app).get(`/api/events/${id}`);
    const registrations = await request(app).get(`/api/events/${id}/registrations`);
    const stats = await request(app).get('/api/stats');

    assert.equal(event.body.spotsLeft, 1);
    assert.equal(registrations.body.length, 1);
    assert.equal(stats.body[0].registered, 1);
    assert.equal(stats.body[0].occupancy, '50%');
  });

  it('does not cache a 404, so an event created later is found', async () => {
    const missing = await request(app).get('/api/events/1');

    await request(app).post('/api/events').send(validEvent({ title: 'First' }));
    const found = await request(app).get('/api/events/1');

    assert.equal(missing.status, 404);
    assert.equal(found.status, 200);
  });
});
