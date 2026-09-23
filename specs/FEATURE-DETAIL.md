# Feature Spec: Recipe Detail View

## What it does
Shows full recipe info: hero image, stats, ingredients checklist, step-by-step instructions.

## Inputs
- URL param :id matching a recipe ID
- Invalid ID (recipe not found)

## Expected Behaviour
- Valid ID: renders recipe title, time, servings, difficulty, ingredients list, steps
- Invalid ID: getRecipeById returns undefined
- All recipes have non-empty ingredients arrays
- All recipes have non-empty steps arrays
- Each step has a title (string) and text (string)
- Servings is a positive integer
- Chicken Biryani starts with exactly 3 pre-checked ingredients (checked: true in data)
- getRecipeById('classic-pasta-carbonara') returns the correct recipe
