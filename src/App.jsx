import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddRecipe from './pages/AddRecipe';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import useDocumentTitle from './hooks/useDocumentTitle';

function NotFound() {
  useDocumentTitle('Page Not Found | RecipeHub');
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
    <AuthProvider>
      <ScrollManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <AddRecipe />
            </ProtectedRoute>
          }
        />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}
