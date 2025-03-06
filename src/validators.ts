import { z } from 'zod';

const SlugSchema = z.string().min(1, "slug must not be empty").max(1024, "slug cant be more than 1024 characters");

type Slug = z.infer<typeof SlugSchema>;

export function validateSlug(slug: unknown): z.SafeParseReturnType<Slug, Slug> {
  return SlugSchema.safeParse(slug);
}