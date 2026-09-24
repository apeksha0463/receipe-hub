import { describe, it, expect } from 'vitest'
import {
  createRecipe,
  fetchCommunityRecipe,
  fetchCommunityRecipes,
  fetchMyRecipes,
  fromRow,
  getOwnershipLabel,
  getCachedCommunityRecipes,
  toInsertPayload,
  validateRecipeForm,
} from '../data/recipeService'
import { categories } from '../data/recipes'
import { mockState, seedRecipeRow, signInAs } from './supabaseMock'

const validForm = () => ({
  title: '  Masala Omelette ',
  category: 'Breakfast',
  difficulty: 'Easy',
  time: '12',
  servings: '2',
  description: ' Spicy eggs. ',
  image: '',
  ingredients: ['Eggs', '  ', ' Onion '],
  steps: [
    { title: '', text: 'Whisk the eggs.' },
    { title: 'Empty', text: '   ' },
    { title: 'Cook', text: ' Fry until set. ' },
  ],
})

describe('Feature: Supabase row mapping (TC-DB-MAP)', () => {
  it('TC-DB-MAP-01: converts a row to the app recipe shape', () => {
    const recipe = fromRow({
      id: 42,
      created_at: '2026-09-25T10:00:00Z',
      title: 'Masala Omelette',
      category: 'Breakfast',
      difficulty: 'Easy',
      time: 12,
      servings: 2,
      description: 'Spicy eggs.',
      image: 'https://example.com/omelette.jpg',
      ingredients: [{ name: 'Eggs' }, 'Onion'],
      instructions: [{ title: 'Whisk', text: 'Whisk the eggs.' }, 'Fry until set.'],
      user_id: 'user-1',
    })
    expect(recipe).toMatchObject({
      id: '42',
      title: 'Masala Omelette',
      category: 'Breakfast',
      difficulty: 'Easy',
      time: 12,
      servings: 2,
      description: 'Spicy eggs.',
      image: 'https://example.com/omelette.jpg',
      ingredients: [{ name: 'Eggs' }, { name: 'Onion' }],
      steps: [
        { title: 'Whisk', text: 'Whisk the eggs.' },
        { title: 'Step 2', text: 'Fry until set.' },
      ],
      source: 'supabase',
      userId: 'user-1',
    })
    expect(recipe).not.toHaveProperty('rating')
  })

  it('TC-DB-MAP-02: missing image uses the category photo; missing lists become empty', () => {
    const recipe = fromRow({ id: 7, title: 'Soup', category: 'Dinner', difficulty: 'Medium', time: 30, servings: 4 })
    const dinnerImage = categories.find((c) => c.name === 'Dinner').image
    expect(recipe.image).toBe(dinnerImage)
    expect(recipe.fallbackImage).toBe(dinnerImage)
    expect(recipe.ingredients).toEqual([])
    expect(recipe.steps).toEqual([])
  })

  it('TC-DB-MAP-03: unknown difficulty falls back to Easy so the badge never breaks', () => {
    expect(fromRow({ id: 1, difficulty: null, category: 'Lunch' }).difficulty).toBe('Easy')
  })
})

describe('Feature: Add Recipe payload (TC-DB-PAYLOAD)', () => {
  it('TC-DB-PAYLOAD-01: trims values, converts numbers and drops empty rows', () => {
    expect(toInsertPayload(validForm())).toEqual({
      title: 'Masala Omelette',
      category: 'Breakfast',
      difficulty: 'Easy',
      time: 12,
      servings: 2,
      description: 'Spicy eggs.',
      image: null,
      ingredients: [{ name: 'Eggs' }, { name: 'Onion' }],
      instructions: [
        { title: 'Step 1', text: 'Whisk the eggs.' },
        { title: 'Cook', text: 'Fry until set.' },
      ],
    })
  })

  it('TC-DB-PAYLOAD-02: never sends id, created_at or user_id', () => {
    const payload = toInsertPayload(validForm())
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('created_at')
    expect(payload).not.toHaveProperty('user_id')
  })
})

