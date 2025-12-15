import { EmailService } from '@/domain/interfaces';

export const mockEmailService: jest.Mocked<EmailService> = {
  sendEmail: jest.fn(),
};
