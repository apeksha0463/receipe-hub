import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import searchIcon from '../assets/icons/search.svg';
import { filters, recipes } from '../data/recipes';
import './Recipes.css';

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The category filter lives in the URL (?category=Dinner) so Home category cards can link to it.
  const categoryParam = searchParams.get('category');
  const activeFilter = filters.includes(categoryParam) ? categoryParam : 'All';

  // The search text is local state, seeded from ?q= (used by the Home search bar).
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const visibleRecipes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return recipes.filter(
      (recipe) =>
        (activeFilter === 'All' || recipe.category === activeFilter) &&
        (needle === '' || recipe.title.toLowerCase().includes(needle)),
    );
  }, [activeFilter, query]);

  const selectFilter = (filter) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (filter === 'All') {
        next.delete('category');
      } else {
        next.set('category', filter);
      }
      return next;
    });
  };

  return (
    <main className="page recipes-page">
      <section className="recipes-header">
        <h1 className="section-title">Explore Recipes</h1>

        <div className="recipes-toolbar">
          <div className="search-bar recipes-search" role="search">
            <img src={searchIcon} alt="" width="20" height="20" />
            <label htmlFor="recipe-search" className="visually-hidden">
              Search recipes
            </label>
            <input
              id="recipe-search"
              type="search"
              placeholder="Search recipes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="filters" role="group" aria-label="Filter by category">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-pill${filter === activeFilter ? ' filter-pill--active' : ''}`}
                aria-pressed={filter === activeFilter}
                onClick={() => selectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="recipes-results" aria-label="Recipes">
        {visibleRecipes.length > 0 ? (
          <ul className="recipes-grid">
            {visibleRecipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="recipes-empty" role="status">
            No recipes found. Try a different search or category.
          </p>
        )}
      </section>
    </main>
  );
}
