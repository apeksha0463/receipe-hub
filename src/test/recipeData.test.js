import { describe, it, expect } from 'vitest'
import { recipes, getRecipeById } from '../data/recipes'

describe('Feature: Recipe Card Data (TC-CARD)', () => {
  it('TC-CARD-01: all recipes have required fields', () => {
    recipes.forEach(r => {
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('title')
      expect(r).toHaveProperty('category')
      expect(r).toHaveProperty('time')
      expect(r).toHaveProperty('difficulty')
      expect(r).toHaveProperty('image')
      expect(r).toHaveProperty('rating')
    })
  })

  it('TC-CARD-02: all recipe ids are unique', () => {
    const ids = recipes.map(r => r.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('TC-CARD-03: cooking times are positive numbers', () => {
    recipes.forEach(r => {
      expect(typeof r.time).toBe('number')
      expect(r.time).toBeGreaterThan(0)
    })
  })

  it('TC-CARD-04: ratings are between 1 and 5', () => {
    recipes.forEach(r => {
      expect(r.rating).toBeGreaterThanOrEqual(1)
      expect(r.rating).toBeLessThanOrEqual(5)
    })
  })

  it('TC-CARD-05: difficulty is one of Easy/Medium/Hard', () => {
    const valid = ['Easy', 'Medium', 'Hard']
    recipes.forEach(r => {
      expect(valid).toContain(r.difficulty)
    })
  })
})

describe('Feature: Recipe Detail Data (TC-DETAIL)', () => {
  it('TC-DETAIL-01: getRecipeById returns correct recipe', () => {
    const r = getRecipeById('classic-pasta-carbonara')
    expect(r).toBeDefined()
    expect(r.title).toBe('Classic Pasta Carbonara')
  })

  it('TC-DETAIL-02: getRecipeById returns undefined for invalid id', () => {
    const r = getRecipeById('nonexistent-id')
    expect(r).toBeUndefined()
  })

  it('TC-DETAIL-03: all recipes have non-empty ingredients array', () => {
    recipes.forEach(r => {
      expect(Array.isArray(r.ingredients)).toBe(true)
      expect(r.ingredients.length).toBeGreaterThan(0)
    })
  })

  it('TC-DETAIL-04: all recipes have non-empty steps array', () => {
    recipes.forEach(r => {
      expect(Array.isArray(r.steps)).toBe(true)
      expect(r.steps.length).toBeGreaterThan(0)
    })
  })

  it('TC-DETAIL-05: each step has title and text strings', () => {
    recipes.forEach(r => {
      r.steps.forEach(step => {
        expect(step).toHaveProperty('title')
        expect(step).toHaveProperty('text')
        expect(typeof step.title).toBe('string')
        expect(typeof step.text).toBe('string')
      })
    })
  })

  it('TC-DETAIL-06: servings is a positive integer', () => {
    recipes.forEach(r => {
      expect(Number.isInteger(r.servings)).toBe(true)
      expect(r.servings).toBeGreaterThan(0)
    })
  })

  it('TC-DETAIL-07: chicken biryani starts with exactly 3 pre-checked ingredients', () => {
    const biryani = getRecipeById('chicken-biryani')
    const preChecked = biryani.ingredients.filter(i => i.checked === true)
    expect(preChecked.length).toBe(3)
  })
})

describe('Feature: Navigation Data (TC-NAV)', () => {
  it('TC-NAV-01: data has exactly 8 recipes total', () => {
    expect(recipes).toHaveLength(8)
  })

  it('TC-NAV-02: all popular recipe ids exist in data', () => {
    const popularIds = ['classic-pasta-carbonara', 'grilled-salmon-with-asparagus', 'berry-smoothie-bowl']
    popularIds.forEach(id => {
      expect(getRecipeById(id)).toBeDefined()
    })
  })

  it('TC-NAV-03: recipe ids are kebab-case strings', () => {
    recipes.forEach(r => {
      expect(typeof r.id).toBe('string')
      expect(r.id).toMatch(/^[a-z0-9-]+$/)
    })
  })
})
