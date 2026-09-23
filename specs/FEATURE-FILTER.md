# Feature Spec: Category Filter

## What it does
Users can filter recipes by category using filter pills on the Recipes page.

## Inputs
- Category name: 'All', 'Breakfast', 'Lunch', 'Dinner', 'Desserts'
- URL parameter: ?category=<name>

## Expected Behaviour
- Clicking 'Dinner' shows only Dinner recipes
- Clicking 'All' shows all recipes
- Active filter pill has --active CSS class
- Category links from Home page pre-select the correct filter
- Unknown category defaults to 'All'
- filters array always starts with 'All'
