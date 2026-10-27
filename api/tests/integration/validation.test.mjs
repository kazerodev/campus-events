import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp.mjs';

describe('validation messages', () => {
  it('gives a readable message for every missing field', async () => {
    const { app } = await createTestApp();

    const res = await request(app).post('/api/events').send({});

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.error.details, [
      { field: 'title', message: 'Enter a title' },
      { field: 'location', message: 'Enter a location' },
      { field: 'startsAt', message: 'Pick a date and time' },
      { field: 'capacity', message: 'Enter a number of seats' }
    ]);
  });

  it('treats a request without body like an empty body', async () => {
    const { app } = await createTestApp();

    const res = await request(app).post('/api/events');

    assert.equal(res.status, 400);
    assert.equal(res.body.error.details.length, 4);
  });
});
