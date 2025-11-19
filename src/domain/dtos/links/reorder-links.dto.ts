import { z } from 'zod';
import { idDto, userIdDto } from '../shared';

export const reorderLinksDto = z
  .object({
    links: z.array(idDto.extend({ order: z.number() })),
  })
  .extend(userIdDto.shape);

export type ReorderLinksDto = z.infer<typeof reorderLinksDto>;
