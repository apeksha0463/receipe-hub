import { Link } from 'react-router-dom';
import clock from '../assets/icons/clock.svg';
import './RecipeCard.css';

/**
 * Clickable recipe card (image, time, difficulty badge, title).
 *
 * @param {object} recipe    entry from src/data/recipes.js
 * @param {string} [image]   override for the thumbnail (Home uses its own Carbonara photo)
 */
export default function RecipeCard({ recipe, image }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
      <div className="recipe-card__image">
        <img src={image ?? recipe.image} alt="" loading="lazy" />
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
