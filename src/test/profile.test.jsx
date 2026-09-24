import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { currentUrl, renderAt } from './renderApp'
import { fakeSupabase, mockState, seedRecipeRow, signInAs } from './supabaseMock'

const ME = 'user-cook@example.com' // id the mock gives cook@example.com

const recipeRow = (title, userId, extra = {}) => ({
  title,
  category: 'Dinner',
  difficulty: 'Medium',
  time: 30,
  servings: 2,
  ingredients: [{ name: 'Salt' }],
  instructions: [{ title: 'Cook', text: 'Cook it.' }],
  user_id: userId,
  ...extra,
})

const nav = () => within(screen.getByRole('navigation', { name: 'Primary' }))
const myRecipes = () => within(screen.getByRole('region', { name: 'My Recipes' }))
const cardTitlesIn = (scope) => scope.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent)
const recipesRegion = () => within(screen.getByRole('region', { name: 'Recipes' }))
const cardFor = (title) => screen.getByRole('link', { name: new RegExp(title) })

beforeEach(() => {
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

describe('Feature: Profile page (TC-PROFILE)', () => {
  it('TC-PROFILE-01: /profile is protected and returns there after logging in', async () => {
    mockState.users['cook@example.com'] = 'secret123'
    const user = renderAt('/profile')
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/login')

    await user.type(screen.getByLabelText('Email'), 'cook@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('heading', { name: 'Your Profile' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/profile')
  })

  it('TC-PROFILE-02: shows the logged-in email, title, and a Profile navbar link', async () => {
    signInAs('cook@example.com')
    renderAt('/profile')
    expect(await screen.findByText('cook@example.com')).toBeInTheDocument()
    expect(document.title).toBe('Profile | RecipeHub')
    const profileLink = nav().getByRole('link', { name: 'Profile' })
    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(profileLink).toHaveAttribute('aria-current', 'page')
  })

  it('TC-PROFILE-03: My Recipes lists only recipes whose user_id is the current user', async () => {
    seedRecipeRow(recipeRow('My Dal', ME))
    seedRecipeRow(recipeRow('Someone Else Curry', 'user-other'))
    seedRecipeRow(recipeRow('My Pulao', ME))
    signInAs('cook@example.com')
    renderAt('/profile')
    await screen.findByRole('heading', { name: 'Your Profile' }) // after the session check

    expect(await myRecipes().findByRole('heading', { level: 3, name: 'My Pulao' })).toBeInTheDocument()
    expect(cardTitlesIn(myRecipes())).toEqual(['My Pulao', 'My Dal'])
    expect(screen.queryByText('Someone Else Curry')).not.toBeInTheDocument()
    expect(screen.getByText('2 recipes')).toBeInTheDocument()
    expect(fakeSupabase.from).toHaveBeenCalledWith('recipes')
    // Only own recipes, and never the static built-in ones.
    expect(screen.queryByText('Chicken Biryani')).not.toBeInTheDocument()
  })

  it('TC-PROFILE-04: with no recipes, shows a friendly empty state with an Add Recipe button', async () => {
    seedRecipeRow(recipeRow('Someone Else Curry', 'user-other'))
    signInAs('cook@example.com')
    const user = renderAt('/profile')

    expect(await screen.findByText("You haven't added any recipes yet.")).toBeInTheDocument()
    await user.click(myRecipes().getByRole('link', { name: 'Add Recipe' }))
    expect(currentUrl()).toBe('/recipes/new')
    expect(await screen.findByRole('heading', { name: 'Add a Recipe' })).toBeInTheDocument()
  })

  it('TC-PROFILE-05: clicking one of my recipes opens its detail page', async () => {
    const row = seedRecipeRow(recipeRow('My Dal', ME))
    signInAs('cook@example.com')
    const user = renderAt('/profile')
    await screen.findByRole('heading', { name: 'Your Profile' }) // after the session check
    await user.click(await myRecipes().findByRole('link', { name: /My Dal/ }))
    expect(currentUrl()).toBe(`/recipes/${row.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'My Dal' })).toBeInTheDocument()
  })

  it('TC-PROFILE-06: a failed fetch shows a message instead of an empty state', async () => {
    mockState.selectError = { message: 'network down' }
    signInAs('cook@example.com')
    renderAt('/profile')
    expect(await screen.findByText(/Your recipes couldn.t be loaded/)).toBeInTheDocument()
    expect(screen.queryByText("You haven't added any recipes yet.")).not.toBeInTheDocument()
  })
})

describe('Feature: Recipe ownership labels (TC-OWNER)', () => {
  it('TC-OWNER-01: cards show "Added by you" / "Community recipe"; built-in recipes show nothing', async () => {
    seedRecipeRow(recipeRow('My Dal', ME))
    seedRecipeRow(recipeRow('Someone Else Curry', 'user-other'))
    signInAs('cook@example.com')
    renderAt('/recipes')
    await screen.findByRole('heading', { level: 3, name: 'My Dal' })

    expect(within(cardFor('My Dal')).getByText('Added by you')).toBeInTheDocument()
    expect(within(cardFor('Someone Else Curry')).getByText('Community recipe')).toBeInTheDocument()
    expect(within(cardFor('Chicken Biryani')).queryByText(/Added by you|Community recipe/)).not.toBeInTheDocument()
    expect(recipesRegion().getAllByText('Added by you')).toHaveLength(1)
    expect(recipesRegion().getAllByText('Community recipe')).toHaveLength(1)
  })

  it('TC-OWNER-02: logged out, every Supabase recipe is labelled "Community recipe"', async () => {
    seedRecipeRow(recipeRow('My Dal', ME))
    renderAt('/recipes')
    await screen.findByRole('heading', { level: 3, name: 'My Dal' })
    expect(within(cardFor('My Dal')).getByText('Community recipe')).toBeInTheDocument()
    expect(screen.queryByText('Added by you')).not.toBeInTheDocument()
  })

  it.each([
    ['my recipe', ME, 'Added by you'],
    ["another user's recipe", 'user-other', 'Community recipe'],
  ])('TC-OWNER-03: the detail page of %s shows "%s"', async (_label, owner, expected) => {
    const row = seedRecipeRow(recipeRow('Detail Dish', owner))
    signInAs('cook@example.com')
    renderAt(`/recipes/${row.id}`)
    await screen.findByRole('heading', { level: 1, name: 'Detail Dish' })
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('TC-OWNER-04: a built-in recipe detail page has no ownership label', async () => {
    signInAs('cook@example.com')
    renderAt('/recipes/chicken-biryani')
    await nav().findByRole('button', { name: 'Log out' })
    expect(screen.queryByText(/Added by you|Community recipe/)).not.toBeInTheDocument()
  })
})

describe('Feature: Community recipes first (TC-ORDER)', () => {
  it('TC-ORDER-01: community recipes (newest first) come before the 8 built-in recipes', async () => {
    seedRecipeRow(recipeRow('Older Community Dish', 'user-other'))
    seedRecipeRow(recipeRow('Newest Community Dish', 'user-other'))
    renderAt('/recipes')
    await screen.findByRole('heading', { level: 3, name: 'Newest Community Dish' })

    const titles = cardTitlesIn(recipesRegion())
    expect(titles).toHaveLength(10)
    expect(titles.slice(0, 3)).toEqual(['Newest Community Dish', 'Older Community Dish', 'Classic Pasta Carbonara'])
  })

  it('TC-ORDER-02: search and category filters still work with community recipes first', async () => {
    seedRecipeRow(recipeRow('Community Rice Bowl', 'user-other', { category: 'Lunch' }))
    const user = renderAt('/recipes?category=Lunch')
    await screen.findByRole('heading', { level: 3, name: 'Community Rice Bowl' })
    expect(cardTitlesIn(recipesRegion())).toEqual([
      'Community Rice Bowl',
      'Vegetable Fried Rice',
      'Caesar Salad with Croûtons',
    ])

    await user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'rice')
    expect(cardTitlesIn(recipesRegion())).toEqual(['Community Rice Bowl', 'Vegetable Fried Rice'])
  })
})

describe('Feature: Logout confirmation (TC-LOGOUT)', () => {
  it('TC-LOGOUT-01: Log out asks "Are you sure you want to log out?"', async () => {
    signInAs()
    const user = renderAt('/')
    await user.click(await nav().findByRole('button', { name: 'Log out' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Log out' })
    expect(dialog).toHaveTextContent('Are you sure you want to log out?')
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus()
    expect(fakeSupabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('TC-LOGOUT-02: Cancel keeps the user logged in and returns focus to Log out', async () => {
    signInAs()
    const user = renderAt('/recipes')
    const logout = await nav().findByRole('button', { name: 'Log out' })
    await user.click(logout)
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(fakeSupabase.auth.signOut).not.toHaveBeenCalled()
    expect(nav().getByRole('link', { name: 'Profile' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/recipes')
    expect(logout).toHaveFocus()
  })

  it('TC-LOGOUT-03: Escape also cancels', async () => {
    signInAs()
    const user = renderAt('/')
    await user.click(await nav().findByRole('button', { name: 'Log out' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(fakeSupabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('TC-LOGOUT-04: confirming logs out and goes Home (also from a protected page)', async () => {
    signInAs()
    const user = renderAt('/profile')
    await screen.findByRole('heading', { name: 'Your Profile' })
    await user.click(nav().getByRole('button', { name: 'Log out' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Log out' }))

    expect(fakeSupabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(currentUrl()).toBe('/')
    expect(await nav().findByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(nav().queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument()
  })

  it('TC-LOGOUT-05: Tab stays inside the dialog', async () => {
    signInAs()
    const user = renderAt('/')
    await user.click(await nav().findByRole('button', { name: 'Log out' }))
    const dialog = within(screen.getByRole('alertdialog'))
    await user.tab()
    expect(dialog.getByRole('button', { name: 'Log out' })).toHaveFocus()
    await user.tab()
    expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })
})
