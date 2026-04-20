import { z } from 'zod';

import { BadRequestException } from '@/domain/exceptions';
import { validate } from '@/presentation/middlewares/validate.middleware';

describe('validate middleware', () => {
  const schema = z.object({
    age: z.number(),
    name: z.string(),
  });

  it('should return parsed data if validation succeeds', () => {
    const data = { age: 25, name: 'Test' };
    const result = validate(schema, data);
    expect(result).toEqual(data);
  });

  it('should throw BadRequestException if validation fails', () => {
    const data = { age: 'invalid', name: 'Test' };
    expect(() => validate(schema, data)).toThrow(BadRequestException);
  });

  it('should format validation errors correctly', () => {
    const data = { age: 'invalid' };
    try {
      validate(schema, data);
    } catch (error: unknown) {
      const err = error as BadRequestException;
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toContain('name'); // Missing required field
    }
  });
});
