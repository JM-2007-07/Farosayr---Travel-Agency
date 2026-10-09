import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { SITE_NAME } from '../../seo/site';

const POLL_MS = 100;
const MAX_WAIT_MS = 3000;

/**
 * Client-side navigation doesn't reload the page, so screen readers aren't
 * told that a new page opened. After a route change this:
 *
 * - moves focus to <main> (no ring — see global.css), so the next Tab
 *   starts at the new page's content, not in the header link just used;
 * - announces the new page title once, in a polite live region.
 *
 * Not on the first load (the browser announces the page itself), not for
 * `#hash` links (scrollToId moves focus to the target section) and not when
 * only the query string changes (e.g. tour filters). Compares paths rather
 * than counting renders, so StrictMode's double effects don't announce the
 * initial page.
 */
export default function RouteAnnouncer() {
  const { pathname, hash } = useLocation();
  const [message, setMessage] = useState('');
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;
    if (hash) return undefined;

    const main = document.getElementById('main-content');
    if (main && !main.contains(document.activeElement)) main.focus({ preventScroll: true });

    // The page sets its title from its own (lazy) chunk, detail pages only
    // once their data is in — wait for a real title, then announce it once.
    const before = document.title;
    let waited = 0;
    let timer;
    const announce = () => {
      const title = document.title;
      const ready = title && title !== before && title !== SITE_NAME;
      if (!ready && waited < MAX_WAIT_MS) {
        waited += POLL_MS;
        timer = setTimeout(announce, POLL_MS);
        return;
      }
      setMessage(title);
    };
    timer = setTimeout(announce, POLL_MS);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return (
    <div className="visually-hidden" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
