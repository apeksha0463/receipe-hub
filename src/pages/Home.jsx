import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import searchIcon from '../assets/icons/search.svg';
import arrowRight from '../assets/icons/arrow-right.svg';
import { categories, heroCarbonara, recipes } from '../data/recipes';
import './Home.css';

// The three recipes featured under "Popular Recipes" in the Figma home frame.
const popularIds = ['classic-pasta-carbonara', 'grilled-salmon-with-asparagus', 'berry-smoothie-bowl'];
const popularRecipes = popularIds.map((id) => recipes.find((recipe) => recipe.id === id)).filter(Boolean);

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : '/recipes');
  };

  return (
    <main className="page home">
      <section className="hero">
        <div className="hero__left">
          <h1 className="hero__title">Discover Delicious Recipes</h1>
          <p className="hero__subtitle">
            Simple, tested, and creative culinary guidelines designed to turn anyone into a
            confident home cook.
          </p>
          <form className="search-bar hero__search" role="search" onSubmit={handleSearch}>
            <img src={searchIcon} alt="" width="20" height="20" />
            <label htmlFor="hero-search" className="visually-hidden">
              Search recipes
            </label>
            <input
              id="hero-search"
              type="search"
              placeholder="Search recipes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
        </div>

        <div className="hero__right">
          <img
            className="hero__image"
            src={heroCarbonara}
            alt="A bowl of spaghetti carbonara on a rustic wooden table"
            width="520"
            height="440"
          />
        </div>
      </section>

      <section className="home-section home-section--categories" id="categories">
        <h2 className="section-title">Browse by Category</h2>
        <ul className="category-grid">
          {categories.map((category) => (
            <li key={category.name}>
              <Link
                to={`/recipes?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <img className="category-card__image" src={category.image} alt="" loading="lazy" />
                <span className="category-card__label">
                  <img src={category.icon} alt="" width="18" height="18" />
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section home-section--popular">
        <div className="home-section__header">
          <h2 className="section-title">Popular Recipes</h2>
          <Link to="/recipes" className="see-all">
            Explore All
            <img src={arrowRight} alt="" width="16" height="16" />
          </Link>
        </div>
        <ul className="popular-grid">
          {popularRecipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} image={recipe.homeImage} timeUnit="mins" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
