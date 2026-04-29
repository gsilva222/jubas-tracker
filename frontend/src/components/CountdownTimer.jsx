import { useState, useEffect } from 'react';

export default function CountdownTimer({ remainingSeconds }) {
  const [secs, setSecs] = useState(remainingSeconds);

  // Sync if the prop changes (e.g. after a refresh)
  useEffect(() => {
    setSecs(remainingSeconds);
  }, [remainingSeconds]);

  // Tick every second
  useEffect(() => {
    if (!secs || secs <= 0) return;
    const interval = setInterval(() => {
      setSecs(s => s - 1);
    }, 1000);
    return () => clearInterval(interval); // cleanup on unmount
  }, [secs]);

  if (!secs || secs <= 0) {
    return <span className="cooldown-expired">Expired</span>;
  }

  // Convert seconds → days, hours, minutes, seconds
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (d > 0) return <span className="cooldown-active">{d}d {h}h {m}m</span>;
  if (h > 0) return <span className="cooldown-active">{h}h {m}m {s}s</span>;
  return <span className="cooldown-warning">{m}m {s}s</span>;
}