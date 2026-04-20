import nodemailer, { Transporter } from 'nodemailer';

import type { EmailService, SendEmailOptions } from '@/domain/interfaces/';

import { ENV } from '@/config/env';
export class NodemailerEmailAdapter implements EmailService {
  private readonly fromEmail: string;
  private readonly fromName: string;
  private transporter: Transporter;

  constructor() {
    this.fromEmail = ENV.SMTP_FROM_EMAIL || 'noreply@allinks.com';
    this.fromName = ENV.SMTP_FROM_NAME || 'Allinks';

    this.transporter = nodemailer.createTransport({
      auth: {
        pass: ENV.SMTP_PASSWORD,
        user: ENV.SMTP_USER,
      },
      host: ENV.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(ENV.SMTP_PORT, 10),
      secure: ENV.SMTP_SECURE === 'true', // true for 465, false for other ports
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        html: options.html,
        subject: options.subject,
        text: options.text,
        to: options.to,
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
  emailAdapterInstance ??= new NodemailerEmailAdapter();
  return emailAdapterInstance;
};
