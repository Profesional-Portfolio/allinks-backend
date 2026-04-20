import { z } from 'zod';

import { idDto, userIdDto } from '../shared';
import { createLinkDto } from './create-link.dto';

export const updateLinkDto = z
  .object({
    is_active: createLinkDto.shape.is_active.optional(),
    platform: createLinkDto.shape.platform.optional(),
    title: createLinkDto.shape.title.optional(),
    url: createLinkDto.shape.url.optional(),
  })
  .extend(idDto.shape)
  .extend(userIdDto.shape);

export type UpdateLinkDto = z.infer<typeof updateLinkDto>;
