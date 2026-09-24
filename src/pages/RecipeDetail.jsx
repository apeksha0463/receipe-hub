import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import play from '../assets/icons/play.svg';
import star from '../assets/icons/star.svg';
import clockAccent from '../assets/icons/clock-accent.svg';
import users from '../assets/icons/users.svg';
import shield from '../assets/icons/shield.svg';
import check from '../assets/icons/check.svg';
import { getRecipeById } from '../data/recipes';
import {
  fetchCommunityRecipe,
  findCachedCommunityRecipe,
  imageFallbackHandler,
  isCommunityRecipeId,
} from '../data/recipeService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import OwnershipLabel from '../components/OwnershipLabel';
import './RecipeDetail.css';

function IngredientsList({ ingredients }) {
  // Items flagged `checked` in the data start ticked (as in the Figma frame).
  const [checked, setChecked] = useState(
    () => new Set(ingredients.flatMap((item, index) => (item.checked ? [index] : []))),
  );

  const toggle = (index) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <ul className="ingredients__list">
      {ingredients.map((item, index) => (
        <li key={`${index}-${item.name}`}>
          <label className="ingredient">
            <input
              type="checkbox"
              className="ingredient__input"
              checked={checked.has(index)}
              onChange={() => toggle(index)}
            />
            <span className="ingredient__box" aria-hidden="true">
              <img src={check} alt="" width="12" height="12" />
            </span>
            <span className="ingredient__text">{item.name}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/**
 * Finds the recipe for :id: a static recipe, a cached community recipe, or one
 * fetched from Supabase (numeric ids only).
 */
function useRecipe(id) {
  const known = getRecipeById(id) ?? findCachedCommunityRecipe(id);
  const needsFetch = !known && isCommunityRecipeId(id);
  const [fetched, setFetched] = useState(null); // { id, recipe, failed }

  useEffect(() => {
    if (!needsFetch) return undefined;
    let active = true;
    fetchCommunityRecipe(id)
      .then((recipe) => active && setFetched({ id, recipe, failed: false }))
      .catch(() => active && setFetched({ id, recipe: null, failed: true }));
    return () => {
      active = false;
    };
  }, [id, needsFetch]);

  if (known) return { recipe: known, status: 'ready' };
  if (!needsFetch) return { recipe: null, status: 'ready' };
  if (fetched?.id !== id) return { recipe: null, status: 'loading' };
  return { recipe: fetched.recipe, status: fetched.failed ? 'error' : 'ready' };
}

export default function RecipeDetail() {
  const { id } = useParams();
  const { recipe, status } = useRecipe(id);
  useDocumentTitle(
    recipe
      ? `${recipe.title} | RecipeHub`
      : status === 'loading'
        ? 'Loading Recipe | RecipeHub'
        : 'Recipe Not Found | RecipeHub',
  );

  if (status === 'loading') {
    return (
      <main className="page detail detail--missing">
        <p className="detail__missing-text" role="status">
          Loading recipe…
        </p>
      </main>
    );
  }

  if (!recipe) {
    const failed = status === 'error';
    return (
      <main className="page detail detail--missing">
        <h1 className="section-title">{failed ? 'Recipe unavailable' : 'Recipe not found'}</h1>
        <p className="detail__missing-text">
          {failed
            ? 'This recipe could not be loaded right now. Please try again later.'
            : 'We couldn’t find the recipe you were looking for.'}
        </p>
        <Link to="/recipes" className="btn">
          Browse all recipes
        </Link>
      </main>
    );
  }

  const scrollToInstructions = () => {
    document.getElementById('instructions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="page detail">
      <div className="detail__hero">
        <img
          src={recipe.heroImage ?? recipe.image}
          alt={recipe.title}
          onError={imageFallbackHandler(recipe.fallbackImage)}
        />
      </div>

      <section className="detail__overview">
        <OwnershipLabel recipe={recipe} />
        <div className="detail__heading">
          <h1 className="detail__title">{recipe.title}</h1>
          <button type="button" className="btn" onClick={scrollToInstructions}>
            Start Cooking
            <img src={play} alt="" width="18" height="18" />
          </button>
        </div>

        {recipe.description && <p className="detail__description">{recipe.description}</p>}

        <ul className="stats">
          {/* Community recipes have no ratings yet. */}
          {recipe.rating != null && (
            <li className="stat">
              <img src={star} alt="" width="20" height="20" />
              <span>
                {recipe.rating.toFixed(1)}{' '}
                <span className="stat__muted"> ({recipe.reviews} reviews)</span>
              </span>
            </li>
          )}
          <li className="stat">
            <img src={clockAccent} alt="" width="20" height="20" />
            <span>
              {recipe.time} min <span className="stat__muted"> (prep + cook)</span>
            </span>
          </li>
          {recipe.servings && (
            <li className="stat">
              <img src={users} alt="" width="20" height="20" />
              <span>
                {recipe.servings} {recipe.servings === 1 ? 'Serving' : 'Servings'}
              </span>
            </li>
          )}
          <li className="stat">
            <img src={shield} alt="" width="20" height="20" />
            <span>{recipe.difficulty} Difficulty</span>
          </li>
        </ul>
      </section>

      <hr className="detail__divider" />

      <div className="prep">
        {/* key resets the tick state when navigating between recipes */}
        <section className="ingredients" aria-labelledby="ingredients-title">
          <h2 className="panel-title" id="ingredients-title">
            Ingredients
          </h2>
          <IngredientsList key={recipe.id} ingredients={recipe.ingredients} />
        </section>

        <section className="instructions" id="instructions" aria-labelledby="instructions-title">
          <h2 className="panel-title" id="instructions-title">
            Step-by-Step Instructions
          </h2>
          <ol className="steps">
            {recipe.steps.map((step, index) => (
              <li className="step" key={`${index}-${step.title}`}>
                <span className="step__number" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="step__body">
                  <h3 className="step__title">
                    <span className="visually-hidden">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="step__text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
