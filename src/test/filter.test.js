import { describe, it, expect } from 'vitest'
import { recipes, filters, filterRecipes, findFilter } from '../data/recipes'

describe('Feature: Category Filter (TC-FILTER)', () => {
  it('TC-FILTER-01: All filter returns all recipes', () => {
    expect(filterRecipes(recipes, 'All')).toHaveLength(recipes.length)
  })

  it('TC-FILTER-02: Dinner filter returns only Dinner recipes', () => {
    const result = filterRecipes(recipes, 'Dinner')
    expect(result.length).toBeGreaterThan(0)
    result.forEach(r => expect(r.category).toBe('Dinner'))
  })

  it('TC-FILTER-03: Breakfast filter returns only Breakfast recipes', () => {
    const result = filterRecipes(recipes, 'Breakfast')
    expect(result.length).toBeGreaterThan(0)
    result.forEach(r => expect(r.category).toBe('Breakfast'))
  })

  it('TC-FILTER-04: Lunch filter returns only Lunch recipes', () => {
    const result = filterRecipes(recipes, 'Lunch')
    expect(result.length).toBeGreaterThan(0)
    result.forEach(r => expect(r.category).toBe('Lunch'))
  })

  it('TC-FILTER-05: Desserts filter returns only Desserts recipes', () => {
    const result = filterRecipes(recipes, 'Desserts')
    expect(result.length).toBeGreaterThan(0)
    result.forEach(r => expect(r.category).toBe('Desserts'))
  })

  it('TC-FILTER-06: filters array contains All and all 4 categories', () => {
    expect(filters).toContain('All')
    expect(filters).toContain('Breakfast')
    expect(filters).toContain('Lunch')
    expect(filters).toContain('Dinner')
    expect(filters).toContain('Desserts')
  })

  it('TC-FILTER-07: unknown category returns empty list', () => {
    const result = filterRecipes(recipes, 'Sushi')
    expect(result).toHaveLength(0)
  })

  it('TC-FILTER-08: filters array has exactly 5 entries (All + 4 categories)', () => {
    expect(filters).toHaveLength(5)
  })

  it('TC-FILTER-09: findFilter matches categories ignoring case', () => {
    expect(findFilter('dinner')).toBe('Dinner')
    expect(findFilter('DESSERTS')).toBe('Desserts')
    expect(findFilter('Breakfast')).toBe('Breakfast')
    expect(findFilter('all')).toBe('All')
  })

  it('TC-FILTER-10: findFilter defaults unknown or missing categories to All', () => {
    expect(findFilter('Sushi')).toBe('All')
    expect(findFilter(null)).toBe('All')
    expect(findFilter('')).toBe('All')
  })
})
