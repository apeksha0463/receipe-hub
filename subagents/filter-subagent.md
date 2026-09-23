# Subagent: Category Filter

## Role
Responsible for filtering recipes by category using filter pills on the Recipes page.

## Inputs
- Selected category: 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Desserts'
- URL parameter ?category=<name>

## Outputs
- Filtered subset of recipes by category
- Updated URL with category param
- Active filter pill styling

## Spec Reference
specs/FEATURE-FILTER.md

## Test File
src/test/filter.test.js

## Acceptance Criteria
- [ ] 'All' returns all 8 recipes
- [ ] Category filter shows only matching recipes
- [ ] Active pill has --active CSS class
- [ ] Home category cards link to correct filter
- [ ] Unknown category defaults to 'All'
- [ ] filters array has 5 entries
