import { describe, it, expect } from 'vitest'
import { recipes, searchRecipes } from '../data/recipes'

describe('Feature: Recipe Search (TC-SEARCH)', () => {
  it('TC-SEARCH-01: empty query returns all recipes', () => {
    const result = searchRecipes(recipes, '')
    expect(result).toHaveLength(recipes.length)
  })

  it('TC-SEARCH-02: exact title match finds correct recipe', () => {
    const result = searchRecipes(recipes, 'Pasta Carbonara')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].title).toContain('Carbonara')
  })

  it('TC-SEARCH-03: case-insensitive search works', () => {
    const lower = searchRecipes(recipes, 'pasta')
    const upper = searchRecipes(recipes, 'PASTA')
    expect(lower.length).toBe(upper.length)
  })

  it('TC-SEARCH-04: partial match works (pan -> Pancakes)', () => {
    const result = searchRecipes(recipes, 'pan')
    expect(result.some(r => r.title.toLowerCase().includes('pan'))).toBe(true)
  })

  it('TC-SEARCH-05: no match returns empty array', () => {
    const result = searchRecipes(recipes, 'xyznonexistent')
    expect(result).toHaveLength(0)
  })

  it('TC-SEARCH-06: whitespace-only query returns all recipes', () => {
    const result = searchRecipes(recipes, '   ')
    expect(result).toHaveLength(recipes.length)
  })

  it('TC-SEARCH-08: search for vegetable finds Vegetable Fried Rice', () => {
    const result = searchRecipes(recipes, 'vegetable')
    expect(result.map(r => r.title)).toEqual(['Vegetable Fried Rice'])
  })

  it('TC-SEARCH-07: search for salmon finds grilled salmon', () => {
    const result = searchRecipes(recipes, 'salmon')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].title.toLowerCase()).toContain('salmon')
  })
})
