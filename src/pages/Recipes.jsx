import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useRecipes from '../hooks/useRecipes';
import searchIcon from '../assets/icons/search.svg';
import { filterRecipes, filters, findFilter, searchRecipes } from '../data/recipes';
import './Recipes.css';

export default function Recipes() {
  useDocumentTitle('Recipes | RecipeHub');
  const [searchParams, setSearchParams] = useSearchParams();
  const { recipes, status } = useRecipes();

  // The URL is the single source of truth for both the category (?category=Dinner,
  // so Home category cards can link to it) and the search text (?q=pasta).
  const activeFilter = findFilter(searchParams.get('category'));
  const query = searchParams.get('q') ?? '';

  const visibleRecipes = useMemo(
    () => filterRecipes(searchRecipes(recipes, query), activeFilter),
    [recipes, activeFilter, query],
  );

  const updateParam = (name, value, options) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (value) {
        next.set(name, value);
      } else {
        next.delete(name);
      }
      return next;
    }, options);
  };

  // Replace (not push) while typing so each keystroke doesn't add a history entry.
  const changeQuery = (value) => updateParam('q', value, { replace: true });

  const selectFilter = (filter) => updateParam('category', filter === 'All' ? '' : filter);

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
              onChange={(event) => changeQuery(event.target.value)}
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
        {status === 'loading' && (
          <p className="recipes-status" role="status">
            Loading community recipes…
          </p>
        )}
        {status === 'error' && (
          <p className="recipes-status" role="status">
            Community recipes couldn&apos;t be loaded right now. Showing RecipeHub recipes only.
          </p>
        )}
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
