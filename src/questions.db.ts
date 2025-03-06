import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';
import { getCategory } from './categories.db.js';

const QuestionSchema = z.object({
  id: z.number(),
  question: z
    .string()
    .min(3, 'question must be at least three letters')
    .max(1024, 'question must be at most 1024 letters'),
  categoryId: z.number(),
});

const QuestionToCreateSchema = z.object({
  question: z
     .string()
     .min(3, 'question must be at least three letters')
     .max(1024, 'question must be at most 1024 letters'),
  correctAnswer: z.number().min(1, "correct answer must be between 1 and 4").max(4, "correct answer must be between 1 and 4"),
  answers: z.array(z.string().min(1, "answer must not be empty").max(1024, "answer cant be more than 1024 characters")).length(4, "there must be four answers")
});

type Question = z.infer<typeof QuestionSchema>;
type QuestionToCreate = z.infer<typeof QuestionToCreateSchema>;

export function validateQuestion(question: unknown): z.SafeParseReturnType< QuestionToCreate, QuestionToCreate > {
    return QuestionToCreateSchema.safeParse(question);
}

const prisma = new PrismaClient();

export async function getQuestions(): Promise<Array<Question>> {
    const result = await prisma.questions.findMany();
    return result;
}

export async function getQuestionsByCategory(slug: string): Promise<Array<Question> | null> {
    const category = await getCategory(slug);
    if (!category) return null;
    const res = await prisma.questions.findMany({
        where: {
            categoryId: category.id,
        }
    });
    return res ?? null;
}

export async function createQuestion(question: QuestionToCreate, slug: string): Promise<Question | null> {
    const category = await getCategory(slug);
    if (!category) return null;
    const result = await prisma.questions.create({
        data: {
            question: xss(question.question),
            categoryId: category.id,
            correctAnswer: question.correctAnswer,
            answers: question.answers
        }
    })

    return result;
}

export async function updateQuestion(question: QuestionToCreate, id: number): Promise<Question | null> {
    const result = await prisma.questions.update({
        where: {
            id
        },
        data: {
            question: question.question,
            correctAnswer: question.correctAnswer,
            answers: question.answers
        }
    })

    return result;
}