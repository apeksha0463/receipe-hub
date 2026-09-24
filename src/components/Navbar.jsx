import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import chefHat from '../assets/icons/chef-hat.svg';
import './Navbar.css';

const linkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu on every navigation, including re-clicking the current link
  // (e.g. Categories while already at /#categories), which only changes location.key.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

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
          {/* Recipes stays active on /recipes and /recipes/:id (as in the Figma detail frame). */}
          <NavLink to="/recipes" className={linkClass}>
            Recipes
          </NavLink>
          <Link to={{ pathname: '/', hash: '#categories' }} className="navbar__link">
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}
