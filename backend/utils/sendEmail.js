const nodemailer = require('nodemailer');

const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Chat App" <${process.env.EMAIL}>`,
    to,
    subject: 'Verify your account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #128c7e;">Verify your account</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 8px; color: #128c7e;">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't register, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendEmail;