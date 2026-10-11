// Widget registry. To add a widget: write a component (see basic.jsx) and add an entry here.
// Sizes are in grid units: the frame is 12 columns × 8 rows.
import { Clock, Weather, Family, NextUp, Agenda, Chores, Shopping, Photo, Note } from './basic.jsx';

export const WIDGETS = {
  clock:    { title: 'Clock',    component: Clock,    w: 4, h: 2, minW: 3, minH: 2 },
  weather:  { title: 'Weather',  component: Weather,  w: 5, h: 2, minW: 3, minH: 1 },
  family:   { title: 'Family',   component: Family,   w: 3, h: 2, minW: 2, minH: 2 },
  nextUp:   { title: 'Next up',  component: NextUp,   w: 7, h: 3, minW: 4, minH: 2 },
  agenda:   { title: 'Today',    component: Agenda,   w: 4, h: 3, minW: 2, minH: 2 },
  chores:   { title: 'Chores',   component: Chores,   w: 5, h: 2, minW: 3, minH: 2 },
  shopping: { title: 'Shopping', component: Shopping, w: 3, h: 2, minW: 2, minH: 1 },
  photo:    { title: 'Photo',    component: Photo,    w: 5, h: 3, minW: 2, minH: 2 },
  note:     { title: 'Note',     component: Note,     w: 3, h: 2, minW: 2, minH: 1 },
};

export const COLS = 12;
export const ROWS = 8;

// The layout a fresh frame starts with. "Reset" in edit mode returns to it.
// i = unique id, type = key in WIDGETS, props = per-widget settings.
export const DEFAULT_LAYOUT = [
  { i: 'clock-1',    type: 'clock',    x: 0,  y: 0, w: 4, h: 2 },
  { i: 'weather-1',  type: 'weather',  x: 4,  y: 0, w: 5, h: 2 },
  { i: 'family-1',   type: 'family',   x: 9,  y: 0, w: 3, h: 2 },
  { i: 'next-1',     type: 'nextUp',   x: 0,  y: 2, w: 7, h: 3 },
  { i: 'photo-1',    type: 'photo',    x: 7,  y: 2, w: 5, h: 3 },
  { i: 'agenda-1',   type: 'agenda',   x: 0,  y: 5, w: 4, h: 3 },
  { i: 'chores-1',   type: 'chores',   x: 4,  y: 5, w: 5, h: 2 },
  { i: 'shopping-1', type: 'shopping', x: 9,  y: 5, w: 3, h: 3 },
  { i: 'note-1',     type: 'note',     x: 4,  y: 7, w: 5, h: 1, props: { text: 'Pizza night Friday 🍕' } },
];
