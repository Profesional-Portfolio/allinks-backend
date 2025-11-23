export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}
