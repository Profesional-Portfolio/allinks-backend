import { z } from 'zod';
import { createLinkDto } from './create-link.dto';
import { idDto, userIdDto } from '../shared';

export const updateLinkDto = z
  .object({
    platform: createLinkDto.shape.platform.optional(),
    url: createLinkDto.shape.url.optional(),
    title: createLinkDto.shape.title.optional(),
    is_active: createLinkDto.shape.is_active.optional(),
  })
  .extend(idDto.shape)
  .extend(userIdDto.shape);

export type UpdateLinkDto = z.infer<typeof updateLinkDto>;
