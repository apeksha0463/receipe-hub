import { useEffect, useMemo, useState } from 'react';
import { recipes as staticRecipes } from '../data/recipes';
import { fetchCommunityRecipes, getCachedCommunityRecipes } from '../data/recipeService';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * All recipes: community recipes from Supabase first (newest first), then the static
 * RecipeHub recipes. The static recipes are always returned, even while loading or on error.
 *
 * status: 'ready' | 'loading' | 'error'
 */
export default function useRecipes() {
  const [community, setCommunity] = useState(() => getCachedCommunityRecipes() ?? []);
  const [status, setStatus] = useState(() =>
    !isSupabaseConfigured || getCachedCommunityRecipes() ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    fetchCommunityRecipes()
      .then((list) => {
        if (!active) return;
        setCommunity(list);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const recipes = useMemo(() => [...community, ...staticRecipes], [community]);
  return { recipes, status };
}
