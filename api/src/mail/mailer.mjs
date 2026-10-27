import nodemailer from 'nodemailer';
import { sendConfirmation } from '../../lab/mail.mjs';

export function createMailer({ smtpUrl, from }) {
  if (!smtpUrl) {
    return {
      async sendRegistrationConfirmation({ email, event }) {
        await sendConfirmation(email, event.title);
      }
    };
  }

  const transporter = nodemailer.createTransport(smtpUrl);

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
