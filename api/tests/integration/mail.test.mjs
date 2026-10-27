import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createTestApp, validEvent } from '../helpers/testApp.mjs';

const waitForBackgroundWork = () => new Promise((resolve) => setTimeout(resolve, 20));

async function registerAda(app) {
  const created = await request(app).post('/api/events').send(validEvent({ title: 'Mail Workshop', capacity: 5 }));
  const url = `/api/events/${created.body.id}/registrations`;
  const res = await request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' });
  return { res, url, eventId: created.body.id };
}

describe('confirmation mail', () => {
  it('sends a confirmation mail after a registration', async () => {
    const sent = [];
    const mailer = { async sendRegistrationConfirmation(mail) { sent.push(mail); } };
    const { app } = await createTestApp({ mailer });

    const { res } = await registerAda(app);
    await waitForBackgroundWork();

    assert.equal(res.status, 201);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].email, 'ada@example.com');
    assert.equal(sent[0].event.title, 'Mail Workshop');
  });

  it('still stores the registration when the mail server is offline', async () => {
    const mailer = { async sendRegistrationConfirmation() { throw new Error('connect ECONNREFUSED'); } };
    const { app } = await createTestApp({ mailer });

    const { res, url, eventId } = await registerAda(app);
    await waitForBackgroundWork();
    const list = await request(app).get(url);
    const event = await request(app).get(`/api/events/${eventId}`);

    assert.equal(res.status, 201);
    assert.deepEqual(list.body.map((r) => r.email), ['ada@example.com']);
    assert.equal(event.body.spotsLeft, 4);
  });

  it('does not wait for a slow mail server before answering', async () => {
    const mailer = { sendRegistrationConfirmation: () => new Promise((resolve) => setTimeout(resolve, 2000).unref()) };
    const { app } = await createTestApp({ mailer });

    const start = Date.now();
    const { res } = await registerAda(app);

    assert.equal(res.status, 201);
    assert.ok(Date.now() - start < 1000, 'the response waited for the mail');
  });

  it('does not send a mail when the registration is refused', async () => {
    const sent = [];
    const mailer = { async sendRegistrationConfirmation(mail) { sent.push(mail); } };
    const { app } = await createTestApp({ mailer });

    const { url } = await registerAda(app);
    const again = await request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' });
    await waitForBackgroundWork();

    assert.equal(again.status, 409);
    assert.equal(sent.length, 1);
  });
});
