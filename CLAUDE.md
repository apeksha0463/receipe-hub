# RecipeHub — Claude Code Instructions

## Project

RecipeHub is a multi-page recipe discovery website.

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- Supabase (auth + community `recipes` table) via @supabase/supabase-js

## Pages

The website contains:

1. Home
2. Recipes
3. Recipe Details
4. Log in / Sign up
5. Add Recipe (logged-in users only)
6. Profile / My Recipes (logged-in users only)

## Folder Structure

Use:

src/components/ for reusable components

src/pages/ for page components

src/assets/ for images and static assets

src/data/ for static recipes (recipes.js) and Supabase queries (recipeService.js)

src/context/, src/hooks/, src/lib/ for auth state, shared hooks and the Supabase client

supabase/policies.sql for the RLS policies (run in the Supabase SQL editor)

## Naming Conventions

React components must use PascalCase.

Examples:

Navbar.jsx
RecipeCard.jsx
CategoryCard.jsx
RecipeDetails.jsx

Variables and functions should use camelCase.

Examples:

recipeList
searchRecipes()
filterRecipes()

## Development Rules

- Keep the website responsive.
- Reuse components whenever possible.
- Follow the Figma design.
- Keep the navigation consistent.
- Do not duplicate components unnecessarily.
- Keep the code simple and readable.
- Do not add unnecessary dependencies.

## Restrictions

Do not:

- Delete existing pages without asking.
- Change the overall Figma design without asking.
- Remove functionality without asking.
- Change the technology stack without asking.
- Add unnecessary libraries.
- Modify configuration files unless required.

## Testing

Every feature must be tested.

For each feature record:

- Input/action
- Expected result
- Actual result

A feature is not complete until it has been tested.