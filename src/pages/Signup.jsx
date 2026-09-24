import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { isSupabaseConfigured } from '../lib/supabase';
import { getRedirectPath } from './Login';
import './Auth.css';

const MIN_PASSWORD_LENGTH = 6; // Supabase's default minimum

export default function Signup() {
  useDocumentTitle('Sign Up | RecipeHub');
  const { user, signUp } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // With email confirmation off, sign-up returns a session and this redirects straight away.
  if (user) {
    return <Navigate to={getRedirectPath(location.state)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Enter your email.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const { data, error } = await signUp(email.trim(), password);
    if (error) {
      setFormError(error.message);
    } else if (!data.session) {
      // Email confirmation is on in Supabase: no session until the link is clicked.
      setConfirmationSent(true);
    }
    setSubmitting(false);
  };

  if (confirmationSent) {
    return (
      <main className="page auth-page">
        <section className="auth-card" aria-labelledby="signup-title">
          <h1 className="section-title" id="signup-title">
            Check your email
          </h1>
          <p className="form-notice" role="status">
            Account created. Confirm your email address using the link we sent, then log in.
          </p>
          <Link to="/login" className="btn">
            Go to log in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <h1 className="section-title" id="signup-title">
          Create an account
        </h1>
        <p className="auth-card__intro">Sign up to share your own recipes with the community.</p>

        {!isSupabaseConfigured && (
          <p className="form-alert" role="alert">
            Sign-up is unavailable because Supabase is not configured.
          </p>
        )}
        {formError && (
          <p className="form-alert" role="alert">
            {formError}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FormField
            id="signup-password"
            label="Password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            type="password"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FormField
            id="signup-confirm-password"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <button type="submit" className="btn auth-form__submit" disabled={submitting || !isSupabaseConfigured}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
