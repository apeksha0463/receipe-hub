# Day 3 Deliverables — Spec-Driven Testing with Vitest

**Project:** RecipeHub (React + Vite)
**Date:** 2026-09-23
**Result:** 3 test files, **30/30 tests passed**

---

## 1. Plugin Installed: Vitest

**Command run:**

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Result:** `added 145 packages, and audited 146 packages in 21s` · `found 0 vulnerabilities`

| Package | Installed version | Purpose |
|---|---|---|
| `vitest` | 5.0.1 | Test runner, native to Vite |
| `@vitest/ui` | 5.0.1 | Browser UI for test results (`npm run test:ui`) |
| `@testing-library/react` | 16.3.3 | Rendering React components in tests |
| `@testing-library/jest-dom` | 7.0.1 | DOM matchers (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | 14.6.7 | Simulating user interaction |
| `jsdom` | 29.1.1 | Browser-like DOM environment for Node |

**Configuration changes:**

- **`vite.config.js`**: added a `test` block (`globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.js'`)
- **`package.json`**: added scripts `"test": "vitest run"` and `"test:ui": "vitest --ui"`
- **`src/test/setup.js`**: imports `@testing-library/jest-dom`

**Source changes:** added two pure utility functions to `src/data/recipes.js`:

- `searchRecipes(recipeList, query)`: case-insensitive partial title match. An empty or whitespace-only query returns all recipes.
- `filterRecipes(recipeList, category)`: `'All'` returns all recipes. Any other value returns only recipes whose category matches exactly.

`npm run build` still succeeds after the config change.

---

## 2. Feature Specs (`specs/`)

| Spec file | Feature | Key expected behaviours |
|---|---|---|
| `specs/FEATURE-SEARCH.md` | Recipe Search | Case-insensitive, partial match, empty/whitespace query = all recipes, no-match message, Home search goes to `/recipes?q=` |
| `specs/FEATURE-FILTER.md` | Category Filter | All/Breakfast/Lunch/Dinner/Desserts pills, `--active` class, `?category=` pre-selects the filter, `filters` starts with `All` |
| `specs/FEATURE-CARD.md` | Recipe Card Display | Required fields present, unique IDs, positive time, rating from 1 to 5, difficulty is Easy/Medium/Hard, links to `/recipes/<id>` |
| `specs/FEATURE-DETAIL.md` | Recipe Detail View | `getRecipeById` finds valid IDs and returns undefined for invalid ones, non-empty ingredients/steps, steps have title + text, integer servings, Biryani has 3 pre-checked items |
| `specs/FEATURE-NAV.md` | Navigation | Logo goes to `/`, Recipes link goes to `/recipes`, active link state, NotFound page for unknown routes, 8 recipes, popular IDs exist |

---

## 3. Test Cases

### `src/test/search.test.js`: Recipe Search

| TC | Input / action | Expected result |
|---|---|---|
| TC-SEARCH-01 | `searchRecipes(recipes, '')` | All 8 recipes |
| TC-SEARCH-02 | `'Pasta Carbonara'` | First result's title contains "Carbonara" |
| TC-SEARCH-03 | `'pasta'` vs `'PASTA'` | Same result count |
| TC-SEARCH-04 | `'pan'` | Matches "Fluffy Pancakes" |
| TC-SEARCH-05 | `'xyznonexistent'` | Empty array |
| TC-SEARCH-06 | `'   '` | All 8 recipes |
| TC-SEARCH-07 | `'salmon'` | Grilled Salmon found |

### `src/test/filter.test.js`: Category Filter

| TC | Input / action | Expected result |
|---|---|---|
| TC-FILTER-01 | `filterRecipes(recipes, 'All')` | All 8 recipes |
| TC-FILTER-02 | `'Dinner'` | Non-empty, all Dinner |
| TC-FILTER-03 | `'Breakfast'` | Non-empty, all Breakfast |
| TC-FILTER-04 | `'Lunch'` | Non-empty, all Lunch |
| TC-FILTER-05 | `'Desserts'` | Non-empty, all Desserts |
| TC-FILTER-06 | `filters` array | Contains All + 4 categories |
| TC-FILTER-07 | `'Sushi'` | Empty array |
| TC-FILTER-08 | `filters.length` | Exactly 5 |

### `src/test/recipeData.test.js`: Card / Detail / Nav data

| TC | Input / action | Expected result |
|---|---|---|
| TC-CARD-01 | Every recipe | Has id, title, category, time, difficulty, image, rating |
| TC-CARD-02 | All IDs | Unique |
| TC-CARD-03 | `time` | Number > 0 |
| TC-CARD-04 | `rating` | From 1 to 5 |
| TC-CARD-05 | `difficulty` | Easy / Medium / Hard |
| TC-DETAIL-01 | `getRecipeById('classic-pasta-carbonara')` | Title "Classic Pasta Carbonara" |
| TC-DETAIL-02 | `getRecipeById('nonexistent-id')` | `undefined` |
| TC-DETAIL-03 | `ingredients` | Non-empty array |
| TC-DETAIL-04 | `steps` | Non-empty array |
| TC-DETAIL-05 | Each step | `title` and `text` are strings |
| TC-DETAIL-06 | `servings` | Positive integer |
| TC-DETAIL-07 | Chicken Biryani ingredients | Exactly 3 with `checked: true` |
| TC-NAV-01 | `recipes.length` | 8 |
| TC-NAV-02 | Popular IDs (carbonara, salmon, smoothie bowl) | All exist |
| TC-NAV-03 | Recipe IDs | Kebab-case strings |

**Total: 30 test cases** (7 SEARCH + 8 FILTER + 5 CARD + 7 DETAIL + 3 NAV)

---

## 4. Actual Test Results

### `npm test` (exact output)

```
> recipehub@1.0.0 test
> vitest run


 RUN  v5.0.1 C:/Users/apeks/receipe-hub


 Test Files  3 passed (3)
      Tests  30 passed (30)
   Start at  10:58:53
   Duration  1.77s (environment 75%, setup 12%, transform 8%, import 4%, worker 1%)
```

### Per-test breakdown (`npx vitest run --reporter=verbose`)

```
 RUN  v5.0.1 C:/Users/apeks/receipe-hub

 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-01: empty query returns all recipes 2ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-02: exact title match finds correct recipe 0ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-03: case-insensitive search works 0ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-04: partial match works (pan -> Pancakes) 0ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-05: no match returns empty array 0ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-06: whitespace-only query returns all recipes 0ms
 ✓ src/test/search.test.js > Feature: Recipe Search (TC-SEARCH) > TC-SEARCH-07: search for salmon finds grilled salmon 0ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-01: All filter returns all recipes 3ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-02: Dinner filter returns only Dinner recipes 1ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-03: Breakfast filter returns only Breakfast recipes 0ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-04: Lunch filter returns only Lunch recipes 0ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-05: Desserts filter returns only Desserts recipes 0ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-06: filters array contains All and all 4 categories 1ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-07: unknown category returns empty list 0ms
 ✓ src/test/filter.test.js > Feature: Category Filter (TC-FILTER) > TC-FILTER-08: filters array has exactly 5 entries (All + 4 categories) 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Card Data (TC-CARD) > TC-CARD-01: all recipes have required fields 4ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Card Data (TC-CARD) > TC-CARD-02: all recipe ids are unique 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Card Data (TC-CARD) > TC-CARD-03: cooking times are positive numbers 1ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Card Data (TC-CARD) > TC-CARD-04: ratings are between 1 and 5 1ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Card Data (TC-CARD) > TC-CARD-05: difficulty is one of Easy/Medium/Hard 2ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-01: getRecipeById returns correct recipe 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-02: getRecipeById returns undefined for invalid id 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-03: all recipes have non-empty ingredients array 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-04: all recipes have non-empty steps array 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-05: each step has title and text strings 1ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-06: servings is a positive integer 0ms
 ✓ src/test/recipeData.test.js > Feature: Recipe Detail Data (TC-DETAIL) > TC-DETAIL-07: chicken biryani starts with exactly 3 pre-checked ingredients 0ms
 ✓ src/test/recipeData.test.js > Feature: Navigation Data (TC-NAV) > TC-NAV-01: data has exactly 8 recipes total 1ms
 ✓ src/test/recipeData.test.js > Feature: Navigation Data (TC-NAV) > TC-NAV-02: all popular recipe ids exist in data 0ms
 ✓ src/test/recipeData.test.js > Feature: Navigation Data (TC-NAV) > TC-NAV-03: recipe ids are kebab-case strings 0ms

 Test Files  3 passed (3)
      Tests  30 passed (30)
   Start at  10:58:10
   Duration  40.60s (environment 84%, setup 15%)
```

(The first run took 40.6s because jsdom was cold-starting. The `npm test` run right after took 1.77s.)

---

## 5. Subagent Files Created (`subagents/`)

| File | Owns | Spec | Tests |
|---|---|---|---|
| `subagents/search-subagent.md` | Keyword search (Home + Recipes) | `specs/FEATURE-SEARCH.md` | `src/test/search.test.js` |
| `subagents/filter-subagent.md` | Category filter pills | `specs/FEATURE-FILTER.md` | `src/test/filter.test.js` |
| `subagents/card-subagent.md` | RecipeCard grid rendering | `specs/FEATURE-CARD.md` | `src/test/recipeData.test.js` (TC-CARD-*) |
| `subagents/detail-subagent.md` | Recipe detail page | `specs/FEATURE-DETAIL.md` | `src/test/recipeData.test.js` (TC-DETAIL-*) |
| `subagents/nav-subagent.md` | Navbar, routing, 404 | `specs/FEATURE-NAV.md` | `src/test/recipeData.test.js` (TC-NAV-*) |

---

## 6. PASS / FAIL Summary

| Feature | Test file | Tests | Passed | Failed | Status |
|---|---|---|---|---|---|
| Recipe Search | `search.test.js` | 7 | 7 | 0 | ✅ PASS |
| Category Filter | `filter.test.js` | 8 | 8 | 0 | ✅ PASS |
| Recipe Card Data | `recipeData.test.js` | 5 | 5 | 0 | ✅ PASS |
| Recipe Detail Data | `recipeData.test.js` | 7 | 7 | 0 | ✅ PASS |
| Navigation Data | `recipeData.test.js` | 3 | 3 | 0 | ✅ PASS |
| **Total** | **3 files** | **30** | **30** | **0** | **✅ ALL PASS** |

---

## 7. Notes and Coverage Gaps

- **Logic and data only.** These 30 tests call the data layer and pure functions directly. They do not render any component. Some spec items still have no automated test:
  - "No recipes found" message, the `--active` pill class, and Home search navigating to `/recipes?q=`
  - `aria-current` on active nav links, the NotFound page and its back link
  - RecipeCard linking to `/recipes/<id>`, and "Start Cooking" scrolling to `#instructions`

  React Testing Library and jsdom are installed and configured, so component tests for these can be added next.
- **Duplicated logic.** `src/pages/Recipes.jsx` still has its own inline search/filter code. It does not call the new `searchRecipes`/`filterRecipes` helpers yet, so these tests check the same rules but not the code the page actually runs. The next step is to refactor the page to use the helpers, so the tests cover the real UI path.
- **Unknown category behaviour.** `filterRecipes(recipes, 'Sushi')` returns `[]` (TC-FILTER-07). The spec's "unknown category defaults to 'All'" rule belongs to the Recipes page, which checks the URL parameter first. `filterRecipes` does not handle it.
