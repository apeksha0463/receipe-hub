import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { currentUrl, goBack, renderAt } from './renderApp'
import { mockState, seedRecipeRow, signInAs } from './supabaseMock'

const cardTitles = () =>
  within(screen.getByRole('region', { name: 'Recipes' }))
    .queryAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

async function openForm() {
  signInAs('cook@example.com')
  const user = renderAt('/recipes/new')
  await screen.findByRole('heading', { name: 'Add a Recipe' })
  return user
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText('Title'), 'Masala Omelette')
  await user.selectOptions(screen.getByLabelText('Category'), 'Breakfast')
  await user.selectOptions(screen.getByLabelText('Difficulty'), 'Easy')
  await user.type(screen.getByLabelText('Time (min)'), '12')
  await user.type(screen.getByLabelText('Servings'), '2')
  await user.type(screen.getByLabelText('Description (optional)'), 'Spicy Indian-style eggs.')
  await user.type(screen.getByLabelText('Ingredient 1'), 'Eggs')
  await user.click(screen.getByRole('button', { name: '+ Add ingredient' }))
  await user.type(screen.getByLabelText('Ingredient 2'), 'Green chilli')
  await user.type(screen.getByLabelText('Step 1 title (optional)'), 'Whisk')
  await user.type(screen.getByLabelText('Step 1 instructions'), 'Whisk the eggs with chilli.')
}

const omeletteRow = {
  title: 'Masala Omelette',
  category: 'Breakfast',
  difficulty: 'Easy',
  time: 12,
  servings: 2,
  description: 'Spicy Indian-style eggs.',
  ingredients: [{ name: 'Eggs' }],
  instructions: [{ title: 'Whisk', text: 'Whisk the eggs.' }],
}

