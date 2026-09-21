import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';

function NotFound() {
  return (
    <main className="page" style={{ padding: '80px var(--page-pad) 120px' }}>
      <h1 className="section-title">Page not found</h1>
      <p style={{ margin: '16px 0 24px', color: 'var(--color-text-muted)' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="see-all">
        Back to home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
