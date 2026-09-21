import { Link } from 'react-router-dom';
import chefHat from '../assets/icons/chef-hat-sm.svg';
import facebook from '../assets/icons/facebook.svg';
import instagram from '../assets/icons/instagram.svg';
import circleX from '../assets/icons/circle-x.svg';
import './Footer.css';

// Only "Latest Recipes" and "Editor's Choice" have a destination in this site;
// the other entries are shown as labels exactly as in the Figma design.
const columns = [
  {
    title: 'Explore',
    items: [
      { label: 'Latest Recipes', to: '/recipes' },
      { label: "Editor's Choice", to: '/recipes' },
      { label: 'Meal Plans' },
    ],
  },
  {
    title: 'Community',
    items: [{ label: 'Cooking Forums' }, { label: 'Makers & Chefs' }, { label: 'Events' }],
  },
];

const socials = [
  { label: 'Facebook', icon: facebook, href: 'https://www.facebook.com' },
  { label: 'Instagram', icon: instagram, href: 'https://www.instagram.com' },
  { label: 'X', icon: circleX, href: 'https://x.com' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="RecipeHub home">
              <span className="footer__logo-icon">
                <img src={chefHat} alt="" width="18" height="18" />
              </span>
              <span className="footer__brand-name">RecipeHub</span>
            </Link>
            <p className="footer__desc">
              Bringing professional and home chefs together with meticulously tested, beautifully
              shot recipes.
            </p>
          </div>

          <div className="footer__links">
            {columns.map((column) => (
              <div className="footer__col" key={column.title}>
                <h2 className="footer__col-title">{column.title}</h2>
                <ul className="footer__col-list">
                  {column.items.map((item) => (
                    <li key={item.label}>
                      {item.to ? (
                        <Link to={item.to} className="footer__link">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="footer__link footer__link--static">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="footer__divider" />

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} RecipeHub. Crafted for culinary enthusiasts.
          </p>
          <ul className="footer__socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="footer__social"
                >
                  <img src={social.icon} alt="" width="20" height="20" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
