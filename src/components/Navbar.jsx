import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import chefHat from '../assets/icons/chef-hat.svg';
import './Navbar.css';

const linkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  // Close the mobile menu on every navigation, including re-clicking the current link
  // (e.g. Categories while already at /#categories), which only changes location.key.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

  // Recipes stays active on /recipes and /recipes/:id (as in the Figma detail frame),
  // but not on /recipes/new, which has its own "Add Recipe" link.
  const recipesActive = location.pathname.startsWith('/recipes') && location.pathname !== '/recipes/new';

  // Go Home first so a protected page (Add Recipe, Profile) doesn't redirect to /login.
  const handleConfirmLogout = async () => {
    setConfirmLogout(false);
    setMenuOpen(false);
    navigate('/');
    await signOut();
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="RecipeHub home">
          <span className="navbar__logo-icon">
            <img src={chefHat} alt="" width="20" height="20" />
          </span>
          <span className="navbar__brand">
            Recipe<span className="navbar__brand-accent">Hub</span>
          </span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <nav
          id="primary-navigation"
          className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}
          aria-label="Primary"
        >
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <Link
            to="/recipes"
            className={linkClass({ isActive: recipesActive })}
            aria-current={recipesActive ? 'page' : undefined}
          >
            Recipes
          </Link>
          <Link to={{ pathname: '/', hash: '#categories' }} className="navbar__link">
            Categories
          </Link>

          {/* Nothing auth-related is shown until the saved session has been checked (no flicker). */}
          {!loading &&
            (user ? (
              <>
                <NavLink to="/recipes/new" className={linkClass}>
                  Add Recipe
                </NavLink>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
                <button
                  type="button"
                  className="navbar__link navbar__logout"
                  aria-haspopup="dialog"
                  onClick={() => setConfirmLogout(true)}
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
            ))}
        </nav>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  );
}
