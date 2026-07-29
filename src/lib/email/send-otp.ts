import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.proservice.ge",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_PORT) === "465",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }
  return transporter;
}

export interface SendOtpResult {
  success: boolean;
  error?: string;
}

export async function sendOtpEmail(
  email: string,
  otpCode: string
): Promise<SendOtpResult> {
  try {
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      console.warn("[email] SMTP not configured — OTP would be sent to", email, "code:", otpCode);
      // In development without SMTP, log and return success for testing
      if (process.env.NODE_ENV !== "production") {
        console.log("[email] DEV MODE: OTP for", email, "is", otpCode);
        return { success: true };
      }
      return { success: false, error: "SMTP not configured" };
    }

    const t = getTransporter();

    // Determine sender name from SMTP user or use default
    const fromName = "BTA LAB";
    const fromAddress = process.env.SMTP_FROM || smtpUser;

    const info = await t.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: email,
      subject: "თქვენი დამადასტურებელი კოდი | BTA LAB",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 24px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; }
            .body { padding: 32px 24px; }
            .otp-code { text-align: center; margin: 24px 0; }
            .otp-code span { display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; background: #f0f0f5; padding: 12px 24px; border-radius: 12px; font-family: 'Courier New', monospace; }
            .info { font-size: 14px; color: #666; line-height: 1.6; text-align: center; }
            .warning { margin-top: 20px; padding: 12px 16px; background: #fff8e1; border-radius: 8px; font-size: 13px; color: #8d6e00; text-align: center; border: 1px solid #ffe082; }
            .footer { padding: 16px 24px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BTA LAB — წვდომის კოდი</h1>
            </div>
            <div class="body">
              <p class="info">თქვენი განაცხადის დასადასტურებლად, გთხოვთ გამოიყენოთ შემდეგი კოდი:</p>
              <div class="otp-code">
                <span>${otpCode}</span>
              </div>
              <p class="info">კოდი მოქმედებს 10 წუთის განმავლობაში.</p>
              <div class="warning">
                ⚠️ თუ არ მოგივიდათ კოდი, გთხოვთ შეამოწმოთ სპამის (Spam) საქაღალდე.
              </div>
            </div>
            <div class="footer">
              BTA LAB — ბიზნესისა და ტექნოლოგიების აკადემია
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.info("[email] OTP sent to", email, "messageId:", info.messageId);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[email] Failed to send OTP to", email, errorMessage);
    return { success: false, error: errorMessage };
  }
}
