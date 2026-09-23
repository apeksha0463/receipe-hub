# Subagent: Navigation

## Role
Responsible for site-wide navigation: Navbar links, React Router routing, and 404 handling.

## Inputs
- Current URL path
- React Router location

## Outputs
- Correct page rendered per route
- Active nav link styling
- 404 page for unknown routes

## Spec Reference
specs/FEATURE-NAV.md

## Test File
src/test/recipeData.test.js (TC-NAV-* tests)

## Acceptance Criteria
- [ ] / renders Home page
- [ ] /recipes renders Recipes page
- [ ] /recipes/:id renders RecipeDetail
- [ ] Unknown route renders NotFound
- [ ] All 8 recipe IDs are kebab-case
- [ ] All popular recipe IDs exist in data
- [ ] Logo and nav links are correct
