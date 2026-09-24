# Subagent: Recipe Card

## Role
Responsible for rendering recipe thumbnail cards in the grid on Home and Recipes pages.

## Inputs
- recipe: { id, title, category, time, difficulty, image, rating, reviews }
- image: optional prop override

## Outputs
- Rendered card with image, title, time, difficulty badge
- Clickable link to /recipes/<id>

## Spec Reference
specs/FEATURE-CARD.md

## Test File
src/test/recipeData.test.js (TC-CARD-* tests)

## Acceptance Criteria
- [ ] All 8 recipes have required fields
- [ ] All IDs are unique
- [ ] Time is a positive number
- [ ] Rating is 1-5
- [ ] Difficulty is Easy/Medium/Hard
- [ ] Card links to correct detail page
