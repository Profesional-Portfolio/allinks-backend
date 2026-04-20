export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}

export interface SendEmailOptions {
  html: string;
  subject: string;
  text?: string;
  to: string;
}
