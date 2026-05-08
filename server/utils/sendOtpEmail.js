const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOtpEmail = async (toEmail, toName, otp) => {
    await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: 'Your verification OTP',
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#4f46e5;margin-bottom:8px">Verify your email</h2>
        <p style="color:#374151">Hi ${toName}, use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#111827;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
    });
};

module.exports = sendOtpEmail;
