// Starter widgets. Each is a plain React component that gets { props, size } where
// size = { w, h } in grid units, so a widget can show more detail when it is bigger.
import Icon from '../Icon.jsx';
import { fmt, useNow } from '../hooks.js';
import {
  useData, person, timedOn, allDayOn, nextEvent, leaveBy, evColor,
  currentRoutine, photoSrc, pstyle,
} from '../data/index.js';

export function Clock({ size }) {
  const now = useNow('minute');
  const big = size.h >= 3;
  return (
    <div className="w-clock">
      <div className="w-clock__time" style={{ fontSize: big ? 150 : 96 }}>
        {fmt.time(now, false)}
        <span className="w-clock__ampm">{fmt.ampm(now)}</span>
      </div>
      <div className="w-clock__date">
        <b>{fmt.day(now).toUpperCase()}</b> <span>{fmt.month(now)} {now.getDate()}</span>
      </div>
    </div>
  );
}

const COND = { sun: 'Sunny', moon: 'Clear', partly: 'Partly cloudy', cloud: 'Overcast', rain: 'Rain' };

export function Weather({ size }) {
  const { weather: W } = useData();
  const h = useNow().getHours();
  const hours = Math.max(0, Math.min(8, size.w * 2 - 4));
  return (
    <div className="w-weather">
      <div className="w-weather__now">
        <Icon name={W.c[h]} size={56} />
        <span className="w-weather__temp">{W.t[h]}°</span>
        <span className="w-weather__cond">
          <b>{COND[W.c[h]].toUpperCase()}</b>
          <small>H {W.hi}° L {W.lo}°</small>
        </span>
      </div>
      {size.h >= 2 && hours > 0 && (
        <div className="w-weather__hours">
          {Array.from({ length: hours }, (_, i) => {
            const x = (h + i) % 24;
            return (
              <div key={i} className={W.p[x] >= 50 ? 'is-wet' : ''}>
                <small>{i === 0 ? 'NOW' : fmt.hourLabel(x).toUpperCase()}</small>
                <Icon name={W.c[x]} size={22} />
                <b>{W.t[x]}°</b>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Family() {
  const { people } = useData();
  return (
    <ul className="w-family">
      {people.map((p) => (
        <li key={p.id} style={pstyle(p)}>
          <span className="avatar-ring">{p.name[0]}</span>
          <b>{p.name}</b>
          <span className={p.eta ? 'is-eta' : ''}>{p.eta ? `ETA ${p.eta} min` : p.status}</span>
        </li>
      ))}
    </ul>
  );
}

export function NextUp() {
  const data = useData();
  const now = useNow();
  const e = nextEvent(data, now);
  if (!e) return <div className="w-empty">Nothing else today</div>;
  const who = e.people.length >= data.people.length ? data.family : person(data, e.people[0]);
  const mins = (e.start - now) / 60000;
  const leave = (leaveBy(e) - now) / 60000;
  return (
    <div className="w-next" style={pstyle(who)}>
      <small>NEXT UP · {who.name.toUpperCase()}</small>
      <h2>{e.title}</h2>
      <p>{fmt.time(e.start)} – {fmt.time(e.end)}{e.loc ? ` · ${e.loc}` : ''}</p>
      {e.travel ? <span className="pill"><Icon name="car" size={20} /> {leave > 0 ? `Leave in ${fmt.mins(leave)}` : 'Leave now'}</span> : null}
      <div className="w-next__count"><b>{Math.round(mins)}</b><small>MIN</small></div>
    </div>
  );
}

export function Agenda({ size }) {
  const data = useData();
  const now = useNow();
  const allDay = allDayOn(data, now);
  const upcoming = timedOn(data, now).filter((e) => e.end > now);
  const max = Math.max(1, size.h * 2 - 1);
  return (
    <div className="w-agenda">
      <small className="w-label">TODAY</small>
      {allDay.map((e) => <div key={e.id} className="w-agenda__allday">{e.title}</div>)}
      <ul>
        {upcoming.slice(0, max).map((e) => (
          <li key={e.id} style={pstyle(evColor(data, e))}>
            <time>{fmt.time(e.start)}</time>
            <span>{e.title}</span>
          </li>
        ))}
      </ul>
      {upcoming.length > max && <small className="w-more">+{upcoming.length - max} more</small>}
    </div>
  );
}

export function Chores() {
  const data = useData();
  const now = useNow();
  const r = currentRoutine(data, now);
  const list = data.chores.filter((c) => c.r === r.id);
  const who = data.people.concat([{ id: 'any', name: 'Anyone', color: '#111111', rgb: '17 17 17', ink: '#fff' }]);
  return (
    <div className="w-chores">
      <small className="w-label">CHORES · {r.name.toUpperCase()}</small>
      <div className="w-chores__rings">
        {who.map((p) => {
          const mine = list.filter((c) => c.who === p.id);
          if (!mine.length) return null;
          const done = mine.filter((c) => c.done).length;
          const pct = done / mine.length;
          return (
            <div key={p.id} className="w-ring" style={pstyle(p)}>
              <svg viewBox="0 0 36 36" width="64" height="64">
                <circle cx="18" cy="18" r="15.5" className="w-ring__bg" />
                <circle cx="18" cy="18" r="15.5" className="w-ring__fg"
                  strokeDasharray={`${pct * 97.4} 97.4`} transform="rotate(-90 18 18)" />
              </svg>
              <b>{done}/{mine.length}</b>
              <small>{p.name}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Shopping({ size }) {
  const { groceries } = useData();
  const left = groceries.filter((g) => !g.done);
  const show = size.h >= 3 ? left.slice(0, size.h * 2 - 2) : [];
  return (
    <div className="w-shop">
      <small className="w-label">SHOPPING</small>
      <div className="w-shop__count"><b>{left.length}</b> items to get</div>
      {show.length > 0 && <ul>{show.map((g) => <li key={g.id}>{g.name}{g.qty > 1 ? ` ×${g.qty}` : ''}</li>)}</ul>}
    </div>
  );
}

export function Photo({ size }) {
  const { photos } = useData();
  const p = photos[0];
  return (
    <div className="w-photo" style={{ backgroundImage: `url(${photoSrc(p.seed, size.w * 110, size.h * 100)})` }}>
      <span><b>{p.place}</b></span>
    </div>
  );
}

/** Free text you set in edit mode: a message board for the house. */
export function Note({ props, editing, onProps }) {
  const text = props.text || 'Tap the gear, then edit this note.';
  return editing ? (
    <textarea
      className="w-note w-note--edit"
      defaultValue={props.text || ''}
      placeholder="Write a note…"
      onBlur={(e) => onProps({ ...props, text: e.target.value })}
    />
  ) : (
    <div className="w-note">{text}</div>
  );
}
