import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { currentUrl, goBack, renderAt } from './renderApp'

const searchBox = () => screen.getByRole('searchbox', { name: 'Search recipes' })
const cardTitles = () =>
  within(screen.getByRole('region', { name: 'Recipes' }))
    .queryAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)
const setScrollY = (y) => {
  window.scrollY = y
  fireEvent.scroll(window)
}

beforeEach(() => {
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
  window.scrollY = 0
})

describe('Feature: Recipe search URL state (TC-SEARCH-URL)', () => {
  it('TC-SEARCH-URL-01: ?q= in the URL drives the search box and results (refresh)', () => {
    renderAt('/recipes?q=pasta')
    expect(searchBox()).toHaveValue('pasta')
    expect(cardTitles()).toEqual(['Classic Pasta Carbonara'])
  })

  it('TC-SEARCH-URL-02: typing updates ?q= and clearing removes it', async () => {
    const user = renderAt('/recipes')
    await user.type(searchBox(), 'chocolate')
    expect(currentUrl()).toBe('/recipes?q=chocolate')
    expect(cardTitles()).toEqual(['Decadent Chocolate Cake'])

    await user.clear(searchBox())
    expect(currentUrl()).toBe('/recipes')
    expect(cardTitles()).toHaveLength(8)
  })

  it('TC-SEARCH-URL-03: search survives opening a recipe and pressing Back', async () => {
    const user = renderAt('/recipes')
    await user.type(searchBox(), 'chocolate')
    await user.click(screen.getByRole('link', { name: /Decadent Chocolate Cake/ }))
    expect(currentUrl()).toBe('/recipes/decadent-chocolate-cake')

    await goBack(user)
    expect(currentUrl()).toBe('/recipes?q=chocolate')
    expect(searchBox()).toHaveValue('chocolate')
    expect(cardTitles()).toEqual(['Decadent Chocolate Cake'])
  })

  it('TC-SEARCH-URL-04: cleared Home search does not come back when a filter is picked', async () => {
    const user = renderAt('/')
    await user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'pasta{Enter}')
    expect(currentUrl()).toBe('/recipes?q=pasta')

    await user.clear(searchBox())
    await user.click(screen.getByRole('button', { name: 'Dinner' }))
    expect(currentUrl()).toBe('/recipes?category=Dinner')
    expect(cardTitles()).toHaveLength(3)
  })

  it('TC-SEARCH-URL-05: typing keeps the selected category in the URL', async () => {
    const user = renderAt('/recipes?category=Dinner')
    await user.type(searchBox(), 'salmon')
    expect(currentUrl()).toBe('/recipes?category=Dinner&q=salmon')
    expect(cardTitles()).toEqual(['Grilled Salmon with Asparagus'])
  })
})

describe('Feature: Category filter from the URL (TC-FILTER-URL)', () => {
  it('TC-FILTER-URL-01: ?category=dinner (lowercase) selects Dinner', () => {
    renderAt('/recipes?category=dinner')
    expect(screen.getByRole('button', { name: 'Dinner' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    expect(cardTitles()).toHaveLength(3)
  })

  it('TC-FILTER-URL-02: unknown category falls back to All', () => {
    renderAt('/recipes?category=sushi')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(cardTitles()).toHaveLength(8)
  })
})

describe('Feature: Page titles (TC-TITLE)', () => {
  it.each([
    ['/', 'RecipeHub'],
    ['/recipes', 'Recipes | RecipeHub'],
    ['/recipes/chicken-biryani', 'Chicken Biryani | RecipeHub'],
    ['/recipes/does-not-exist', 'Recipe Not Found | RecipeHub'],
    ['/no-such-page', 'Page Not Found | RecipeHub'],
  ])('TC-TITLE: %s has title "%s"', (url, title) => {
    renderAt(url)
    expect(document.title).toBe(title)
  })
})

describe('Feature: Consistent recipe display (TC-DISPLAY)', () => {
  it('TC-DISPLAY-01: Home cards use "min", never "mins"', () => {
    renderAt('/')
    expect(screen.getByText('25 min')).toBeInTheDocument()
    expect(screen.queryByText(/\bmins\b/)).not.toBeInTheDocument()
  })

  it('TC-DISPLAY-02: detail page uses "min" and the same difficulty as the card', () => {
    renderAt('/recipes/chicken-biryani')
    expect(screen.getByText(/^45 min/)).toBeInTheDocument()
    expect(screen.getByText('Hard Difficulty')).toBeInTheDocument()
    expect(screen.queryByText(/Medium Difficulty/)).not.toBeInTheDocument()
  })
})

describe('Feature: Navigation scrolling (TC-SCROLL)', () => {
  it('TC-SCROLL-01: Back restores the previous scroll position', async () => {
    const user = renderAt('/recipes')
    setScrollY(1500)
    await user.click(screen.getByRole('link', { name: /Fluffy Pancakes/ }))
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0)

    window.scrollY = 0
    await goBack(user)
    expect(currentUrl()).toBe('/recipes')
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 1500)
  })

  it('TC-SCROLL-02: typing a search does not scroll to the top', async () => {
    const user = renderAt('/recipes')
    setScrollY(400)
    await user.type(searchBox(), 'rice')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('TC-SCROLL-03: Categories scrolls again and closes the mobile menu when re-clicked', async () => {
    const user = renderAt('/#categories')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1)

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('link', { name: 'Categories' }))
    expect(currentUrl()).toBe('/#categories')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
