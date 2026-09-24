import { vi } from 'vitest'

/**
 * In-memory stand-in for the Supabase client used by every test (see setup.js).
 * It mimics the real project closely enough to test the app end to end:
 * - auth: sign up / sign in / sign out with session events
 * - recipes table: select (order, eq, maybeSingle) and insert (select, single)
 * - insert fills id, created_at and user_id (like the auth.uid() default) and,
 *   like the RLS policy, rejects inserts without a logged-in user
 */

export const mockState = {}
const listeners = new Set()

export function resetSupabaseMock() {
  Object.assign(mockState, {
    session: null,
    rows: [],
    nextId: 100,
    users: {}, // email -> password
    signUpReturnsSession: true, // false = email confirmation is on
    selectError: null,
    insertError: null,
    insertPending: null, // a Promise the insert waits for (to test the saving state)
    sessionPending: null, // a Promise getSession waits for (to test the loading state)
    insertedPayloads: [],
  })
  listeners.clear()
  vi.clearAllMocks()
}

const emit = (event, session) => listeners.forEach((listener) => listener(event, session))

const makeSession = (email) => ({ access_token: 'test-token', user: { id: `user-${email}`, email } })

/** Signs a user in directly (for tests that start logged in). */
export function signInAs(email = 'cook@example.com') {
  mockState.users[email] = 'secret123'
  mockState.session = makeSession(email)
}

export function seedRecipeRow(row) {
  const full = {
    id: mockState.nextId++,
    created_at: new Date().toISOString(),
    user_id: 'user-seed',
    description: '',
    image: null,
    ingredients: [],
    instructions: [],
    ...row,
  }
  mockState.rows.unshift(full)
  return full
}

function runQuery(query) {
  if (query.op === 'insert') {
    mockState.insertedPayloads.push(query.payload)
    if (mockState.insertError) return { data: null, error: mockState.insertError }
    if (!mockState.session) {
      return {
        data: null,
        error: { code: '42501', message: 'new row violates row-level security policy for table "recipes"' },
      }
    }
    const row = {
      id: mockState.nextId++,
      created_at: new Date().toISOString(),
      user_id: mockState.session.user.id,
      ...query.payload,
    }
    mockState.rows.unshift(row)
    return { data: query.single ? row : [row], error: null }
  }

  if (mockState.selectError) return { data: null, error: mockState.selectError }
  const rows = mockState.rows.filter((row) => query.filters.every(([column, value]) => row[column] === value))
  return { data: query.single ? (rows[0] ?? null) : rows, error: null }
}

function from() {
  const query = { op: 'select', filters: [], payload: null, single: false }
  const builder = {
    select: () => builder,
    order: () => builder,
    eq: (column, value) => {
      query.filters.push([column, value])
      return builder
    },
    insert: (payload) => {
      query.op = 'insert'
      query.payload = payload
      return builder
    },
    single: () => {
      query.single = true
      return builder
    },
    maybeSingle: () => {
      query.single = true
      return builder
    },
    then: (resolve, reject) =>
      Promise.resolve(query.op === 'insert' ? mockState.insertPending : null)
        .then(() => runQuery(query))
        .then(resolve, reject),
  }
  return builder
}

export const fakeSupabase = {
  from: vi.fn(from),
  auth: {
    getSession: vi.fn(async () => {
      await mockState.sessionPending
      return { data: { session: mockState.session }, error: null }
    }),
    onAuthStateChange: vi.fn((listener) => {
      listeners.add(listener)
      return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } }
    }),
    signUp: vi.fn(async ({ email, password }) => {
      if (mockState.users[email]) {
        return { data: { user: null, session: null }, error: { message: 'User already registered' } }
      }
      mockState.users[email] = password
      const session = makeSession(email)
      if (!mockState.signUpReturnsSession) return { data: { user: session.user, session: null }, error: null }
      mockState.session = session
      emit('SIGNED_IN', session)
      return { data: { user: session.user, session }, error: null }
    }),
    signInWithPassword: vi.fn(async ({ email, password }) => {
      if (mockState.users[email] !== password) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } }
      }
      const session = makeSession(email)
      mockState.session = session
      emit('SIGNED_IN', session)
      return { data: { user: session.user, session }, error: null }
    }),
    signOut: vi.fn(async () => {
      mockState.session = null
      emit('SIGNED_OUT', null)
      return { error: null }
    }),
  },
}

resetSupabaseMock()
