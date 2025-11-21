// email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'no-reply@danilets.com';

export async function sendOtpEmail({ to, code, purpose }) {
  const subject =
    purpose === 'reset'
      ? 'Password reset code'
      : 'Email verification code';

  const text =
    purpose === 'reset'
      ? `Your password reset code: ${code}. It is valid for 10 minutes.`
      : `Your verification code: ${code}. It is valid for 10 minutes.`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
  });
}
