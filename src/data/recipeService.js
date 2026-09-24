import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { categories } from './recipes';

/**
 * Community recipes stored in the Supabase `recipes` table.
 *
 * Rows are converted to the same shape as the static recipes in recipes.js so
 * RecipeCard, search and filters work on both. Differences:
 * - `id` is the numeric row id as a string ("42"); static ids are never numeric
 * - there is no `rating`/`reviews`
 * - `source: 'supabase'`, plus `description` and `fallbackImage` (category photo)
 */

const TABLE = 'recipes';

export const difficulties = ['Easy', 'Medium', 'Hard'];
const categoryNames = categories.map((category) => category.name);

const categoryImage = (name) =>
  (categories.find((category) => category.name === name) ?? categories[0]).image;

const toIngredients = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => ({ name: typeof item === 'string' ? item : (item?.name ?? '') }))
    .filter((item) => item.name.trim() !== '');

const toSteps = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item, index) =>
      typeof item === 'string'
        ? { title: `Step ${index + 1}`, text: item }
        : { title: item?.title || `Step ${index + 1}`, text: item?.text ?? '' },
    )
    .filter((step) => step.text.trim() !== '');

/** Supabase row -> app recipe. */
export const fromRow = (row) => {
  const fallbackImage = categoryImage(row.category);
  return {
    id: String(row.id),
    title: row.title || 'Untitled recipe',
    category: row.category,
    time: Number(row.time) || 0,
    difficulty: difficulties.includes(row.difficulty) ? row.difficulty : 'Easy',
    servings: Number(row.servings) || null,
    description: row.description ?? '',
    image: row.image || fallbackImage,
    fallbackImage,
    ingredients: toIngredients(row.ingredients),
    steps: toSteps(row.instructions),
    source: 'supabase',
    userId: row.user_id,
    createdAt: row.created_at,
  };
};

/** Add Recipe form values -> insert payload. user_id is left to the auth.uid() column default. */
export const toInsertPayload = (form) => ({
  title: form.title.trim(),
  category: form.category,
  difficulty: form.difficulty,
  time: Number(form.time),
  servings: Number(form.servings),
  description: form.description.trim(),
  image: form.image.trim() || null,
  ingredients: form.ingredients
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name })),
  instructions: form.steps
    .filter((step) => step.text.trim() !== '')
    .map((step, index) => ({
      title: step.title.trim() || `Step ${index + 1}`,
      text: step.text.trim(),
    })),
});

const isWholeNumberBetween = (value, min, max) => {
  const number = Number(value);
  return String(value).trim() !== '' && Number.isInteger(number) && number >= min && number <= max;
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Returns { field: message } for each invalid field; empty when the form is valid. */
export const validateRecipeForm = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter a recipe title.';
  else if (form.title.trim().length > 120) errors.title = 'Keep the title under 120 characters.';
  if (!categoryNames.includes(form.category)) errors.category = 'Choose a category.';
  if (!difficulties.includes(form.difficulty)) errors.difficulty = 'Choose a difficulty.';
  if (!isWholeNumberBetween(form.time, 1, 1440)) errors.time = 'Enter the time in whole minutes (1–1440).';
  if (!isWholeNumberBetween(form.servings, 1, 100)) errors.servings = 'Enter servings as a whole number (1–100).';
  if (form.image.trim() && !isHttpUrl(form.image.trim())) {
    errors.image = 'Enter a full image URL starting with http:// or https://.';
  }
  if (!form.ingredients.some((name) => name.trim())) errors.ingredients = 'Add at least one ingredient.';
  if (!form.steps.some((step) => step.text.trim())) errors.steps = 'Add at least one instruction.';
  return errors;
};

/* ---------- Supabase queries (with an in-memory cache) ---------- */

// Cached so returning to /recipes shows community recipes immediately (keeps the
// Back-button scroll position) and a newly added recipe is visible straight away.
let communityCache = null;

export const getCachedCommunityRecipes = () => communityCache;

export const findCachedCommunityRecipe = (id) =>
  communityCache?.find((recipe) => recipe.id === id);

export const clearCommunityRecipeCache = () => {
  communityCache = null;
};

/** True when `id` could be a Supabase row (numeric) and Supabase is configured. */
export const isCommunityRecipeId = (id) => isSupabaseConfigured && /^\d+$/.test(id ?? '');

export async function fetchCommunityRecipes() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  communityCache = data.map(fromRow);
  return communityCache;
}

export async function fetchCommunityRecipe(id) {
  if (!supabase || !isCommunityRecipeId(id)) return null;
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', Number(id)).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

/** The logged-in user's own community recipes, newest first. */
export async function fetchMyRecipes(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

/* ---------- Saving ---------- */

export const SESSION_EXPIRED_MESSAGE = 'Your session expired. Please log in again.';
export const SAVE_FAILED_MESSAGE = 'Your recipe could not be saved. Please try again.';

/**
 * Errors that mean the user is no longer authenticated on the server:
 * 42501 = RLS insert check failed (no auth.uid()), PGRST301/302 = JWT expired/invalid, HTTP 401.
 */
export const isSessionExpiredError = (error) =>
  ['42501', 'PGRST301', 'PGRST302'].includes(error?.code) ||
  error?.status === 401 ||
  /jwt|row-level security/i.test(error?.message ?? '');

// createRecipe only throws errors carrying a user-facing message; the raw Supabase
// error is kept as `cause` (and logged) but never shown.
const saveError = (userMessage, cause, extra = {}) =>
  Object.assign(new Error(userMessage), { userMessage, cause, ...extra });

export async function createRecipe(form) {
  if (!supabase) {
    throw saveError('Recipes cannot be saved because Supabase is not configured.');
  }

  // The stored session is refreshed here if needed; none means it has expired.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw saveError(SESSION_EXPIRED_MESSAGE, null, { sessionExpired: true });
  }

  const { data, error } = await supabase.from(TABLE).insert(toInsertPayload(form)).select().single();
  if (error) {
    console.error('Saving recipe failed:', error);
    if (isSessionExpiredError(error)) {
      throw saveError(SESSION_EXPIRED_MESSAGE, error, { sessionExpired: true });
    }
    throw saveError(SAVE_FAILED_MESSAGE, error);
  }
  const recipe = fromRow(data);
  communityCache = [recipe, ...(communityCache ?? []).filter((item) => item.id !== recipe.id)];
  return recipe;
}

/**
 * Ownership label for a recipe card/detail page:
 * 'Added by you' | 'Community recipe' | null (static built-in recipes).
 */
export const getOwnershipLabel = (recipe, user) => {
  if (recipe?.source !== 'supabase') return null;
  return user && recipe.userId === user.id ? 'Added by you' : 'Community recipe';
};

/** onError handler that swaps a broken image URL for the recipe's category photo once. */
export const imageFallbackHandler = (fallback) =>
  fallback
    ? (event) => {
        const img = event.currentTarget;
        if (img.dataset.fallback) return;
        img.dataset.fallback = 'true';
        img.src = fallback;
      }
    : undefined;
