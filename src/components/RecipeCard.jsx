import { Link } from 'react-router-dom';
import clock from '../assets/icons/clock.svg';
import { imageFallbackHandler } from '../data/recipeService';
import OwnershipLabel from './OwnershipLabel';
import './RecipeCard.css';

/**
 * Clickable recipe card (image, time, difficulty badge, title), plus an
 * "Added by you" / "Community recipe" label on Supabase recipes.
 *
 * @param {object} recipe    static recipe (src/data/recipes.js) or community recipe (recipeService.js);
 *                           a broken community image URL falls back to `recipe.fallbackImage`
 * @param {string} [image]   override for the thumbnail (Home uses its own Carbonara photo)
 */
export default function RecipeCard({ recipe, image }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
      <div className="recipe-card__image">
        <img
          src={image ?? recipe.image}
          alt=""
          loading="lazy"
          onError={imageFallbackHandler(recipe.fallbackImage)}
        />
        <OwnershipLabel recipe={recipe} className="recipe-card__owner" />
      </div>
      <div className="recipe-card__details">
        <div className="recipe-card__meta">
          <span className="recipe-card__time">
            <img src={clock} alt="" width="16" height="16" />
            {recipe.time} min
          </span>
          <span className={`badge badge--${recipe.difficulty.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        </div>
        <h3 className="recipe-card__title">{recipe.title}</h3>
      </div>
    </Link>
  );
}
