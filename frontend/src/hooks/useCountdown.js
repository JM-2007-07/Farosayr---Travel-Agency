import { useEffect, useState } from 'react';

/**
 * Ports the original per-deal countdown from script.js:
 *   const endTime = Date.now() + hours * 60 * 60 * 1000;
 *   setInterval(render, 1000);
 *
 * Still a client-side-only demo countdown (resets on reload) — a
 * server-authoritative endsAt timestamp is a later-phase concern, not this
 * one, per the Phase 2 spec ("DO NOT introduce a backend time system yet").
 */
export function useCountdown(hours) {
  const [endTime] = useState(() => Date.now() + hours * 60 * 60 * 1000);
  const [remaining, setRemaining] = useState(() => Math.max(endTime - Date.now(), 0));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(endTime - Date.now(), 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const expired = remaining <= 0;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return {
    expired,
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}
