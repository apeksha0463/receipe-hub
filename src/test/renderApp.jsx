import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import App from '../App'

// Shows the current URL and exposes browser-style Back, so tests can check URL state.
function RouterProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      {/* A plain div: an <output> would count as an extra role="status" element. */}
      <div data-testid="location">{location.pathname + location.search + location.hash}</div>
      <button type="button" onClick={() => navigate(-1)}>
        browser-back
      </button>
    </>
  )
}

/** Renders the whole app at `url` and returns a userEvent instance. */
export function renderAt(url) {
  // delay: null types without waiting between keystrokes, keeping long form tests fast.
  const user = userEvent.setup({ delay: null })
  render(
    <MemoryRouter initialEntries={[url]} useTransitions={false}>
      <App />
      <RouterProbe />
    </MemoryRouter>,
  )
  return user
}

export const currentUrl = () => screen.getByTestId('location').textContent

export const goBack = (user) => user.click(screen.getByRole('button', { name: 'browser-back' }))
