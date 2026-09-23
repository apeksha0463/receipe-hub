# Feature Spec: Recipe Search

## What it does
Users can type a query into the search bar (on Home or Recipes page) to filter the recipe list.

## Inputs
- Search query string (text typed by user)
- Empty string (clear search)

## Expected Behaviour (what 'correct' means)
- Typing 'pasta' shows only recipes whose title contains 'pasta' (case-insensitive)
- Typing a non-existent term shows 'No recipes found' message
- Empty query shows all recipes
- Search is case-insensitive
- Partial matches work (e.g. 'pan' matches 'Fluffy Pancakes')
- Home search bar navigates to /recipes?q=<query> on submit
- Whitespace-only query treated as empty
