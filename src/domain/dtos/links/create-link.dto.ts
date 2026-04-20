import { z } from 'zod';

import { Platforms } from '@/domain/enums';

export const createLinkDto = z.object({
  is_active: z.boolean().default(true),
  platform: z.enum(Platforms),
  title: z.string().max(200),
  url: z.url(),
  user_id: z.string(),
});

export type CreateLinkDto = z.infer<typeof createLinkDto>;
