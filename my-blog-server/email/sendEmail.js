import nodemailer from "nodemailer";

const buildHtml = (otp) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 15px; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1a73e8; margin: 0;">RH-Paradox</h1>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <h2 style="font-size: 22px; font-weight: 600; text-align: center;">Verify Your Email Address</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">To finish setting up your account, please enter the following code in your browser:</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <div style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a73e8; padding: 15px 30px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
        ${otp}
      </div>
    </div>

    <p style="font-size: 14px; color: #777; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
      <p>Sent by RH-Paradox Inc, 123 Tech Street, Silicon Valley</p>
      <p>This is an automated security notification. Please do not reply.</p>
    </div>
  </div>
`;

const sendEmail = async (options) => {
  let transporter;
  let usingTestAccount = false;

  // Use Port 587 as default for production stability
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = Number(process.env.EMAIL_PORT) || 587;
  const emailSecure = emailPort === 465; // Only true if using 465

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ADD THESE TIMEOUTS TO PREVENT THE 2-MINUTE HANG
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } else {
    // FALLBACK TO TEST ACCOUNT (ETHEREAL)
    const testAccount = await nodemailer.createTestAccount();
    usingTestAccount = true;
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  // REMOVED: await transporter.verify()
  // (It's better to just try sending and catch the error)

  const mailOptions = {
    from: `"RH-Paradox Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject || "Verify your account",
    html: buildHtml(options.otp),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return {
      success: true,
      info,
      previewUrl: usingTestAccount ? previewUrl : null,
    };
  } catch (error) {
    console.error("Email delivery failed:", error);
    // Return success: false so the controller knows to handle it
    return { success: false, error };
  }
};

export default sendEmail;
