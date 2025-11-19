import { z } from 'zod';
import { Platforms } from '@/domain/enums';

export const createLinkDto = z.object({
  platform: z.enum(Platforms),
  url: z.url(),
  title: z.string().max(200),
  user_id: z.string(),
  is_active: z.boolean().default(true),
});

export type CreateLinkDto = z.infer<typeof createLinkDto>;
