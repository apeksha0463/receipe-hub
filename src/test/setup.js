import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'

// findBy*/waitFor wait up to 3s (default 1s): the first render in a test file can be slow
// while all files run in parallel, which made the first test of a file occasionally flaky.
configure({ asyncUtilTimeout: 3000 })
// The Add Recipe tests type a whole form; on a cold run (no transform cache) that can pass 5s.
vi.setConfig({ testTimeout: 15000 })
import { resetSupabaseMock } from './supabaseMock'
import { clearCommunityRecipeCache } from '../data/recipeService'

// Tests never talk to the real Supabase project: every import of src/lib/supabase
// gets the in-memory fake from supabaseMock.js instead.
vi.mock('../lib/supabase', async () => {
  const { fakeSupabase } = await import('./supabaseMock')
  return { supabase: fakeSupabase, isSupabaseConfigured: true }
})

beforeEach(() => {
  sessionStorage.clear() // Add Recipe drafts
  resetSupabaseMock()
  clearCommunityRecipeCache()
})
