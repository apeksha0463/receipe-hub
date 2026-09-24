# Feature Spec: Add Recipe + Community Recipes (Supabase)

## What it does
Logged-in users add recipes at /recipes/new. They are saved to the Supabase
`recipes` table and shown to everyone next to the 8 built-in recipes.

## Inputs
- Title, category (Breakfast/Lunch/Dinner/Desserts), difficulty (Easy/Medium/Hard)
- Time in minutes (1–1440), servings (1–100), optional description, optional image URL
- One or more ingredients; one or more instructions (optional step title + text)

## Expected Behaviour
- Missing or invalid fields show a message next to the field, focus the first one, and nothing is saved
- Image URL must start with http:// or https://; empty uses the category photo
- Saving inserts one row: ingredients as [{ name }], instructions as [{ title, text }]
- The app never sends user_id; the column default auth.uid() sets it to the logged-in user
- RLS rejects inserts from logged-out users (see supabase/policies.sql)
- After saving, the new recipe's detail page opens (/recipes/<id>), replacing the form in history,
  so Back does not return to an empty form
- Community recipes are listed first (newest first) on /recipes, then the 8 built-in recipes;
  search and category filters work on both
- Cards and detail pages show 'Added by you' (own recipe) or 'Community recipe' (anyone else's,
  or when logged out); built-in recipes show no label
- A failed save shows a friendly message, never the raw Supabase error; the button is disabled while saving
- Expired session (no session, RLS 42501 or JWT error): "Your session expired. Please log in again."
  with a 'Log in again' button; the form is kept as a draft (sessionStorage, this tab) and restored after login
- Long words/URLs in the title, description, ingredients and steps wrap instead of scrolling sideways
- Community recipe detail pages load by numeric id for everyone; no rating is shown
- Unknown numeric id: 'Recipe not found'; Supabase error: 'Recipe unavailable'
- If Supabase can't be reached, /recipes still shows the 8 built-in recipes with a message
- A broken image URL falls back to the category photo

## Tests
src/test/addRecipe.test.jsx (TC-ADD, TC-ADD-NAV, TC-SESSION, TC-COMMUNITY),
src/test/profile.test.jsx (TC-OWNER, TC-ORDER),
src/test/recipeService.test.js (TC-DB-*, TC-VALIDATE, TC-OWNER-UNIT)
