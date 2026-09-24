import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';
import { fetchMyRecipes } from '../data/recipeService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Recipes.css';
import './Profile.css';

/** Protected page: the logged-in user's email and the community recipes they added. */
export default function Profile() {
  useDocumentTitle('Profile | RecipeHub');
  const { user } = useAuth();
  const [result, setResult] = useState(null); // { userId, recipes, failed }

  useEffect(() => {
    let active = true;
    fetchMyRecipes(user.id)
      .then((recipes) => active && setResult({ userId: user.id, recipes, failed: false }))
      .catch(() => active && setResult({ userId: user.id, recipes: [], failed: true }));
    return () => {
      active = false;
    };
  }, [user.id]);

  const loading = result?.userId !== user.id;

  let content;
  if (loading) {
    content = (
      <p className="profile__status" role="status">
        Loading your recipes…
      </p>
    );
  } else if (result.failed) {
    content = (
      <p className="profile__status" role="status">
        Your recipes couldn&apos;t be loaded right now. Please try again later.
      </p>
    );
  } else if (result.recipes.length === 0) {
    content = (
      <div className="profile__empty">
        <p className="profile__empty-text">You haven&apos;t added any recipes yet.</p>
        <p className="profile__status">Share your favourite dish with the RecipeHub community.</p>
        <Link to="/recipes/new" className="btn">
          Add Recipe
        </Link>
      </div>
    );
  } else {
    content = (
      <ul className="recipes-grid">
        {result.recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="page profile">
      <section className="profile__header">
        <h1 className="section-title">Your Profile</h1>
        <p className="profile__account">
          Signed in as <strong className="profile__email">{user.email}</strong>
        </p>
      </section>

      <section className="profile__recipes" aria-labelledby="my-recipes-title">
        <div className="profile__recipes-header">
          <h2 className="panel-title" id="my-recipes-title">
            My Recipes
          </h2>
          {!loading && !result.failed && result.recipes.length > 0 && (
            <span className="profile__count">
              {result.recipes.length} {result.recipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
          )}
        </div>
        {content}
      </section>
    </main>
  );
}
