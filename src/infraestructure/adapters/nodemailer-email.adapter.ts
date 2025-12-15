import nodemailer, { Transporter } from 'nodemailer';
import type { EmailService, SendEmailOptions } from '@/domain/interfaces/';
import { ENV } from '@/config/env';
export class NodemailerEmailAdapter implements EmailService {
  private transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = ENV.SMTP_FROM_EMAIL || 'noreply@allinks.com';
    this.fromName = ENV.SMTP_FROM_NAME || 'Allinks';

    this.transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(ENV.SMTP_PORT, 10),
      secure: ENV.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

let emailAdapterInstance: NodemailerEmailAdapter | null = null;

export const getEmailAdapter = (): NodemailerEmailAdapter => {
  if (!emailAdapterInstance) {
    emailAdapterInstance = new NodemailerEmailAdapter();
  }
  return emailAdapterInstance;
};