beforeEach(() => {
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

describe('Feature: Add Recipe form (TC-ADD)', () => {
  it('TC-ADD-01: submitting an empty form shows errors and saves nothing', async () => {
    const user = await openForm()
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))

    expect(screen.getByText('Enter a recipe title.')).toBeInTheDocument()
    expect(screen.getByText('Choose a category.')).toBeInTheDocument()
    expect(screen.getByText('Add at least one ingredient.')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Title')).toHaveFocus()
    expect(mockState.insertedPayloads).toHaveLength(0)
  })

  it('TC-ADD-02: ingredient and step rows can be added and removed', async () => {
    const user = await openForm()
    await user.click(screen.getByRole('button', { name: '+ Add ingredient' }))
    await user.type(screen.getByLabelText('Ingredient 1'), 'Eggs')
    await user.type(screen.getByLabelText('Ingredient 2'), 'Salt')
    await user.click(screen.getByRole('button', { name: 'Remove ingredient 1' }))
    expect(screen.getByLabelText('Ingredient 1')).toHaveValue('Salt')
    expect(screen.queryByLabelText('Ingredient 2')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '+ Add step' }))
    expect(screen.getByLabelText('Step 2 instructions')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove step 2' }))
    expect(screen.queryByLabelText('Step 2 instructions')).not.toBeInTheDocument()
  })

  it('TC-ADD-03: a valid recipe is saved to Supabase without user_id and opens its detail page', async () => {
    const user = await openForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))

    expect(mockState.insertedPayloads).toEqual([
      {
        title: 'Masala Omelette',
        category: 'Breakfast',
        difficulty: 'Easy',
        time: 12,
        servings: 2,
        description: 'Spicy Indian-style eggs.',
        image: null,
        ingredients: [{ name: 'Eggs' }, { name: 'Green chilli' }],
        instructions: [{ title: 'Whisk', text: 'Whisk the eggs with chilli.' }],
      },
    ])
    const saved = mockState.rows[0]
    expect(saved.user_id).toBe('user-cook@example.com')

    expect(currentUrl()).toBe(`/recipes/${saved.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })).toBeInTheDocument()
    expect(document.title).toBe('Masala Omelette | RecipeHub')
    expect(screen.getByText('Spicy Indian-style eggs.')).toBeInTheDocument()
    expect(screen.getByText('Green chilli')).toBeInTheDocument()
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument()
  })

  it('TC-ADD-04: the new recipe appears in the list, search and category filter', async () => {
    const user = await openForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))
    await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })

    await user.click(screen.getByRole('link', { name: 'Recipes' }))
    expect(cardTitles()).toHaveLength(9)
    expect(cardTitles()[0]).toBe('Masala Omelette')

    await user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'masala')
    expect(cardTitles()).toEqual(['Masala Omelette'])

    await user.clear(screen.getByRole('searchbox', { name: 'Search recipes' }))
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))
    expect(cardTitles()).toEqual(['Masala Omelette', 'Fluffy Pancakes', 'Berry Smoothie Bowl'])
  })

  it('TC-ADD-05: a failed save shows a friendly error (not the raw one) and keeps what was typed', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockState.insertError = { code: '23514', message: 'violates check constraint "recipes_time_check"' }
    const user = await openForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your recipe could not be saved. Please try again.')
    expect(alert).not.toHaveTextContent(/check constraint|recipes_time_check/)
    expect(screen.queryByRole('button', { name: 'Log in again' })).not.toBeInTheDocument()
    expect(currentUrl()).toBe('/recipes/new')
    expect(screen.getByLabelText('Title')).toHaveValue('Masala Omelette')
    expect(screen.getByRole('button', { name: 'Save recipe' })).toBeEnabled()
    errorSpy.mockRestore()
  })

  it('TC-ADD-06: the save button is disabled while saving (no double submit)', async () => {
    let finishInsert
    mockState.insertPending = new Promise((resolve) => {
      finishInsert = resolve
    })
    const user = await openForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))

    const saving = screen.getByRole('button', { name: 'Saving…' })
    expect(saving).toBeDisabled()
    await user.click(saving)
    finishInsert()

    await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })
    expect(mockState.insertedPayloads).toHaveLength(1)
  })
})

describe('Feature: Add Recipe navigation + session expiry (TC-ADD-NAV, TC-SESSION)', () => {
  it('TC-ADD-NAV-01: Back after saving skips the Add Recipe form (history entry replaced)', async () => {
    signInAs('cook@example.com')
    const user = renderAt('/recipes')
    await user.click(await screen.findByRole('link', { name: 'Add Recipe' }))
    await screen.findByRole('heading', { name: 'Add a Recipe' })
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))
    await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })
    expect(currentUrl()).toBe(`/recipes/${mockState.rows[0].id}`)

    await goBack(user)
    expect(currentUrl()).toBe('/recipes')
    expect(screen.queryByRole('heading', { name: 'Add a Recipe' })).not.toBeInTheDocument()
  })

  it('TC-SESSION-01: an expired session shows the friendly message, keeps the form, and restores it after logging in again', async () => {
    const user = await openForm()
    await fillValidForm(user)
    mockState.session = null // expired on the server; the page still thinks it is logged in

    await user.click(screen.getByRole('button', { name: 'Save recipe' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your session expired. Please log in again.')
    expect(alert).not.toHaveTextContent(/row-level|jwt/i)
    expect(screen.getByLabelText('Title')).toHaveValue('Masala Omelette')
    expect(mockState.insertedPayloads).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Log in again' }))
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/login')

    await user.type(screen.getByLabelText('Email'), 'cook@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('heading', { name: 'Add a Recipe' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Masala Omelette')
    expect(screen.getByLabelText('Ingredient 2')).toHaveValue('Green chilli')
  })

  it('TC-SESSION-02: an RLS rejection from the server is shown as an expired session, not the raw error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockState.insertError = { code: '42501', message: 'new row violates row-level security policy for table "recipes"' }
    const user = await openForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your session expired. Please log in again.')
    expect(alert).not.toHaveTextContent(/row-level security/)
    expect(screen.getByRole('button', { name: 'Log in again' })).toBeInTheDocument()
    errorSpy.mockRestore()
  })

  it('TC-SESSION-03: a successful save clears the saved draft', async () => {
    const user = await openForm()
    await fillValidForm(user)
    expect(sessionStorage.getItem('recipehub:add-recipe-draft:user-cook@example.com')).toContain('Masala Omelette')
    await user.click(screen.getByRole('button', { name: 'Save recipe' }))
    await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })
    expect(sessionStorage.getItem('recipehub:add-recipe-draft:user-cook@example.com')).toBeNull()
  })
})

describe('Feature: Community recipes for everyone (TC-COMMUNITY)', () => {
  it('TC-COMMUNITY-01: logged-out visitors see static and Supabase recipes together', async () => {
    seedRecipeRow(omeletteRow)
    renderAt('/recipes')
    expect(await screen.findByRole('heading', { level: 3, name: 'Masala Omelette' })).toBeInTheDocument()
    expect(cardTitles()).toHaveLength(9)
    expect(cardTitles().slice(1)).toContain('Chicken Biryani')
  })

  it('TC-COMMUNITY-02: if Supabase fails, the 8 static recipes still show with a message', async () => {
    mockState.selectError = { message: 'network down' }
    renderAt('/recipes')
    expect(await screen.findByText(/Community recipes couldn.t be loaded/)).toBeInTheDocument()
    expect(cardTitles()).toHaveLength(8)
  })

  it('TC-COMMUNITY-03: a community recipe detail page loads by id for logged-out visitors', async () => {
    const row = seedRecipeRow(omeletteRow)
    renderAt(`/recipes/${row.id}`)
    expect(screen.getByRole('status')).toHaveTextContent('Loading recipe')
    expect(await screen.findByRole('heading', { level: 1, name: 'Masala Omelette' })).toBeInTheDocument()
    expect(screen.getByText('Easy Difficulty')).toBeInTheDocument()
    expect(screen.getByText('Whisk the eggs.')).toBeInTheDocument()
  })

  it('TC-COMMUNITY-04: an unknown numeric id shows Recipe not found', async () => {
    renderAt('/recipes/424242')
    expect(await screen.findByRole('heading', { name: 'Recipe not found' })).toBeInTheDocument()
    expect(document.title).toBe('Recipe Not Found | RecipeHub')
  })

  it('TC-COMMUNITY-05: a failed detail fetch says the recipe is unavailable', async () => {
    mockState.selectError = { message: 'network down' }
    renderAt('/recipes/101')
    expect(await screen.findByRole('heading', { name: 'Recipe unavailable' })).toBeInTheDocument()
  })

  it('TC-COMMUNITY-06: a broken image URL falls back to the category photo', async () => {
    seedRecipeRow({ ...omeletteRow, image: 'https://example.com/broken.jpg' })
    renderAt('/recipes')
    const card = await screen.findByRole('link', { name: /Masala Omelette/ })
    const img = card.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/broken.jpg')
    img.dispatchEvent(new Event('error'))
    expect(img.getAttribute('src')).not.toBe('https://example.com/broken.jpg')
    expect(img.dataset.fallback).toBe('true')
  })
})
