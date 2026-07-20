import nodemailer from "nodemailer";

let transporter = null;
let transporterAttempted = false;

const getTransporter = () => {
  if (transporterAttempted) return transporter;
  transporterAttempted = true;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(
      " Email not configured. Set EMAIL_USER and EMAIL_PASS in .env to send emails. Password reset links will be logged to console only."
    );
    return null;
  }
  const isGmail = user.toLowerCase().endsWith("@gmail.com");

  if (!process.env.SMTP_HOST && !isGmail) {
    console.warn(
      "Unknown email provider. Set SMTP_HOST in .env or use a Gmail address."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.log("============================================");
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`HTML:\n${html}`);
    console.log("============================================");
    return { message: "Email logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"LinkIn" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};

// Build HTML email template with OTP code for password reset
export const buildOtpEmail = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 480px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #AFF33E 0%, #7dd56c 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #1a1a1a;
          font-size: 24px;
          font-weight: 700;
        }
        .body {
          padding: 32px 24px;
        }
        .body p {
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .otp-box {
          text-align: center;
          margin: 24px 0;
        }
        .otp-code {
          display: inline-block;
          background: #f3f4f6;
          border: 2px dashed #AFF33E;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 16px;
          font-size: 13px;
          color: #92400e;
          text-align: center;
        }
        .footer {
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LinkIn</h1>
        </div>
        <div class="body">
          <p>Hi ${userName || "there"},</p>
          <p>We received a request to reset your password for your LinkIn account. Use the OTP code below to set a new password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="expiry">
            ⏰ This OTP expires in <strong>10 minutes</strong>. If you didn't request a reset, you can safely ignore this email.
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
            Never share this OTP with anyone. The LinkIn team will never ask for your password or OTP.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LinkIn. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Build HTML email template for password reset (legacy)
export const buildResetEmail = (resetUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 480px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #AFF33E 0%, #7dd56c 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #1a1a1a;
          font-size: 24px;
          font-weight: 700;
        }
        .body {
          padding: 32px 24px;
        }
        .body p {
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #AFF33E 0%, #7dd56c 100%);
          color: #1a1a1a !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0;
        }
        .button-container {
          text-align: center;
        }
        .footer {
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        }
        .expiry {
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 16px;
          font-size: 13px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔗 LinkIn</h1>
        </div>
        <div class="body">
          <p>Hi ${userName || "there"},</p>
          <p>We received a request to reset your password for your LinkIn account. Click the button below to set a new password:</p>
          <div class="button-container">
            <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
          </div>
          <div class="expiry">
            ⏰ This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email.
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <span style="color: #3b82f6; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LinkIn. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