describe('Feature: Add Recipe validation (TC-VALIDATE)', () => {
  it('TC-VALIDATE-01: a complete form has no errors', () => {
    expect(validateRecipeForm(validForm())).toEqual({})
  })

  it('TC-VALIDATE-02: an empty form reports every required field', () => {
    const errors = validateRecipeForm({
      title: '',
      category: '',
      difficulty: '',
      time: '',
      servings: '',
      description: '',
      image: '',
      ingredients: [''],
      steps: [{ title: '', text: '' }],
    })
    expect(Object.keys(errors).sort()).toEqual(
      ['category', 'difficulty', 'ingredients', 'servings', 'steps', 'time', 'title'].sort(),
    )
  })

  it.each([
    ['time', '0'],
    ['time', '12.5'],
    ['time', '-5'],
    ['time', '2000'],
    ['servings', '0'],
    ['servings', 'abc'],
    ['category', 'Snacks'],
    ['difficulty', 'Expert'],
    ['image', 'not a url'],
    ['image', 'javascript:alert(1)'],
  ])('TC-VALIDATE-03: rejects %s = %j', (field, value) => {
    expect(validateRecipeForm({ ...validForm(), [field]: value })).toHaveProperty(field)
  })

  it('TC-VALIDATE-04: accepts an https image URL', () => {
    expect(validateRecipeForm({ ...validForm(), image: 'https://example.com/a.jpg' })).toEqual({})
  })
})

describe('Feature: Supabase queries (TC-DB-QUERY)', () => {
  it('TC-DB-QUERY-01: fetchCommunityRecipes returns mapped rows and fills the cache', async () => {
    seedRecipeRow({ title: 'Seeded Soup', category: 'Dinner', difficulty: 'Easy', time: 20, servings: 2 })
    const list = await fetchCommunityRecipes()
    expect(list.map((r) => r.title)).toEqual(['Seeded Soup'])
    expect(getCachedCommunityRecipes()).toBe(list)
  })

  it('TC-DB-QUERY-02: fetchCommunityRecipes throws on a Supabase error', async () => {
    mockState.selectError = { message: 'network down' }
    await expect(fetchCommunityRecipes()).rejects.toEqual({ message: 'network down' })
  })

  it('TC-DB-QUERY-03: fetchCommunityRecipe finds numeric ids and ignores static slugs', async () => {
    const row = seedRecipeRow({ title: 'Seeded Soup', category: 'Dinner', difficulty: 'Easy', time: 20, servings: 2 })
    expect((await fetchCommunityRecipe(String(row.id))).title).toBe('Seeded Soup')
    expect(await fetchCommunityRecipe('999999')).toBeNull()
    expect(await fetchCommunityRecipe('chicken-biryani')).toBeNull()
  })

  it('TC-DB-QUERY-04: createRecipe saves the row for the logged-in user (user_id from the database)', async () => {
    signInAs('cook@example.com')
    const recipe = await createRecipe(validForm())
    expect(mockState.insertedPayloads[0]).not.toHaveProperty('user_id')
    expect(mockState.rows[0].user_id).toBe('user-cook@example.com')
    expect(recipe).toMatchObject({ title: 'Masala Omelette', userId: 'user-cook@example.com', source: 'supabase' })
    expect(getCachedCommunityRecipes()[0]).toBe(recipe)
  })

  it('TC-DB-QUERY-06: fetchMyRecipes returns only rows whose user_id matches', async () => {
    seedRecipeRow({ title: 'Mine', category: 'Dinner', difficulty: 'Easy', time: 20, servings: 2, user_id: 'user-a' })
    seedRecipeRow({ title: 'Theirs', category: 'Dinner', difficulty: 'Easy', time: 20, servings: 2, user_id: 'user-b' })
    expect((await fetchMyRecipes('user-a')).map((r) => r.title)).toEqual(['Mine'])
    expect(await fetchMyRecipes('user-c')).toEqual([])
    expect(await fetchMyRecipes(undefined)).toEqual([])
  })

  it('TC-DB-QUERY-05: createRecipe without a session reports an expired session and sends nothing', async () => {
    await expect(createRecipe(validForm())).rejects.toMatchObject({
      sessionExpired: true,
      userMessage: 'Your session expired. Please log in again.',
    })
    expect(mockState.insertedPayloads).toHaveLength(0)
    expect(mockState.rows).toHaveLength(0)
  })
})

describe('Feature: Ownership label (TC-OWNER-UNIT)', () => {
  const community = { source: 'supabase', userId: 'user-a' }
  it.each([
    ['own community recipe', community, { id: 'user-a' }, 'Added by you'],
    ["someone else's community recipe", community, { id: 'user-b' }, 'Community recipe'],
    ['community recipe while logged out', community, null, 'Community recipe'],
    ['static built-in recipe', { id: 'chicken-biryani' }, { id: 'user-a' }, null],
  ])('TC-OWNER-UNIT: %s', (_name, recipe, user, expected) => {
    expect(getOwnershipLabel(recipe, user)).toBe(expected)
  })
})
