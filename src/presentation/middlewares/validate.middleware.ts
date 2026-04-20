import { z, ZodObject } from 'zod';
import { $ZodType, $ZodTypeInternals } from 'zod/v4/core';

import { BadRequestException } from '@/domain/exceptions';
import { formatValidationError } from '@/infraestructure/utils';

export const validate = <
  T extends ZodObject<
    Record<string, $ZodType<unknown, unknown, $ZodTypeInternals>>
  >,
>(
  schema: T,
  data: Record<string, unknown>
): z.infer<T> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new BadRequestException(formatValidationError(result.error));
  }

  return result.data;
};
