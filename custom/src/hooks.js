import { useEffect, useState } from 'react';

/** Current time, re-rendering on every minute (or second) boundary. */
export function useNow(unit = 'minute') {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let t;
    const step = unit === 'second' ? 1000 : 60000;
    const tick = () => {
      const n = new Date();
      setNow(n);
      t = setTimeout(tick, step - (n.getTime() % step) + 20);
    };
    t = setTimeout(tick, step - (Date.now() % step) + 20);
    return () => clearTimeout(t);
  }, [unit]);
  return now;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const fmt = {
  time(d, ampm = true) {
    const h = d.getHours(), m = d.getMinutes();
    const s = (h % 12 || 12) + ':' + String(m).padStart(2, '0');
    return ampm ? s + ' ' + (h >= 12 ? 'PM' : 'AM') : s;
  },
  ampm: (d) => (d.getHours() >= 12 ? 'PM' : 'AM'),
  day: (d) => DAYS[d.getDay()],
  month: (d) => MONTHS[d.getMonth()],
  hourLabel: (h) => (h % 12 || 12) + (h >= 12 ? 'p' : 'a'),
  mins(m) {
    m = Math.max(0, Math.round(m));
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60), r = m % 60;
    return h + ' hr' + (r ? ' ' + r + ' min' : '');
  },
};
