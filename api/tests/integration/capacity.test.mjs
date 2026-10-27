import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createTestApp, validEvent } from '../helpers/testApp.mjs';

describe('capacity', () => {
  let app;
  let db;

  beforeEach(async () => {
    ({ app, db } = await createTestApp());
  });

  it('refuses a registration when every seat is taken', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 1 }));
    const url = `/api/events/${created.body.id}/registrations`;

    const first = await request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' });
    const second = await request(app).post(url).send({ name: 'Grace', email: 'grace@example.com' });

    assert.equal(first.status, 201);
    assert.equal(second.status, 409);
    assert.equal(second.body.error.message, 'Event is full');
  });

  it('gives the last seat to only one person when many register at the same time', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 1 }));
    const url = `/api/events/${created.body.id}/registrations`;

    const responses = await Promise.all(
      [1, 2, 3, 4, 5].map((i) => request(app).post(url).send({ name: `Person ${i}`, email: `p${i}@example.com` }))
    );

    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409, 409, 409, 409]);
    assert.equal(await db.Registration.count(), 1);
  });

  it('stores the same email only once when it is sent at the same time', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 5 }));
    const url = `/api/events/${created.body.id}/registrations`;

    const responses = await Promise.all(
      [1, 2, 3].map(() => request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' }))
    );

    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409, 409]);
    assert.equal(await db.Registration.count(), 1);
  });

  it('a refused registration does not block the next one', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 5 }));
    const url = `/api/events/${created.body.id}/registrations`;

    await request(app).post('/api/events/999/registrations').send({ name: 'Ada', email: 'ada@example.com' });
    const res = await request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' });

    assert.equal(res.status, 201);
  });
});
