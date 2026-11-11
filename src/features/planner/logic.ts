import { photoData } from './photoData';
import type { Activity, Data, Trip, Template } from './model';
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number(value.slice(0, 4)) >= 1900 && Number(value.slice(0, 4)) <= 2100 && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function today() {
  const d = new Date();
  return calendarDate(d.getFullYear(), d.getMonth(), d.getDate());
}
export function calendarDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function shiftDay(date: string, amount: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
export function displayDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}
export function minutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
export function formatTime12(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
export function timeRange(a: Activity) {
  if (!a.durationMinutes) return formatTime12(a.time);
  const end = minutes(a.time) + a.durationMinutes;
  const t = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  return `${formatTime12(a.time)}–${formatTime12(t)}${end >= 1440 ? ' (+1 day)' : ''}`;
}
export function overlaps(a: Activity, b: Activity) {
  if (a.id === b.id || !a.durationMinutes || !b.durationMinutes) return false;
  const start = (x: Activity) => Date.parse(`${x.date}T00:00:00Z`) / 60000 + minutes(x.time);
  return start(a) < start(b) + b.durationMinutes && start(b) < start(a) + a.durationMinutes;
}
export function amount(text: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) throw Error('Enter a positive amount with up to two decimal places.');
  const value = Number(text);
  if (!Number.isFinite(value) || value > 1000000000) throw Error('Amount is too large.');
  return value;
}
export const money = (n: number, currency: string) => `${currency} ${n.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
export function checkTrip(trip: Trip) {
  if (!trip.name.trim() || !trip.country.trim() || !trip.city.trim()) throw Error('Enter a trip name, country and city.');
  if (!validDate(trip.startDate) || !validDate(trip.endDate) || trip.endDate < trip.startDate) throw Error('Choose a valid trip date range.');
  const dates = [...new Set(trip.activities.filter(a => a.date < trip.startDate || a.date > trip.endDate).map(a => a.date))];
  if (dates.length) throw Error(`Activities exist on ${dates.join(', ')}. Keep these dates or move those activities first.`);
}
export function totals(trip: Trip) {
  return {
    estimated: trip.activities.reduce((n, a) => n + a.cost, 0) + trip.bookings.reduce((n, b) => n + b.cost, 0),
    actual: trip.expenses.reduce((n, e) => n + e.amount, 0)
  };
}
// Equal splits are computed in integer cents; rounding is distributed deterministically.
export function balances(trip: Trip) {
  const result: Record<string, number> = {};
  for (const e of trip.expenses) {
    const cents = Math.round(e.amount * 100);
    result[e.paidBy] = (result[e.paidBy] ?? 0) + cents;
    const share = Math.floor(cents / e.splitWith.length),
      remainder = cents % e.splitWith.length;
    e.splitWith.forEach((name, i) => {
      result[name] = (result[name] ?? 0) - share - (i < remainder ? 1 : 0);
    });
  }
  return Object.entries(result).map(([name, cents]) => ({
    name,
    amount: cents / 100
  }));
}
export function makeTemplate(t: Template, start: string): Trip {
  const trip: Trip = {
    id: uid(),
    name: t.title,
    country: t.country,
    city: t.city,
    startDate: start,
    endDate: shiftDay(start, t.days - 1),
    about: t.description,
    pace: 'Moderate',
    currency: 'AED',
    budget: 0,
    travelers: ['Me'],
    activities: t.items.map(a => ({
      id: uid(),
      date: shiftDay(start, a.day),
      title: a.title,
      time: a.time,
      durationMinutes: a.duration,
      location: a.location,
      notes: 'Sample plan: verify opening hours, availability and travel times.',
      cost: 0,
      done: false
    })),
    bookings: [],
    expenses: [],
    tasks: []
  };
  checkTrip(trip);
  return trip;
}
export function emptyData(): Data {
  return {
    version: 2,
    trips: [],
    ideas: [],
    profile: {
      name: 'Traveler',
      bio: 'Collecting places. Making memories.'
    }
  };
}
// Reject malformed backups instead of silently discarding records. Old v1 trips gain defaults.
const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error('Invalid saved record.');
  return v as Record<string, unknown>;
};
const string = (v: unknown, fallback?: string): string => {
  if (v === undefined && fallback !== undefined) return fallback;
  if (typeof v !== 'string') throw Error('Invalid text in saved data.');
  return v;
};
const number = (v: unknown, fallback = 0): number => {
  if (v === undefined) return fallback;
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) throw Error('Invalid amount in saved data.');
  return v;
};
const bool = (v: unknown) => {
  if (v === undefined) return false;
  if (typeof v !== 'boolean') throw Error('Invalid checkbox in saved data.');
  return v;
};
const array = (v: unknown): unknown[] => {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw Error('Invalid saved list.');
  return v;
};
function list<T extends {
  id: string;
}>(v: unknown, parse: (x: unknown) => T) {
  const result = array(v).map(parse);
  if (result.some(x => !x.id) || new Set(result.map(x => x.id)).size !== result.length) throw Error('Duplicate or missing IDs in saved data.');
  return result;
}
export function readTrips(input: unknown): Trip[] {
  return list(input, raw => {
    const t = object(raw);
    const trip: Trip = {
      id: string(t.id),
      name: string(t.name),
      country: string(t.country),
      city: string(t.city),
      startDate: string(t.startDate),
      endDate: string(t.endDate),
      about: string(t.about, ''),
      pace: string(t.pace, 'Moderate'),
      currency: string(t.currency, 'AED'),
      budget: number(t.budget),
      coverPhoto: photoData(t.coverPhoto),
      travelers: t.travelers === undefined ? ['Me'] : array(t.travelers).map(x => string(x)),
      activities: list(t.activities, raw => {
        const a = object(raw);
        const duration = a.durationMinutes === undefined ? undefined : number(a.durationMinutes);
        if (duration !== undefined && (!Number.isInteger(duration) || duration < 1 || duration > 1440)) throw Error('Invalid activity duration.');
        const date = string(a.date),
          time = string(a.time);
        if (!validDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Invalid activity date or time.');
        return {
          id: string(a.id),
          date,
          time,
          title: string(a.title),
          location: string(a.location, ''),
          notes: string(a.notes, ''),
          durationMinutes: duration,
          cost: number(a.cost),
          done: bool(a.done)
        };
      }),
      bookings: list(t.bookings, raw => {
        const b = object(raw);
        const date = string(b.date),
          endDate = string(b.endDate, date),
          cancellationDate = string(b.cancellationDate, '');
        if (!validDate(date) || !validDate(endDate) || endDate < date || cancellationDate && !validDate(cancellationDate)) throw Error('Invalid booking dates.');
        return {
          id: string(b.id),
          kind: string(b.kind),
          title: string(b.title),
          date,
          endDate,
          address: string(b.address, ''),
          reference: string(b.reference, ''),
          url: string(b.url, ''),
          cancellationDate,
          cost: number(b.cost),
          notes: string(b.notes, '')
        };
      }),
      expenses: list(t.expenses, raw => {
        const e = object(raw);
        const splitWith = array(e.splitWith).map(x => string(x));
        if (!splitWith.length || splitWith.some(n => !n.trim()) || new Set(splitWith).size !== splitWith.length) throw Error('Invalid expense split.');
        return {
          id: string(e.id),
          title: string(e.title),
          amount: number(e.amount),
          paidBy: string(e.paidBy),
          splitWith
        };
      }),
      tasks: list(t.tasks, raw => {
        const a = object(raw);
        return {
          id: string(a.id),
          title: string(a.title),
          done: bool(a.done)
        };
      })
    };
    if (!/^[A-Z]{3}$/.test(trip.currency)) throw Error('Invalid currency.');
    checkTrip(trip);
    return trip;
  });
}
export function readData(raw: string): Data {
  const d = object(JSON.parse(raw));
  if (d.version !== 2) throw Error('This is not a version 2 planner backup.');
  if (!Array.isArray(d.trips) || !Array.isArray(d.ideas)) throw Error('Backup must contain trips and saved ideas lists.');
  const profile = object(d.profile);
  return {
    version: 2,
    trips: readTrips(d.trips),
    profile: {
      photo: photoData(profile.photo),
      name: string(profile.name),
      bio: string(profile.bio, '')
    },
    ideas: list(d.ideas, raw => {
      const x = object(raw);
      return {
        id: string(x.id),
        collection: string(x.collection),
        title: string(x.title),
        location: string(x.location, ''),
        url: string(x.url, ''),
        notes: string(x.notes, '')
      };
    })
  };
}
