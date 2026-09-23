# Subagent: Recipe Search

## Role
Responsible for all search functionality: filtering recipes by keyword on both Home and Recipes pages.

## Inputs
- User-typed query string
- Full recipes array

## Outputs
- Filtered subset of recipes matching the query
- Navigation to /recipes?q=<query> from Home page

## Spec Reference
specs/FEATURE-SEARCH.md

## Test File
src/test/search.test.js

## Acceptance Criteria
- [ ] Empty query returns all recipes
- [ ] Case-insensitive matching
- [ ] Partial match support
- [ ] Whitespace-only treated as empty
- [ ] No match shows 'No recipes found' message
- [ ] Home search navigates to Recipes page with query param
