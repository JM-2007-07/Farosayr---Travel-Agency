import { useEffect, useState } from 'react';

/**
 * Ports the original:
 *   function updateActiveLink() {
 *     let current = 'home';
 *     sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 140) current = sec.id; });
 *     ...
 *   }
 *
 * Only counts sections that actually exist in the DOM at any given time,
 * so it works fine as more homepage sections are added in later phases.
 */
export function useActiveSection(sectionIds, offset = 140) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? 'home');

  useEffect(() => {
    function update() {
      let current = sectionIds[0] ?? 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (window.scrollY >= el.offsetTop - offset) current = id;
      }
      setActiveId(current);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [sectionIds, offset]);

  return activeId;
}
