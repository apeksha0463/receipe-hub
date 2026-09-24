import { useAuth } from '../context/AuthContext';
import { getOwnershipLabel } from '../data/recipeService';

/**
 * "Added by you" / "Community recipe" pill for Supabase recipes.
 * Renders nothing for the static built-in recipes.
 */
export default function OwnershipLabel({ recipe, className = '' }) {
  const { user } = useAuth();
  const label = getOwnershipLabel(recipe, user);
  if (!label) return null;

  const mine = label === 'Added by you';
  return (
    <span className={`ownership-label${mine ? ' ownership-label--mine' : ''} ${className}`.trim()}>
      {label}
    </span>
  );
}
