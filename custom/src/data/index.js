// The one place widgets get data from. Today it is Wes's mock data (the same family,
// calendar, chores and weather the vanilla dashboard shows). To go live, replace the body
// of loadData() with real sources (an ICS feed, a weather API, your own Worker endpoint)
// returning the same shape, and every widget follows.
import { useEffect, useState } from 'react';
import '../../../dashboard/js/data.js'; // defines window.DATA (an IIFE, relative to "today")

export function loadData() {
  return window.DATA;
}

const listeners = new Set();
let current = loadData();

/** Replace the data (e.g. after a fetch) and re-render every widget that uses it. */
export function setData(next) {
  current = next;
  listeners.forEach((fn) => fn(current));
}

export function useData() {
  const [data, set] = useState(current);
  useEffect(() => {
    listeners.add(set);
    return () => listeners.delete(set);
  }, []);
  return data;
}

// ---- helpers shared by widgets (ported from dashboard/js/app.js)

export function person(data, id) {
  if (id === 'family' || id === 'any') return data.family;
  return data.people.find((p) => p.id === id) || data.family;
}

export const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export function timedOn(data, day) {
  const s = dayStart(day), e = addDays(s, 1);
  return data.events
    .filter((ev) => !ev.allDay && ev.start < e && ev.end > s)
    .sort((a, b) => a.start - b.start);
}

export function allDayOn(data, day) {
  const s = dayStart(day), e = addDays(s, 1);
  return data.events.filter((ev) => ev.allDay && ev.start < e && ev.end > s);
}

export const leaveBy = (e) => (e.travel ? new Date(+e.start - e.travel * 60000) : e.start);

export function nextEvent(data, now) {
  return timedOn(data, now)
    .filter((e) => e.start > now)
    .sort((a, b) => leaveBy(a) - leaveBy(b))[0] || null;
}

export function evColor(data, e) {
  return e.people.length >= data.people.length ? data.family : person(data, e.people[0]);
}

export function currentRoutine(data, now) {
  const h = now.getHours();
  return data.routines.find((r) => h >= r.from && h < r.to) || data.routines[2];
}

export const photoSrc = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** CSS custom properties for a person's colour, as Wes's styles use them. */
export const pstyle = (p) => ({ '--c': p.color, '--c-rgb': p.rgb, '--c-ink': p.ink });
