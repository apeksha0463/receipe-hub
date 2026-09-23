# Feature Spec: Recipe Card Display

## What it does
RecipeCard component displays a recipe thumbnail, title, category, cooking time, and difficulty.

## Inputs
- recipe object: { id, title, category, time, difficulty, image, rating, reviews, servings, ingredients, steps }
- image prop (optional override for home page)
- timeUnit prop (optional)

## Expected Behaviour
- Every recipe has required fields: id, title, category, time, difficulty, image, rating
- All recipe IDs are unique
- Cooking times are positive numbers
- Ratings are between 1 and 5
- Difficulty is one of: Easy, Medium, Hard
- Card links to /recipes/<id>
