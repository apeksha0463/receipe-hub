# Feature Spec: Navigation

## What it does
Navbar provides links to Home and Recipes pages. Active link is highlighted.

## Inputs
- Current URL path

## Expected Behaviour
- Logo links to /
- 'Recipes' nav link goes to /recipes
- Active route link has aria-current='page' or active class
- Unknown routes show NotFound page with back link
- Back to home link on NotFound goes to /
- Total recipes in data: 8
- All popular recipe IDs referenced in Home exist in data
