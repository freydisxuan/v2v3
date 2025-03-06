import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';

const CategorySchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(3, 'title must be at least three letters')
    .max(1024, 'title must be at most 1024 letters'),
  slug: z.string(),
});

const CategoryToCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'title must be at least three letters')
    .max(1024, 'title must be at most 1024 letters'),
});

type Category = z.infer<typeof CategorySchema>;
type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;

export function validateCategory(category: unknown): z.SafeParseReturnType< CategoryToCreate, CategoryToCreate > {
  return CategoryToCreateSchema.safeParse(category);
}

const prisma = new PrismaClient();

export async function getCategories(): Promise<Array<Category>> {
  const categories = await prisma.categories.findMany();
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const cat = await prisma.categories.findUnique({
    where: {
      slug: slug
    }
  });

  return cat ?? null;
}

export async function createCategory(categoryToCreate: CategoryToCreate): Promise<Category | null> {
  let createdCategory;
  try {
    createdCategory = await prisma.categories.create({
      data: {
        title: xss(categoryToCreate.title),
        slug: xss(categoryToCreate.title).toLowerCase().replaceAll(' ', '-'),
      },
    });
  } catch {
    return null;
  }

  return createdCategory;
}

export async function updateCategory(categoryToCreate: CategoryToCreate, slug: string): Promise<Category | null> {
  const category = await getCategory(slug);
  if (!category) return null;
  const updatedCategory = await prisma.categories.update({
    where: {
      slug,
    },
    data: {
      title: xss(categoryToCreate.title),
      slug: xss(categoryToCreate.title).toLowerCase().replaceAll(' ', '-')
    }
  })

  return updatedCategory;
}

export async function deleteCategory(slug: string): Promise<Category | null> {
  const result = await prisma.categories.delete({
    where: {
      slug,
    }
  })

  return result ?? null;
}
