import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('Email credentials not set. Emails will be logged to console instead.');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
      this.logger.log(`[BODY]: ${html}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Prompt Commerce Gateway" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
    }
  }

  async sendRegistrationReceived(email: string, storeName: string) {
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        <h2 style="color: #4f6ef7;">Application Received</h2>
        <p>Hello,</p>
        <p>Thank you for applying to join the <strong>Prompt Commerce</strong> network with your store, <strong>${storeName}</strong>.</p>
        <p>We have received your registration details and business permit. Our team will now review your application manually.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>We will verify your business details.</li>
          <li>Once approved, you will receive another email containing your <strong>Platform Key</strong>.</li>
          <li>You can then use that key to connect your MCP server to the gateway.</li>
        </ul>
        <p>Thank you for your patience.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;">
        <p style="font-size: 0.85rem; color: #777;">Prompt Commerce Gateway — The future of AI-driven retail.</p>
      </div>
    `;
    await this.sendMail(email, `Registration Received: ${storeName}`, html);
  }

  async sendPlatformKey(email: string, storeName: string, key: string) {
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        <h2 style="color: #3ecf8e;">Application Approved!</h2>
        <p>Hello,</p>
        <p>Great news! Your store, <strong>${storeName}</strong>, has been verified and approved for the Prompt Commerce network.</p>
        <p>Here is your unique <strong>Platform Key</strong>:</p>
        <div style="background: #f4f4f9; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 1.1rem; border: 1px solid #ddd; margin: 1.5rem 0; word-break: break-all;">
          ${key}
        </div>
        <p><strong>How to use this key:</strong></p>
        <ol>
          <li>Open your Store Admin Panel.</li>
          <li>Go to <strong>Settings &rarr; Gateway Connection</strong>.</li>
          <li>Paste the key above and click <strong>Save Key</strong>.</li>
        </ol>
        <p>Your store is now ready to be discovered by AI agents!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;">
        <p style="font-size: 0.85rem; color: #777;">Prompt Commerce Gateway — The future of AI-driven retail.</p>
      </div>
    `;
    await this.sendMail(email, `Your Platform Key for ${storeName}`, html);
  }
}
