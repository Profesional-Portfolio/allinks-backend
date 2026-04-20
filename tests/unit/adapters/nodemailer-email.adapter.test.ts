import nodemailer, { Transporter } from 'nodemailer';

import type { SendEmailOptions } from '@/domain/interfaces/';

import { ENV } from '@/config/env';

import { NodemailerEmailAdapter } from '../../../src/infraestructure/adapters/nodemailer-email.adapter';

jest.mock('nodemailer');
jest.mock('@/config/env', () => ({
  ENV: {
    SMTP_FROM_EMAIL: 'noreply@allinks.com',
    SMTP_FROM_NAME: 'Allinks',
    SMTP_HOST: 'smtp.test.com',
    SMTP_PASSWORD: 'testpassword',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'test@example.com',
  },
}));

describe('NodemailerEmailAdapter', () => {
  let emailAdapter: NodemailerEmailAdapter;
  let mockTransporter: jest.Mocked<Transporter>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<Transporter>;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    emailAdapter = new NodemailerEmailAdapter();
  });

  describe('constructor', () => {
    it('should create transporter with correct configuration', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        auth: {
          pass: ENV.SMTP_PASSWORD,
          user: ENV.SMTP_USER,
        },
        host: ENV.SMTP_HOST,
        port: parseInt(ENV.SMTP_PORT, 10),
        secure: false,
      });
    });

    it('should use default values when environment variables are not set', () => {
      // Temporarily change ENV for this test
      const originalHost = ENV.SMTP_HOST;
      (ENV as any).SMTP_HOST = undefined;

      jest.clearAllMocks();
      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.gmail.com',
        })
      );

      (ENV as any).SMTP_HOST = originalHost;
    });

    it('should set secure to true when SMTP_SECURE is "true"', () => {
      const originalSecure = ENV.SMTP_SECURE;
      (ENV as any).SMTP_SECURE = 'true';

      jest.clearAllMocks();
      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
        })
      );

      (ENV as any).SMTP_SECURE = originalSecure;
    });

    it('should parse SMTP_PORT correctly', () => {
      const originalPort = ENV.SMTP_PORT;
      (ENV as any).SMTP_PORT = '465';

      jest.clearAllMocks();
      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 465,
        })
      );

      (ENV as any).SMTP_PORT = originalPort;
    });
  });

  describe('sendEmail', () => {
    const mockEmailOptions: SendEmailOptions = {
      html: '<h1>Test Email</h1>',
      subject: 'Test Subject',
      text: 'Test Email',
      to: 'recipient@example.com',
    };

    it('should send email successfully and return true', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(mockEmailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: `"${ENV.SMTP_FROM_NAME}" <${ENV.SMTP_FROM_EMAIL}>`,
        html: mockEmailOptions.html,
        subject: mockEmailOptions.subject,
        text: mockEmailOptions.text,
        to: mockEmailOptions.to,
      });
      expect(result).toBe(true);
    });

    it('should send email without text field', async () => {
      const emailOptionsWithoutText: SendEmailOptions = {
        html: '<h1>Test Email</h1>',
        subject: 'Test Subject',
        to: 'recipient@example.com',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(emailOptionsWithoutText);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: `"${ENV.SMTP_FROM_NAME}" <${ENV.SMTP_FROM_EMAIL}>`,
        html: emailOptionsWithoutText.html,
        subject: emailOptionsWithoutText.subject,
        text: undefined,
        to: emailOptionsWithoutText.to,
      });
      expect(result).toBe(true);
    });

    it('should return false when sending email fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* empty */
        });

      mockTransporter.sendMail.mockRejectedValue(
        new Error('SMTP connection failed')
      );

      const result = await emailAdapter.sendEmail(mockEmailOptions);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error sending email:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle multiple recipients', async () => {
      const multipleRecipientsOptions: SendEmailOptions = {
        html: '<h1>Test Email</h1>',
        subject: 'Test Subject',
        to: 'user1@example.com, user2@example.com',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(multipleRecipientsOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: multipleRecipientsOptions.to,
        })
      );
      expect(result).toBe(true);
    });

    it('should handle special characters in subject', async () => {
      const specialSubjectOptions: SendEmailOptions = {
        html: '<h1>Test Email</h1>',
        subject: 'Test Subject with émojis 🎉 and spëcial chars',
        to: 'recipient@example.com',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(specialSubjectOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: specialSubjectOptions.subject,
        })
      );
      expect(result).toBe(true);
    });

    it('should handle complex HTML content', async () => {
      const complexHtmlOptions: SendEmailOptions = {
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .button { background-color: #4CAF50; color: white; }
              </style>
            </head>
            <body>
              <h1>Welcome!</h1>
              <p>Click the button below:</p>
              <a href="https://example.com" class="button">Click Me</a>
            </body>
          </html>
        `,
        subject: 'Test Subject',
        to: 'recipient@example.com',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(complexHtmlOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: complexHtmlOptions.html,
        })
      );
      expect(result).toBe(true);
    });

    it('should log error details when email sending fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* empty */
        });

      const testError = new Error('Network timeout');
      mockTransporter.sendMail.mockRejectedValue(testError);

      await emailAdapter.sendEmail(mockEmailOptions);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error sending email:',
        testError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully and return true', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {
          /* empty */
        });

      mockTransporter.verify.mockResolvedValue(true);

      const result = await emailAdapter.verifyConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ SMTP connection verified');

      consoleLogSpy.mockRestore();
    });

    it('should return false when connection verification fails', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {
          /* empty */
        });
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* empty */
        });

      mockTransporter.verify.mockRejectedValue(new Error('Connection refused'));

      const result = await emailAdapter.verifyConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ SMTP connection failed:',
        expect.any(Error)
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log error details when verification fails', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {
          /* empty */
        });
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* empty */
        });

      const testError = new Error('Authentication failed');
      mockTransporter.verify.mockRejectedValue(testError);

      await emailAdapter.verifyConnection();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ SMTP connection failed:',
        testError
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle network timeout errors', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {
          /* empty */
        });
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* empty */
        });

      const timeoutError = new Error('ETIMEDOUT');
      mockTransporter.verify.mockRejectedValue(timeoutError);

      const result = await emailAdapter.verifyConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ SMTP connection failed:',
        timeoutError
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
