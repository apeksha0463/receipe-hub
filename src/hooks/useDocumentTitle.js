import { useEffect } from 'react';

/** Sets the browser tab title while the calling page is mounted. */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
