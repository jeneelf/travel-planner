import { PhotoField } from './components/PhotoField';
import { TravelerField } from './components/TravelerField';
import { useState } from 'react';
import { Text } from 'react-native';
import type { Activity, Booking, Expense, Idea, Profile, Trip } from './model';
import { amount, checkTrip, overlaps, uid, validDate } from './logic';
import { locations } from './sampleData';
import { Choices, Field, FormPage, Notice, SearchField, s } from './ui';
import { DateField } from './components/DateField';
import { TimeField } from './components/TimeField';
type Close = {
  onClose: () => void;
};
export function TripForm({
  initial,
  onSave,
  onClose
}: {
  initial?: Trip;
  onSave: (trip: Trip) => Promise<void>;
} & Close) {
  const [name, setName] = useState(initial?.name ?? ''),
    [country, setCountry] = useState(initial?.country ?? ''),
    [city, setCity] = useState(initial?.city ?? '');
  const [start, setStart] = useState(initial?.startDate ?? ''),
    [end, setEnd] = useState(initial?.endDate ?? ''),
    [about, setAbout] = useState(initial?.about ?? '');
  const [pace, setPace] = useState(initial?.pace ?? 'Moderate'),
    [budget, setBudget] = useState(String(initial?.budget ?? 0)),
    [currency, setCurrency] = useState(initial?.currency ?? 'AED');
  const [travelers, setTravelers] = useState<string[]>(initial?.travelers ?? ['Me']);
  const [coverPhoto, setCoverPhoto] = useState(initial?.coverPhoto);
  const [photoBusy, setPhotoBusy] = useState(false);
  async function submit() {
    const trip: Trip = {
      id: initial?.id ?? uid(),
      name: name.trim(),
      country: country.trim(),
      city: city.trim(),
      startDate: start,
      endDate: end,
      about,
      pace,
      budget: amount(budget || '0'),
      currency,
      travelers,
      coverPhoto,
      activities: initial?.activities ?? [],
      bookings: initial?.bookings ?? [],
      expenses: initial?.expenses ?? [],
      tasks: initial?.tasks ?? []
    };
    if (!trip.travelers.length) throw Error('Add at least one traveler name.');
    if (initial && currency !== initial.currency && (initial.activities.some(a => a.cost > 0) || initial.bookings.some(b => b.cost > 0) || initial.expenses.length)) throw Error('Keep the original currency while this trip contains costs. Currency conversion is not available.');
    checkTrip(trip);
    await onSave(trip);
  }
  return <FormPage disabled={photoBusy} title={initial ? 'Edit Trip' : 'Plan a Trip'} onSave={submit} onClose={onClose} label={initial ? 'Save Changes' : 'Create Trip'}>
<Field label="Trip Name" value={name} onChange={setName} placeholder="My next adventure" />
<SearchField label="Country" value={country} onChange={v => {
      setCountry(v);
      setCity('');
    }} items={Object.keys(locations)} />
<SearchField label="City" value={city} onChange={setCity} items={locations[country] ?? []} />
<Text style={[s.tiny, {
      marginBottom: 18
    }]}>Suggestions are a sample list. You can type a location that is not listed.</Text>
<DateField label="Start Date" value={start} onChange={v => {
      setStart(v);
      if (end < v) setEnd('');
    }} />
<DateField key={start} label="End Date" value={end} minimum={start || undefined} disabled={!start} onChange={setEnd} />
<Field label="About Trip" value={about} onChange={setAbout} multiline placeholder="What would make this trip special?" />
<Choices label="Travel pace" items={['Relaxed', 'Moderate', 'Busy', 'Packed']} value={pace} onChange={setPace} />
<TravelerField value={travelers} onChange={setTravelers} />
<PhotoField label="Trip cover photo" kind="cover" value={coverPhoto} onChange={setCoverPhoto} onBusyChange={setPhotoBusy} />
<Text style={[s.tiny, {
      marginBottom: 18
    }]}>Names are local planning labels. Adding someone does not send an invitation.</Text>
<Choices label="Trip currency" items={['AED', 'USD', 'EUR', 'GBP', 'JMD']} value={currency} onChange={setCurrency} />
<Field label="Budget (optional)" numeric value={budget} onChange={setBudget} />
{initial && <Notice text="Activities keep their dates and destination-local times. Date changes cannot exclude existing activities." />}
</FormPage>;
}
export function ActivityForm({
  trip,
  day,
  initial,
  onSave,
  onClose
}: {
  trip: Trip;
  day: string;
  initial?: Activity;
  onSave: (a: Activity) => Promise<void>;
} & Close) {
  const [title, setTitle] = useState(initial?.title ?? ''),
    [date, setDate] = useState(initial?.date ?? day),
    [time, setTime] = useState(initial?.time ?? '');
  const [duration, setDuration] = useState(initial?.durationMinutes?.toString() ?? ''),
    [location, setLocation] = useState(initial?.location ?? ''),
    [notes, setNotes] = useState(initial?.notes ?? ''),
    [cost, setCost] = useState(String(initial?.cost ?? 0));
  const candidate: Activity = {
    id: initial?.id ?? 'draft',
    title,
    date,
    time,
    durationMinutes: duration ? Number(duration) : undefined,
    location,
    notes,
    cost: 0,
    done: initial?.done ?? false
  };
  const conflicts = validDate(date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? trip.activities.filter(a => overlaps(candidate, a)) : [];
  async function submit() {
    if (!title.trim()) throw Error('Enter an activity title.');
    if (!validDate(date) || date < trip.startDate || date > trip.endDate) throw Error('Choose a date within this trip.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Choose a time and tap Set Time.');
    if (duration && (!/^\d+$/.test(duration) || Number(duration) < 1 || Number(duration) > 1440)) throw Error('Duration must be a whole number from 1 to 1,440 minutes.');
    await onSave({
      ...candidate,
      id: initial?.id ?? uid(),
      title: title.trim(),
      cost: amount(cost || '0')
    });
  }
  return <FormPage title={initial ? 'Edit Activity' : 'Add Activity'} onSave={submit} onClose={onClose}>
<Field label="Activity Title" value={title} onChange={setTitle} placeholder="Museum, lunch, a walk…" />
<DateField label="Activity Date" minimum={trip.startDate} maximum={trip.endDate} value={date} onChange={setDate} />
<Text style={[s.tiny, {
      marginBottom: 16
    }]}>Select a date no later than {trip.endDate}. Moving the date moves this activity to that day.</Text>
<TimeField value={time} onChange={setTime} />
<Field label="Duration in minutes (optional)" numeric value={duration} onChange={setDuration} placeholder="90" />
{!!conflicts.length && <Notice text={`Overlaps: ${conflicts.map(a => a.title).join(', ')}. You can still save this plan.`} />}
<Field label="Location" value={location} onChange={setLocation} />
<Field label={`Estimated cost (${trip.currency})`} numeric value={cost} onChange={setCost} />
<Field label="Notes" multiline value={notes} onChange={setNotes} />
</FormPage>;
}
export function BookingForm({
  trip,
  initial,
  onSave,
  onClose
}: {
  trip: Trip;
  initial?: Booking;
  onSave: (b: Booking) => Promise<void>;
} & Close) {
  const [kind, setKind] = useState(initial?.kind ?? 'Accommodation'),
    [title, setTitle] = useState(initial?.title ?? ''),
    [date, setDate] = useState(initial?.date ?? trip.startDate),
    [end, setEnd] = useState(initial?.endDate ?? trip.endDate);
  const [address, setAddress] = useState(initial?.address ?? ''),
    [reference, setReference] = useState(initial?.reference ?? ''),
    [url, setUrl] = useState(initial?.url ?? ''),
    [cancel, setCancel] = useState(initial?.cancellationDate ?? ''),
    [cost, setCost] = useState(String(initial?.cost ?? 0)),
    [notes, setNotes] = useState(initial?.notes ?? '');
  async function submit() {
    if (!title.trim()) throw Error('Enter a booking title.');
    if (!validDate(date) || !validDate(end) || end < date) throw Error('Choose valid booking dates.');
    if (cancel && !validDate(cancel)) throw Error('Choose a valid cancellation date.');
    if (url && !/^https?:\/\//i.test(url)) throw Error('Enter a complete https:// or http:// booking link.');
    await onSave({
      id: initial?.id ?? uid(),
      kind,
      title: title.trim(),
      date,
      endDate: end,
      address,
      reference,
      url,
      cancellationDate: cancel,
      cost: amount(cost || '0'),
      notes
    });
  }
  return <FormPage title={initial ? 'Edit Booking' : 'Add Booking'} onSave={submit} onClose={onClose}>
<Choices label="Type" items={['Accommodation', 'Transport', 'Activity']} value={kind} onChange={setKind} />
<Field label="Booking name" value={title} onChange={setTitle} />
<DateField label="Start date" value={date} onChange={setDate} />
<DateField label="End date" value={end} minimum={date} onChange={setEnd} />
<Field label="Address or route" value={address} onChange={setAddress} />
<Field label="Confirmation reference" value={reference} onChange={setReference} />
<Field label="Provider link (optional)" value={url} onChange={setUrl} placeholder="https://…" />
<DateField label="Cancellation deadline (optional)" value={cancel} onChange={setCancel} />
{!!cancel && <Text onPress={() => setCancel('')} accessibilityRole="button" style={{
      color: '#08787A',
      marginBottom: 16
    }}>Clear cancellation date</Text>}
<Field label={`Estimated cost (${trip.currency})`} numeric value={cost} onChange={setCost} />
<Field label="Notes" multiline value={notes} onChange={setNotes} />
<Notice text="Record a booking made elsewhere. Cancellation dates appear in the app; this version does not send reminders. Avoid storing passport or payment-card details." />
</FormPage>;
}
export function ExpenseForm({
  trip,
  initial,
  onSave,
  onClose
}: {
  trip: Trip;
  initial?: Expense;
  onSave: (e: Expense) => Promise<void>;
} & Close) {
  const [title, setTitle] = useState(initial?.title ?? ''),
    [value, setValue] = useState(String(initial?.amount ?? '')),
    [paidBy, setPaidBy] = useState(initial?.paidBy ?? trip.travelers[0] ?? 'Me'),
    [split, setSplit] = useState(initial?.splitWith.join(', ') ?? trip.travelers.join(', '));
  return <FormPage title={initial ? 'Edit Expense' : 'Add Expense'} onClose={onClose} onSave={async () => {
    const names = [...new Set(split.split(',').map(x => x.trim()).filter(Boolean))];
    if (!title.trim() || !paidBy.trim() || !names.length) throw Error('Enter a title, payer and at least one person to split with.');
    await onSave({
      id: initial?.id ?? uid(),
      title: title.trim(),
      amount: amount(value),
      paidBy: paidBy.trim(),
      splitWith: names
    });
  }}>
<Field label="Expense" value={title} onChange={setTitle} placeholder="Dinner, taxi…" />
<Field label={`Amount (${trip.currency})`} numeric value={value} onChange={setValue} />
<SearchField label="Paid by" value={paidBy} onChange={setPaidBy} items={trip.travelers} />
<Field label="Split equally between (comma-separated names)" value={split} onChange={setSplit} />
<Notice text="Use consistent names. These are manual records and equal splits; no payments are sent. Estimates and actual expenses are tracked separately." />
</FormPage>;
}
export function IdeaForm({
  initial,
  collections,
  onSave,
  onClose
}: {
  initial?: Idea;
  collections: string[];
  onSave: (i: Idea) => Promise<void>;
} & Close) {
  const [title, setTitle] = useState(initial?.title ?? ''),
    [collection, setCollection] = useState(initial?.collection ?? 'Wishlist'),
    [location, setLocation] = useState(initial?.location ?? ''),
    [url, setUrl] = useState(initial?.url ?? ''),
    [notes, setNotes] = useState(initial?.notes ?? '');
  return <FormPage title={initial ? 'Edit Saved Idea' : 'Save an Idea'} onClose={onClose} onSave={async () => {
    if (!title.trim() || !collection.trim()) throw Error('Enter a title and collection.');
    if (url && !/^https?:\/\//i.test(url)) throw Error('Enter a complete https:// or http:// link.');
    await onSave({
      id: initial?.id ?? uid(),
      title: title.trim(),
      collection: collection.trim(),
      location,
      url,
      notes
    });
  }}>
<Field label="Title" value={title} onChange={setTitle} />
<SearchField label="Collection" value={collection} onChange={setCollection} items={collections} />
<Field label="Location" value={location} onChange={setLocation} />
<Field label="Link" value={url} onChange={setUrl} />
<Field label="Notes" multiline value={notes} onChange={setNotes} />
</FormPage>;
}
export function ProfileForm({
  initial,
  onSave,
  onClose
}: {
  initial: Profile;
  onSave: (p: Profile) => Promise<void>;
} & Close) {
  const [name, setName] = useState(initial.name),
    [bio, setBio] = useState(initial.bio);
  const [photo, setPhoto] = useState(initial.photo);
  const [photoBusy, setPhotoBusy] = useState(false);
  return <FormPage disabled={photoBusy} title="Edit Profile" onClose={onClose} onSave={async () => {
    if (!name.trim()) throw Error('Enter a display name.');
    await onSave({
      name: name.trim(),
      bio,
      photo
    });
  }}>
<PhotoField label="Profile photo" kind="profile" value={photo} onChange={setPhoto} onBusyChange={setPhotoBusy} />
<Field label="Display name" value={name} onChange={setName} />
<Field label="About you" value={bio} onChange={setBio} multiline />
<Notice text="This profile is saved on this device. It is not a public account." />
</FormPage>;
}
