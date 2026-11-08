import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMailer } from '../../src/mail/mailer.mjs';

describe('mailer', () => {
  it('does not crash the app when SMTP_URL is invalid', () => {
    const mailer = createMailer({ smtpUrl: 'not a url', from: 'test@example.com' });

    assert.equal(typeof mailer.sendRegistrationConfirmation, 'function');
  });
});
