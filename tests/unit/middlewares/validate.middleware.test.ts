import { z } from 'zod';
import { validate } from '@/presentation/middlewares/validate.middleware';
import { BadRequestException } from '@/domain/exceptions';

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('should return parsed data if validation succeeds', () => {
    const data = { name: 'Test', age: 25 };
    const result = validate(schema, data);
    expect(result).toEqual(data);
  });

  it('should throw BadRequestException if validation fails', () => {
    const data = { name: 'Test', age: 'invalid' };
    expect(() => validate(schema, data as any)).toThrow(BadRequestException);
  });

  it('should format validation errors correctly', () => {
    const data = { age: 'invalid' };
    try {
      validate(schema, data as any);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain('name'); // Missing required field
    }
  });
});
