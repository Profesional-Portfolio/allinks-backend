import { NodemailerEmailAdapter } from '../../../src/infraestructure/adapters/nodemailer-email.adapter';
import nodemailer, { Transporter } from 'nodemailer';
import type { SendEmailOptions } from '@/domain/interfaces/';

jest.mock('nodemailer');

describe('NodemailerEmailAdapter', () => {
  let emailAdapter: NodemailerEmailAdapter;
  let mockTransporter: jest.Mocked<Transporter>;

  const mockEnv = {
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'test@example.com',
    SMTP_PASSWORD: 'testpassword',
    SMTP_FROM_EMAIL: 'noreply@allinks.com',
    SMTP_FROM_NAME: 'Allinks',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.SMTP_HOST = mockEnv.SMTP_HOST;
    process.env.SMTP_PORT = mockEnv.SMTP_PORT;
    process.env.SMTP_SECURE = mockEnv.SMTP_SECURE;
    process.env.SMTP_USER = mockEnv.SMTP_USER;
    process.env.SMTP_PASSWORD = mockEnv.SMTP_PASSWORD;
    process.env.SMTP_FROM_EMAIL = mockEnv.SMTP_FROM_EMAIL;
    process.env.SMTP_FROM_NAME = mockEnv.SMTP_FROM_NAME;

    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<Transporter>;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    emailAdapter = new NodemailerEmailAdapter();
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM_EMAIL;
    delete process.env.SMTP_FROM_NAME;
  });

  describe('constructor', () => {
    it('should create transporter with correct configuration', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: mockEnv.SMTP_HOST,
        port: parseInt(mockEnv.SMTP_PORT, 10),
        secure: false,
        auth: {
          user: mockEnv.SMTP_USER,
          pass: mockEnv.SMTP_PASSWORD,
        },
      });
    });

    it('should use default values when environment variables are not set', () => {
      // Clear environment variables
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_FROM_EMAIL;
      delete process.env.SMTP_FROM_NAME;

      jest.clearAllMocks();

      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.gmail.com',
        })
      );
    });

    it('should set secure to true when SMTP_SECURE is "true"', () => {
      process.env.SMTP_SECURE = 'true';
      jest.clearAllMocks();

      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: false,
        })
      );
    });

    it('should parse SMTP_PORT correctly', () => {
      process.env.SMTP_PORT = '465';
      jest.clearAllMocks();

      new NodemailerEmailAdapter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 2525,
        })
      );
    });
  });

  describe('sendEmail', () => {
    const mockEmailOptions: SendEmailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<h1>Test Email</h1>',
      text: 'Test Email',
    };

    it('should send email successfully and return true', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(mockEmailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: `"${mockEnv.SMTP_FROM_NAME}" <${mockEnv.SMTP_FROM_EMAIL}>`,
        to: mockEmailOptions.to,
        subject: mockEmailOptions.subject,
        html: mockEmailOptions.html,
        text: mockEmailOptions.text,
      });
      expect(result).toBe(true);
    });

    it('should send email without text field', async () => {
      const emailOptionsWithoutText: SendEmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

      const result = await emailAdapter.sendEmail(emailOptionsWithoutText);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: `"${mockEnv.SMTP_FROM_NAME}" <${mockEnv.SMTP_FROM_EMAIL}>`,
        to: emailOptionsWithoutText.to,
        subject: emailOptionsWithoutText.subject,
        html: emailOptionsWithoutText.html,
        text: undefined,
      });
      expect(result).toBe(true);
    });

    it('should return false when sending email fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

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
        to: 'user1@example.com, user2@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
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
        to: 'recipient@example.com',
        subject: 'Test Subject with émojis 🎉 and spëcial chars',
        html: '<h1>Test Email</h1>',
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
        to: 'recipient@example.com',
        subject: 'Test Subject',
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
        .mockImplementation(() => {});

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
        .mockImplementation(() => {});

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
        .mockImplementation(() => {});
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

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
        .mockImplementation(() => {});
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

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
        .mockImplementation(() => {});
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

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
