import nodemailer from 'nodemailer';
import { sendConfirmation } from '../../lab/mail.mjs';
import { logger } from '../utils/logger.mjs';

function createLabMailer() {
  return {
    async sendRegistrationConfirmation({ email, event }) {
      await sendConfirmation(email, event.title);
    }
  };
}

function createTransporter(smtpUrl) {
  try {
    return nodemailer.createTransport(smtpUrl);
  } catch (err) {
    // A wrong SMTP_URL must not stop the whole API, registrations still have to work.
    logger.warn('invalid SMTP_URL, using the lab mailer', { error: err.message });
    return null;
  }
}

export function createMailer({ smtpUrl, from }) {
  const transporter = smtpUrl ? createTransporter(smtpUrl) : null;
  if (!transporter) return createLabMailer();

  return {
    async sendRegistrationConfirmation({ email, name, event }) {
      await transporter.sendMail({
        from,
        to: email,
        subject: `You are registered for ${event.title}`,
        text: `Hi ${name}, you are registered for ${event.title} in ${event.location}. See you there!`
      });
    }
  };
}
