const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (to, otp) => {
  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Verify your account',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #128c7e;">Verify your account</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 8px; color: #128c7e;">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't register, ignore this email.</p>
      </div>
    `,
    sender: { name: 'Chat App', email: process.env.EMAIL },
    to: [{ email: to }],
  });
};

module.exports = sendEmail;