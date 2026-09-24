# RecipeHub — Website Specification

## 1. Project Overview

RecipeHub is a multi-page recipe website that allows users to
discover recipes and view detailed cooking information.

## 2. Target Users

The website is designed for people who want to discover recipes
and easily view ingredients and cooking instructions.

## 3. Website Pages

### Home Page

The Home page will contain:

- RecipeHub logo
- Navigation bar
- Search bar
- Popular recipes
- Recipe categories
- Featured recipes

### Recipes Page

The Recipes page will contain:

- Recipe list
- Search bar
- Category filters
- Recipe cards
- Recipe images
- Cooking time

### Recipe Details Page

The Recipe Details page will contain:

- Recipe image
- Recipe name
- Cooking time
- Difficulty
- Ingredients
- Cooking instructions
- Start Cooking button
- Description (community recipes only)

### Log in / Sign up Pages

- Email and password forms using Supabase Auth
- Navbar shows "Log in" when logged out, "Add Recipe" and "Log out" when logged in

### Profile Page (/profile, logged-in users only)

- The logged-in user's email
- "My Recipes": only the community recipes this user added, as recipe cards
- Friendly empty state with an "Add Recipe" button

### Add Recipe Page (/recipes/new, logged-in users only)

- Title, category, difficulty, time, servings, description, image URL
- Ingredient and instruction rows that can be added and removed
- Saves to the Supabase `recipes` table; the recipe belongs to the logged-in user

## 4. Main User Actions

Users should be able to:

- Navigate between pages
- Search for recipes
- Browse recipes
- Filter recipes by category
- Open a recipe
- View ingredients
- View cooking instructions
- Sign up, log in and log out
- Add their own recipe (logged in), which everyone can then browse

## 5. Design Requirements

- Clean and modern design
- Easy navigation
- Responsive layout
- Consistent typography
- Consistent colours
- Recipe cards should be reusable
- Images should be clearly visible

## 6. Technology Stack

- React
- Vite
- JavaScript
- CSS
- Supabase (authentication and the community recipes table)
- Figma
- Claude Code
- Figma MCP
- GitHub MCP

## 7. Initial Data

The website uses 8 built-in sample recipes, plus community recipes stored in Supabase.
The sample recipes always show, even if Supabase is unavailable.

Example recipes:

- Pasta
- Chicken Biryani
- Pancakes
- Chocolate Cake
- Vegetable Fried Rice