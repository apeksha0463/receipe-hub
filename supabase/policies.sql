-- RecipeHub: Row Level Security and data rules for public.recipes.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Table (already created):
--   id int8 primary key, created_at timestamptz default now(), title text,
--   category text, difficulty text, time int8, servings int8, description text,
--   image text, ingredients jsonb, instructions jsonb, user_id uuid default auth.uid()

-- 1. Turn on RLS. With RLS on, anything not allowed by a policy below is denied.
alter table public.recipes enable row level security;

-- 2. Everyone, including logged-out visitors, can read community recipes.
drop policy if exists "Recipes are viewable by everyone" on public.recipes;
create policy "Recipes are viewable by everyone"
  on public.recipes for select
  to anon, authenticated
  using (true);

-- 3. Only logged-in users can add recipes, and only as themselves.
--    The app never sends user_id: the column default auth.uid() fills it in,
--    and this check rejects any request that tries to set someone else's id.
drop policy if exists "Users can insert their own recipes" on public.recipes;
create policy "Users can insert their own recipes"
  on public.recipes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No update or delete policies: editing and deleting are blocked for everyone for now.

-- 4. Data rules the app relies on (category/difficulty drive the filters and badges).
--    If this fails, existing rows break a rule: fix or delete them first, e.g.
--    select * from public.recipes where user_id is null or title is null;
alter table public.recipes
  alter column user_id set not null,
  alter column title set not null;

alter table public.recipes
  drop constraint if exists recipes_category_check,
  drop constraint if exists recipes_difficulty_check,
  drop constraint if exists recipes_time_check,
  drop constraint if exists recipes_servings_check;

alter table public.recipes
  add constraint recipes_category_check check (category in ('Breakfast', 'Lunch', 'Dinner', 'Desserts')),
  add constraint recipes_difficulty_check check (difficulty in ('Easy', 'Medium', 'Hard')),
  add constraint recipes_time_check check (time > 0),
  add constraint recipes_servings_check check (servings > 0);
