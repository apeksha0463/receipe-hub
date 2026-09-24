import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { isSupabaseConfigured } from '../lib/supabase';
import './Auth.css';

/** Where to go after logging in: the protected page that sent the user here, else Home. */
export const getRedirectPath = (state) =>
  state?.from ? `${state.from.pathname}${state.from.search ?? ''}` : '/';

export default function Login() {
  useDocumentTitle('Log In | RecipeHub');
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Also handles a successful login: the new session re-renders this page.
  if (user) {
    return <Navigate to={getRedirectPath(location.state)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Enter your email.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <h1 className="section-title" id="login-title">
          Log in
        </h1>
        <p className="auth-card__intro">Log in to add your own recipes to RecipeHub.</p>

        {!isSupabaseConfigured && (
          <p className="form-alert" role="alert">
            Login is unavailable because Supabase is not configured.
          </p>
        )}
        {formError && (
          <p className="form-alert" role="alert">
            {formError}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="login-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FormField
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="btn auth-form__submit" disabled={submitting || !isSupabaseConfigured}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-card__switch">
          New to RecipeHub?{' '}
          <Link to="/signup" state={location.state}>
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
