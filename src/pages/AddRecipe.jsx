import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { categories } from '../data/recipes';
import { SAVE_FAILED_MESSAGE, createRecipe, difficulties, validateRecipeForm } from '../data/recipeService';
import './AddRecipe.css';

const emptyStep = { title: '', text: '' };

const initialForm = {
  title: '',
  category: '',
  difficulty: '',
  time: '',
  servings: '',
  description: '',
  image: '',
  ingredients: [''],
  steps: [emptyStep],
};

// The form is kept in sessionStorage (this tab only) so it survives an expired session:
// the user logs in again, is sent back here, and the draft is restored.
const draftKey = (userId) => `recipehub:add-recipe-draft:${userId}`;

const loadDraft = (userId) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey(userId)));
    return saved && Array.isArray(saved.ingredients) && Array.isArray(saved.steps)
      ? { ...initialForm, ...saved }
      : initialForm;
  } catch {
    return initialForm;
  }
};

const saveDraft = (userId, form) => {
  try {
    if (form === initialForm) sessionStorage.removeItem(draftKey(userId));
    else sessionStorage.setItem(draftKey(userId), JSON.stringify(form));
  } catch {
    // Storage unavailable (private mode, quota): the form still works, just without a draft.
  }
};

// Order used to focus the first invalid field after a failed submit.
const fieldIds = {
  title: 'recipe-title',
  category: 'recipe-category',
  difficulty: 'recipe-difficulty',
  time: 'recipe-time',
  servings: 'recipe-servings',
  image: 'recipe-image',
  ingredients: 'recipe-ingredient-1',
  steps: 'recipe-step-1-text',
};

export default function AddRecipe() {
  useDocumentTitle('Add Recipe | RecipeHub');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [form, setForm] = useState(() => loadDraft(user.id));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null); // { message, sessionExpired }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    saveDraft(user.id, form);
  }, [user.id, form]);

  const setField = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  const setIngredient = (index, value) =>
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, i) => (i === index ? value : item)),
    }));

  const addIngredient = () => setForm((current) => ({ ...current, ingredients: [...current.ingredients, ''] }));

  const removeIngredient = (index) =>
    setForm((current) => ({ ...current, ingredients: current.ingredients.filter((_, i) => i !== index) }));

  const setStep = (index, key, value) =>
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, i) => (i === index ? { ...step, [key]: value } : step)),
    }));

  const addStep = () => setForm((current) => ({ ...current, steps: [...current.steps, emptyStep] }));

  const removeStep = (index) =>
    setForm((current) => ({ ...current, steps: current.steps.filter((_, i) => i !== index) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateRecipeForm(form);
    setErrors(nextErrors);
    setSubmitError(null);
    const firstInvalid = Object.keys(fieldIds).find((name) => nextErrors[name]);
    if (firstInvalid) {
      document.getElementById(fieldIds[firstInvalid])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const recipe = await createRecipe(form);
      saveDraft(user.id, initialForm);
      // Replace, so Back from the new recipe skips this (now empty) form.
      navigate(`/recipes/${recipe.id}`, { replace: true });
    } catch (error) {
      // createRecipe only throws user-facing messages; raw Supabase errors are never shown.
      setSubmitError({
        message: error?.userMessage ?? SAVE_FAILED_MESSAGE,
        sessionExpired: Boolean(error?.sessionExpired),
      });
      setSubmitting(false);
    }
  };

  return (
    <main className="page add-recipe">
      <header className="add-recipe__header">
        <h1 className="section-title">Add a Recipe</h1>
        <p className="add-recipe__intro">Share a recipe with the RecipeHub community.</p>
      </header>

      <form className="add-recipe__form" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div className="form-alert add-recipe__alert" role="alert">
            <p>{submitError.message}</p>
            {submitError.sessionExpired && (
              // Signing out sends ProtectedRoute to /login, which returns here with the draft.
              <button type="button" className="btn" onClick={() => signOut()}>
                Log in again
              </button>
            )}
          </div>
        )}

        <section className="add-recipe__panel" aria-labelledby="details-title">
          <h2 className="panel-title" id="details-title">
            Details
          </h2>
          <FormField
            id="recipe-title"
            label="Title"
            value={form.title}
            error={errors.title}
            onChange={setField('title')}
            maxLength={120}
          />
          <div className="add-recipe__grid">
            <FormField
              as="select"
              id="recipe-category"
              label="Category"
              value={form.category}
              error={errors.category}
              onChange={setField('category')}
            >
              <option value="">Choose…</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </FormField>
            <FormField
              as="select"
              id="recipe-difficulty"
              label="Difficulty"
              value={form.difficulty}
              error={errors.difficulty}
              onChange={setField('difficulty')}
            >
              <option value="">Choose…</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </FormField>
            <FormField
              id="recipe-time"
              label="Time (min)"
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="1"
              value={form.time}
              error={errors.time}
              onChange={setField('time')}
            />
            <FormField
              id="recipe-servings"
              label="Servings"
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={form.servings}
              error={errors.servings}
              onChange={setField('servings')}
            />
          </div>
          <FormField
            as="textarea"
            id="recipe-description"
            label="Description (optional)"
            rows={3}
            value={form.description}
            onChange={setField('description')}
          />
          <FormField
            id="recipe-image"
            label="Image URL (optional)"
            hint="Leave empty to use the category photo."
            type="url"
            placeholder="https://…"
            value={form.image}
            error={errors.image}
            onChange={setField('image')}
          />
        </section>

        <section className="add-recipe__panel" aria-labelledby="ingredients-form-title">
          <h2 className="panel-title" id="ingredients-form-title">
            Ingredients
          </h2>
          {errors.ingredients && <p className="form-error">{errors.ingredients}</p>}
          <ol className="add-recipe__rows">
            {form.ingredients.map((ingredient, index) => (
              // Rows have no stable id; index keys are fine because rows only change via these buttons.
              <li className="add-recipe__row" key={index}>
                <FormField
                  id={`recipe-ingredient-${index + 1}`}
                  label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(event) => setIngredient(index, event.target.value)}
                />
                {form.ingredients.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--ghost add-recipe__remove"
                    onClick={() => removeIngredient(index)}
                    aria-label={`Remove ingredient ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--ghost add-recipe__add" onClick={addIngredient}>
            + Add ingredient
          </button>
        </section>

        <section className="add-recipe__panel" aria-labelledby="steps-form-title">
          <h2 className="panel-title" id="steps-form-title">
            Instructions
          </h2>
          {errors.steps && <p className="form-error">{errors.steps}</p>}
          <ol className="add-recipe__rows">
            {form.steps.map((step, index) => (
              <li className="add-recipe__row add-recipe__row--step" key={index}>
                <div className="add-recipe__step-fields">
                  <FormField
                    id={`recipe-step-${index + 1}-title`}
                    label={`Step ${index + 1} title (optional)`}
                    value={step.title}
                    onChange={(event) => setStep(index, 'title', event.target.value)}
                  />
                  <FormField
                    as="textarea"
                    id={`recipe-step-${index + 1}-text`}
                    label={`Step ${index + 1} instructions`}
                    rows={3}
                    value={step.text}
                    onChange={(event) => setStep(index, 'text', event.target.value)}
                  />
                </div>
                {form.steps.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--ghost add-recipe__remove"
                    onClick={() => removeStep(index)}
                    aria-label={`Remove step ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--ghost add-recipe__add" onClick={addStep}>
            + Add step
          </button>
        </section>

        <div className="add-recipe__actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save recipe'}
          </button>
        </div>
      </form>
    </main>
  );
}
