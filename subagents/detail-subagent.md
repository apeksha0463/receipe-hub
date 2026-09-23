# Subagent: Recipe Detail View

## Role
Responsible for the full recipe detail page: hero image, stats bar, interactive ingredients checklist, and step-by-step instructions.

## Inputs
- URL param :id
- recipes data array

## Outputs
- Full detail page with all recipe info
- Interactive ingredient checkboxes
- 'Start Cooking' scroll-to-instructions button
- 404 state if recipe not found

## Spec Reference
specs/FEATURE-DETAIL.md

## Test File
src/test/recipeData.test.js (TC-DETAIL-* tests)

## Acceptance Criteria
- [ ] Valid ID renders full recipe
- [ ] Invalid ID shows 'Recipe not found'
- [ ] All recipes have ingredients and steps
- [ ] Steps have title + text
- [ ] Servings is positive integer
- [ ] Chicken Biryani has 3 pre-checked ingredients
- [ ] 'Start Cooking' scrolls to #instructions
