# Feature Spec: Authentication (Supabase)

## What it does
Users can sign up, log in and log out with email and password (Supabase Auth).
Logged-in users can open the Add Recipe page; everyone can browse all recipes.

## Inputs
- Email and password (Sign up also asks to confirm the password)
- The saved Supabase session (kept in localStorage by supabase-js)

## Expected Behaviour
- Logged out: navbar shows 'Log in'; logged in: 'Add Recipe', 'Profile' and 'Log out'
- 'Log out' asks "Are you sure you want to log out?": Cancel (or Escape) keeps the user logged in;
  confirming signs out and goes Home (also from Add Recipe / Profile)
- /profile is protected, shows the user's email and "My Recipes" (only rows where user_id = the user's id)
- My Recipes with no recipes shows a friendly empty state with an 'Add Recipe' button; cards open the detail page
- Sign up with a new email logs straight in and goes Home (email confirmation is off in Supabase)
- If email confirmation is ever turned on, Sign up shows 'Check your email' instead
- Sign up rejects an empty email, a password under 6 characters, and mismatched passwords
- Log in with a wrong password shows Supabase's error and stays on /login
- Log in with empty fields shows field errors without calling Supabase
- A logged-in user visiting /login or /signup is sent Home
- /recipes/new redirects logged-out users to /login, then returns them to /recipes/new after logging in
- While the saved session is being checked, /recipes/new shows 'Checking your session…' (no redirect flash)
- Below 860px wide the navbar links move into the hamburger menu (six links when logged in)
- Home, Recipes and all recipe detail pages work without logging in
- Titles: 'Log In | RecipeHub', 'Sign Up | RecipeHub', 'Add Recipe | RecipeHub', 'Profile | RecipeHub'
- Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the site still works with the static recipes; login is disabled with a message

## Tests
src/test/auth.test.jsx (TC-AUTH-NAV, TC-SIGNUP, TC-LOGIN, TC-PROTECT, TC-PUBLIC),
src/test/profile.test.jsx (TC-PROFILE, TC-LOGOUT)
