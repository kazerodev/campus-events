import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createTestApp, validEvent } from '../helpers/testApp.mjs';

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

  it('refuses a start date that is not a date string', async () => {
    const { app } = await createTestApp();

    for (const startsAt of [null, true, 0, 12345]) {
      const res = await request(app).post('/api/events').send(validEvent({ startsAt }));
      assert.equal(res.status, 400, `startsAt ${startsAt} was accepted`);
      assert.deepEqual(res.body.error.details, [{ field: 'startsAt', message: 'Pick a date and time' }]);
    }
  });

  it('returns 413 JSON when the body is too large', async () => {
    const { app } = await createTestApp();

    const res = await request(app).post('/api/events').send(validEvent({ title: 'x'.repeat(200000) }));

    assert.equal(res.status, 413);
    assert.equal(res.body.error.code, 'PAYLOAD_TOO_LARGE');
  });
});
