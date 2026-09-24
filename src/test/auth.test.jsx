import { describe, it, expect } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { currentUrl, renderAt } from './renderApp'
import { fakeSupabase, mockState, signInAs } from './supabaseMock'

const nav = () => within(screen.getByRole('navigation', { name: 'Primary' }))

async function fillLogin(user, email, password) {
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('Feature: Navbar auth links (TC-AUTH-NAV)', () => {
  it('TC-AUTH-NAV-01: logged out shows Log in, not Add Recipe or Log out', async () => {
    renderAt('/')
    expect(await nav().findByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
    expect(nav().queryByRole('link', { name: 'Add Recipe' })).not.toBeInTheDocument()
    expect(nav().queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('TC-AUTH-NAV-02: an existing session shows Add Recipe and Log out', async () => {
    signInAs()
    renderAt('/')
    expect(await nav().findByRole('link', { name: 'Add Recipe' })).toHaveAttribute('href', '/recipes/new')
    expect(nav().getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(nav().queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
  })

  it('TC-AUTH-NAV-03: confirmed Log out signs out and switches the links back', async () => {
    signInAs()
    const user = renderAt('/')
    await user.click(await nav().findByRole('button', { name: 'Log out' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Log out' }))
    expect(fakeSupabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(await nav().findByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(nav().queryByRole('link', { name: 'Add Recipe' })).not.toBeInTheDocument()
  })
})

describe('Feature: Sign up (TC-SIGNUP)', () => {
  it('TC-SIGNUP-01: creates an account and logs straight in (email confirmation off)', async () => {
    const user = renderAt('/signup')
    expect(document.title).toBe('Sign Up | RecipeHub')
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.type(screen.getByLabelText('Confirm password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(fakeSupabase.auth.signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret123' })
    expect(currentUrl()).toBe('/')
    expect(await nav().findByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('TC-SIGNUP-02: validates email, password length and matching passwords', async () => {
    const user = renderAt('/signup')
    await user.type(screen.getByLabelText('Password'), '123')
    await user.type(screen.getByLabelText('Confirm password'), '456')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(screen.getByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Use at least 6 characters.')).toBeInTheDocument()
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(fakeSupabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('TC-SIGNUP-03: shows the Supabase error for an existing account', async () => {
    mockState.users['taken@example.com'] = 'secret123'
    const user = renderAt('/signup')
    await user.type(screen.getByLabelText('Email'), 'taken@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.type(screen.getByLabelText('Confirm password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('User already registered')
    expect(currentUrl()).toBe('/signup')
  })

  it('TC-SIGNUP-04: if email confirmation is turned on, asks the user to check their email', async () => {
    mockState.signUpReturnsSession = false
    const user = renderAt('/signup')
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.type(screen.getByLabelText('Confirm password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
  })
})

describe('Feature: Log in (TC-LOGIN)', () => {
  it('TC-LOGIN-01: valid credentials log in and go to Home', async () => {
    mockState.users['cook@example.com'] = 'secret123'
    const user = renderAt('/login')
    expect(document.title).toBe('Log In | RecipeHub')
    await fillLogin(user, 'cook@example.com', 'secret123')
    expect(currentUrl()).toBe('/')
    expect(await nav().findByRole('link', { name: 'Add Recipe' })).toBeInTheDocument()
  })

  it('TC-LOGIN-02: wrong password shows the error and stays on the page', async () => {
    mockState.users['cook@example.com'] = 'secret123'
    const user = renderAt('/login')
    await fillLogin(user, 'cook@example.com', 'wrong-password')
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
    expect(currentUrl()).toBe('/login')
  })

  it('TC-LOGIN-03: empty fields are rejected without calling Supabase', async () => {
    const user = renderAt('/login')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(fakeSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('TC-LOGIN-04: an already logged-in user visiting /login is sent Home', async () => {
    signInAs()
    renderAt('/login')
    await waitFor(() => expect(currentUrl()).toBe('/'))
    expect(nav().getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })
})

describe('Feature: Protected Add Recipe route (TC-PROTECT)', () => {
  it('TC-PROTECT-01: logged out, /recipes/new redirects to /login', async () => {
    renderAt('/recipes/new')
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/login')
    expect(screen.queryByRole('heading', { name: 'Add a Recipe' })).not.toBeInTheDocument()
  })

  it('TC-PROTECT-02: after logging in, the user is returned to /recipes/new', async () => {
    mockState.users['cook@example.com'] = 'secret123'
    const user = renderAt('/recipes/new')
    await screen.findByRole('heading', { name: 'Log in' })
    await fillLogin(user, 'cook@example.com', 'secret123')
    expect(currentUrl()).toBe('/recipes/new')
    expect(await screen.findByRole('heading', { name: 'Add a Recipe' })).toBeInTheDocument()
  })

  it('TC-PROTECT-03: logged in, /recipes/new shows the form', async () => {
    signInAs()
    renderAt('/recipes/new')
    expect(await screen.findByRole('heading', { name: 'Add a Recipe' })).toBeInTheDocument()
    expect(document.title).toBe('Add Recipe | RecipeHub')
  })

  it('TC-PROTECT-04: while the session is being checked it waits instead of redirecting', async () => {
    let finishCheck
    mockState.sessionPending = new Promise((resolve) => {
      finishCheck = resolve
    })
    signInAs()
    renderAt('/recipes/new')
    expect(screen.getByRole('status')).toHaveTextContent('Checking your session')
    expect(currentUrl()).toBe('/recipes/new')

    finishCheck()
    expect(await screen.findByRole('heading', { name: 'Add a Recipe' })).toBeInTheDocument()
  })

  it('TC-PROTECT-05: logging out on /recipes/new goes Home, not to the login page', async () => {
    signInAs()
    const user = renderAt('/recipes/new')
    await user.click(await nav().findByRole('button', { name: 'Log out' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Discover Delicious Recipes' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/')
  })
})

describe('Feature: Logged-out browsing (TC-PUBLIC)', () => {
  it.each(['/', '/recipes', '/recipes/chicken-biryani', '/recipes?category=Dinner'])(
    'TC-PUBLIC-01: %s works without logging in',
    async (url) => {
      renderAt(url)
      expect(await nav().findByRole('link', { name: 'Log in' })).toBeInTheDocument()
      expect(currentUrl()).toBe(url)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    },
  )
})
