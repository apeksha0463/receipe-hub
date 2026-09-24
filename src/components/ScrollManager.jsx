import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollToHash = (hash) => {
  const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
};

/**
 * Manages scroll position on navigation:
 * - Back/Forward restores the position the page had when it was left.
 * - A link with a hash (the "Categories" nav link -> /#categories) scrolls to that
 *   element, even when clicked again while already there.
 * - A new page scrolls to the top. Query-only changes (search, filters) keep the position.
 */
export default function ScrollManager() {
  const { key, pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const previousPathname = useRef(pathname);

  // Remember the scroll position of the current history entry. A layout effect swaps the
  // listener before the next page can fire a scroll event against the old entry.
  useLayoutEffect(() => {
    const save = () => positions.current.set(key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);

  useLayoutEffect(() => {
    const pathnameChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (navigationType === 'POP') {
      const saved = positions.current.get(key);
      if (saved !== undefined) {
        window.scrollTo(0, saved);
      } else {
        // First load or refresh: let the browser keep its position, apart from hash links.
        scrollToHash(hash);
      }
      return;
    }

    if (!scrollToHash(hash) && pathnameChanged) {
      window.scrollTo(0, 0);
    }
    positions.current.set(key, window.scrollY);
  }, [key, pathname, hash, navigationType]);

  return null;
}
