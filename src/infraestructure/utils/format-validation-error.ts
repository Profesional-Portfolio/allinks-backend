import { type ZodError } from 'zod';

export const formatValidationError = (errors: ZodError) => {
  if (!errors || !errors.issues) return 'Validation failed';

  if (Array.isArray(errors.issues))
    return errors.issues
      .map(issue => `${issue.path}: ${issue.message}`)
      .join(', ');

  return JSON.stringify(errors);
};
