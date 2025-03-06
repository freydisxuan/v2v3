import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory, validateCategory } from './categories.db.js'
import { createQuestion, getQuestions, getQuestionsByCategory, updateQuestion, validateQuestion } from './questions.db.js'
import { validateSlug } from './validators.js'

const app = new Hono()

app.get('/', (c) => {

  const data =  {
    hello: 'hono'
  }

  return c.json(data)
})

app.get('/categories', async (c) => {
  const categories = await getCategories();
  return c.json(categories)
})

app.get('/categories/:slug', async (c) => {
  const slug = c.req.param('slug')

  const validSlug = validateSlug(slug);
  if (!validSlug.success) {
    return c.json({ error: "slug was not valid", errors: validSlug.error.flatten()}, 400);
  }

  const category = getCategory(validSlug.data);

  if (!category) {
    return c.json({ message: 'not found' }, 404)
  }

  return c.json(category, 200);
})

app.post('/categories', async (c) => {
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
  } catch (e) {
    return c.json({ error: 'invalid json' }, 400)
  }

  const validCategory = validateCategory(categoryToCreate)

  if (!validCategory.success) {
    return c.json({ error: 'invalid data', errors: validCategory.error.flatten() }, 400)
  }

  const createdCategory = await createCategory(validCategory.data)
  if (!createdCategory) {
    return c.json({error: "category already exists"}, 400);
  }

  return c.json(createdCategory, 201)
})

app.patch("/categories/:slug", async (c) => {
  const slug = c.req.param('slug')
  const validSlug = validateSlug(slug);
  if (!validSlug.success) {
    return c.json({ error: "slug was not valid", errors: validSlug.error.flatten()}, 400);
  }
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
  } catch (e) {
    return c.json({ error: 'invalid json' }, 400)
  }
  const validCategory = validateCategory(categoryToCreate)
  if (!validCategory.success) {
    return c.json({ error: 'invalid data', errors: validCategory.error.flatten() }, 400)
  }
  const updateResult = await updateCategory(validCategory.data, validSlug.data);
  if (!updateResult) {
    return c.json({error: "category not found"}, 404);
  }

  return c.json(updateResult, 200);
})

app.delete("/categories/:slug", async (c) => {
  const slug = c.req.param('slug')
  const validSlug = validateSlug(slug);
  if (!validSlug.success) {
    return c.json({ error: "slug was not valid", errors: validSlug.error.flatten()}, 400);
  }

  const deleteResult = await deleteCategory(validSlug.data);
  if (!deleteResult) {
    return c.json({error: "category not found"}, 404);
  }

  return c.body(null, 204);
})

app.get('/questions', async (c) => {
  const result = await getQuestions();
  return c.json(result, 200);
})

app.get('/questions/:slug', async (c) => {
  const slug = c.req.param('slug')
  const validSlug = validateSlug(slug);
  if (!validSlug.success) {
    return c.json({ error: "slug was not valid", errors: validSlug.error.flatten()}, 400);
  }

  const questions = await getQuestionsByCategory(validSlug.data);
  if (!questions) {
    return c.json({ message: 'not found' }, 404)
  }

  return c.json(questions, 200);
});

app.post('/questions/:slug', async (c) => {
  const slug = c.req.param('slug')
  const validSlug = validateSlug(slug);
  if (!validSlug.success) {
    return c.json({ error: "slug was not valid", errors: validSlug.error.flatten()}, 400);
  }
  let questionToCreate;
  try {
    questionToCreate = await c.req.json();
  } catch {
    return c.json({error: "invalid json"}, 400);
  }
  const validQuestion = validateQuestion(questionToCreate);

  if (!validQuestion.success) {
    return c.json({ error: 'invalid data', errors: validQuestion.error.flatten() }, 400)
  }
  const result = await createQuestion(validQuestion.data, validSlug.data);
  if (!result) {
    return c.json({error: "category not found"}, 404);
  }

  return c.json(result, 201);
})

app.patch('/questions/:id', async (c) => {
  const id = Number(c.req.param("id"));
  let questionToCreate;
  try {
    questionToCreate = await c.req.json();
  } catch {
    return c.json({error: "invalid json"}, 400);
  }
  const validQuestion = validateQuestion(questionToCreate);

  if (!validQuestion.success) {
    return c.json({ error: 'invalid data', errors: validQuestion.error.flatten() }, 400)
  }
  const result = await updateQuestion(validQuestion.data, id);
  if (!result) {
    return c.json({error: "question not found"}, 404);
  }

  return c.json(result, 200);
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})