const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendOtpEmail = async (toEmail, toName, otp) => {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
        name: process.env.SMTP_FROM_NAME || 'Your App',
        email: process.env.SMTP_FROM_EMAIL,
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.subject = 'Your verification OTP';
    sendSmtpEmail.htmlContent = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#4f46e5;margin-bottom:8px">Verify your email</h2>
        <p style="color:#374151">Hi ${toName}, use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#111827;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = sendOtpEmail;
