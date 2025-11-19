import { z, ZodObject } from 'zod';
import { BadRequestException } from '@/domain/exceptions';
import { formatValidationError } from '@/infraestructure/utils';

export const validate = <T extends ZodObject<any>>(
  schema: T,
  data: Record<string, any>
): z.infer<T> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new BadRequestException(formatValidationError(result.error));
  }

  return result.data;
};
