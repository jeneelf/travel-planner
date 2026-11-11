import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { Editor, Trip, Profile } from './model';
import { balances, displayDate, money, overlaps, shiftDay, timeRange, totals, uid } from './logic';
import { Avatar, PlusIcon, Button, C, Cover, Empty, Notice, openLink, Section, s } from './ui';
type Props = {
  trip: Trip;
  profile: Profile;
  busy: boolean;
  onBack: () => void;
  onEdit: (e: Editor) => void;
  onDelete: () => void;
  change: (fn: (t: Trip) => Trip) => Promise<void>;
  confirm: (title: string, action: () => Promise<void>) => void;
};
export function Dashboard({
  trip,
  profile,
  busy,
  onBack,
  onEdit,
  onDelete,
  change,
  confirm
}: Props) {
  const [day, setDay] = useState(trip.startDate),
    [tab, setTab] = useState('Itinerary'),
    [task, setTask] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    setDay(d => d < trip.startDate ? trip.startDate : d > trip.endDate ? trip.endDate : d);
  }, [trip.startDate, trip.endDate]);
  async function run(fn: () => Promise<void>) {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  }
  const daily = trip.activities.filter(a => a.date === day).sort((a, b) => a.time.localeCompare(b.time));
  const costs = totals(trip),
    accommodation = trip.bookings.filter(b => b.kind === 'Accommodation');
  return <ScrollView contentContainerStyle={{
    paddingBottom: 30
  }}>
<View style={[s.row, {
      padding: 16,
      justifyContent: 'space-between'
    }]}>
<Button secondary label="‹ My Trips" onPress={onBack} />
<Button secondary label="Edit Trip" disabled={busy} onPress={() => onEdit({
        kind: 'trip',
        trip
      })} />
</View>
<Cover photo={trip.coverPhoto} city={trip.city} height={210}>
<Text style={{
        color: 'white',
        fontSize: 13,
        letterSpacing: 2
      }}>WELCOME TO</Text>
<Text style={{
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
      }}>
{trip.city.toUpperCase()}
</Text>
<Text style={{
        color: 'white',
        marginTop: 5
      }}>{trip.country} · {displayDate(trip.startDate)} – {displayDate(trip.endDate)}</Text>
</Cover>
<View style={s.content}>
<Text style={s.h2}>
{trip.name}
</Text>
<Button secondary label="Share PDF" disabled={busy} onPress={() => onEdit({kind: 'pdf', tripId: trip.id})} />
<Text style={s.muted}>{trip.pace} pace · Private · Saved on this device</Text>
{!!trip.about && <Text style={s.body}>
{trip.about}
</Text>}
{!!error && <Notice error text={error} />}
<Section title="Travelers" />
<View style={s.row}>
{trip.travelers.map((name, i) => <View key={name} style={{
          alignItems: 'center',
          maxWidth: 100
        }}>
<Avatar name={name} photo={name === 'Me' || name.toLowerCase() === profile.name.toLowerCase() ? profile.photo : undefined} />
<Text style={s.tiny}>
{name}
</Text>
</View>)}
<View style={{ alignItems: 'center' }}>
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Add travelers"
    disabled={busy}
    onPress={() => onEdit({
      kind: 'travelers',
      tripId: trip.id
    })}
    style={{
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.pale,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: busy ? 0.5 : 1
    }}
  >
    <PlusIcon />
  </Pressable>
  <Text style={s.tiny}>Add</Text>
</View>
</View>
<Text style={[s.tiny, {
        marginTop: 8
      }]}>Planning labels only · invitations and messaging come later</Text>
<Section title="Accommodations" action="+ Add" onPress={() => onEdit({
        kind: 'booking',
        tripId: trip.id
      })} />
{!accommodation.length ? <Empty title="A place to stay" detail="Add your accommodation details after booking with a provider." /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{
        gap: 12
      }}>
{accommodation.map(b => <Pressable key={b.id} accessibilityRole="button" onPress={() => onEdit({
          kind: 'booking',
          tripId: trip.id,
          booking: b
        })} style={[s.card, {
          width: 260,
          padding: 16,
          backgroundColor: '#F3FAF9'
        }]}>
<Text style={s.tiny}>ACCOMMODATION</Text>
<Text style={s.h3}>
{b.title}
</Text>
<Text style={s.muted}>
{b.address}
</Text>
<Text style={s.tiny}>{displayDate(b.date)} – {displayDate(b.endDate)}</Text>
<Text style={[s.body, {
            marginTop: 10
          }]}>
{money(b.cost, trip.currency)}
</Text>
</Pressable>)}
</ScrollView>}
<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{
        gap: 8,
        marginVertical: 14
      }}>
{['Itinerary', 'Bookings', 'Budget', 'Checklist'].map(t => <Pressable key={t} accessibilityRole="button" accessibilityState={{
          selected: tab === t
        }} onPress={() => setTab(t)} style={[s.chip, tab === t && s.chipSelected]}>
<Text style={s.body}>
{t}
</Text>
</Pressable>)}
</ScrollView>
{tab === 'Itinerary' && <View>
<View style={[s.row, {
          justifyContent: 'space-between',
          marginBottom: 16
        }]}>
<Button secondary label="‹" disabled={day === trip.startDate} onPress={() => setDay(shiftDay(day, -1))} />
<Text style={s.h3}>
{displayDate(day)}
</Text>
<Button secondary label="›" disabled={day === trip.endDate} onPress={() => setDay(shiftDay(day, 1))} />
</View>
<Button label="+ Add Activity" disabled={busy} onPress={() => onEdit({
          kind: 'activity',
          tripId: trip.id,
          day
        })} />
<Text style={[s.tiny, {
          marginVertical: 12
        }]}>Destination-local time · tap a card to edit or move it</Text>
{!daily.length && <Empty title="Room for something good" detail="Add an activity, a meal, or simply some free time." />}
{daily.map(a => <View key={a.id} style={s.card}>
<Pressable accessibilityRole="button" accessibilityLabel={`Edit ${a.title}`} onPress={() => onEdit({
            kind: 'activity',
            tripId: trip.id,
            day,
            activity: a
          })} style={[s.pad, {
            borderLeftWidth: 4,
            borderLeftColor: a.done ? '#B5D4C0' : C.teal
          }]}>
<Text style={{
              color: '#08787A',
              fontWeight: '700',
              marginBottom: 6
            }}>
{timeRange(a)}
</Text>
<Text style={[s.h3, a.done && {
              textDecorationLine: 'line-through'
            }]}>
{a.title}
</Text>
{!!a.location && <Text style={s.muted}>
{a.location}
</Text>}
{!!a.notes && <Text style={s.muted}>
{a.notes}
</Text>}
{a.cost > 0 && <Text style={s.tiny}>{money(a.cost, trip.currency)} estimated</Text>}
{trip.activities.some(b => overlaps(a, b)) && <Text style={{
              color: '#9B4A10',
              marginTop: 8
            }}>Overlaps another activity</Text>}
</Pressable>
<View style={[s.row, {
            padding: 12
          }]}>
<Button secondary disabled={busy} label={a.done ? 'Mark not done' : 'Mark done'} onPress={() => {
              void run(() => change(t => ({
                ...t,
                activities: t.activities.map(x => x.id === a.id ? {
                  ...x,
                  done: !x.done
                } : x)
              })));
            }} />
<Button secondary label="Delete" disabled={busy} onPress={() => confirm(`Delete “${a.title}”?`, () => change(t => ({
              ...t,
              activities: t.activities.filter(x => x.id !== a.id)
            })))} />
</View>
</View>)}
</View>}
{tab === 'Bookings' && <View>
<Section title="Booking records" action="+ Add" onPress={() => onEdit({
          kind: 'booking',
          tripId: trip.id
        })} />
<Notice text="Manually entered records. Links open external providers. Cancellation dates are displayed here; notifications are not scheduled." />
{!trip.bookings.length && <Empty title="Keep your confirmations together" detail="Add accommodation, transport and activity bookings." />}
{trip.bookings.map(b => <View key={b.id} style={[s.card, s.pad]}>
<Text style={s.tiny}>
{b.kind.toUpperCase()}
</Text>
<Text style={s.h3}>
{b.title}
</Text>
<Text style={s.muted}>{displayDate(b.date)} – {displayDate(b.endDate)}</Text>
{!!b.address && <Text style={s.body}>
{b.address}
</Text>}
{!!b.reference && <Text selectable style={s.muted}>Reference: {b.reference}</Text>}
{!!b.cancellationDate && <Text style={{
            color: '#9B4A10',
            marginVertical: 8
          }}>Cancellation deadline: {displayDate(b.cancellationDate)}</Text>}
{!!b.notes && <Text style={s.muted}>
{b.notes}
</Text>}
<Text style={s.body}>{money(b.cost, trip.currency)} estimated</Text>
<View style={[s.row, {
            marginTop: 12
          }]}>
<Button secondary label="Edit" onPress={() => onEdit({
              kind: 'booking',
              tripId: trip.id,
              booking: b
            })} />
{!!b.url && <Button secondary label="Provider ↗" onPress={() => {
              void run(() => openLink(b.url));
            }} />}
<Button secondary disabled={busy} label="Delete" onPress={() => confirm(`Delete “${b.title}”?`, () => change(t => ({
              ...t,
              bookings: t.bookings.filter(x => x.id !== b.id)
            })))} />
</View>
</View>)}
</View>}
{tab === 'Budget' && <View>
<Section title="Trip budget" action="Edit budget" onPress={() => onEdit({
          kind: 'trip',
          trip
        })} />
<View style={[s.card, s.pad, {
          backgroundColor: C.pale
        }]}>
<Text style={s.tiny}>BUDGET</Text>
<Text style={s.h1}>
{trip.budget ? money(trip.budget, trip.currency) : 'Not set'}
</Text>
<Text style={s.muted}>Estimated: {money(costs.estimated, trip.currency)}</Text>
<Text style={s.muted}>Actual spending: {money(costs.actual, trip.currency)}</Text>
{trip.budget > 0 && <Text style={[s.h3, {
            marginTop: 8,
            color: costs.actual > trip.budget ? C.red : C.ink
          }]}>
{money(Math.abs(trip.budget - costs.actual), trip.currency)}
{costs.actual > trip.budget ? 'over budget' : 'remaining'}
</Text>}
</View>
<Notice text="Estimates add activity and booking costs. Record an estimate in one place to avoid double counting. Actual expenses are a separate total; currencies are not converted." />
<Section title="Actual expenses" action="+ Add" onPress={() => onEdit({
          kind: 'expense',
          tripId: trip.id
        })} />
{!trip.expenses.length && <Empty title="Know where it goes" detail="Record spending and who paid, then split it equally between named travelers." />}
{trip.expenses.map(e => <View key={e.id} style={[s.card, s.pad]}>
<Text style={s.h3}>{e.title} · {money(e.amount, trip.currency)}</Text>
<Text style={s.muted}>Paid by {e.paidBy}</Text>
<Text style={s.tiny}>Split between {e.splitWith.join(', ')}</Text>
<View style={[s.row, {
            marginTop: 12
          }]}>
<Button secondary label="Edit" onPress={() => onEdit({
              kind: 'expense',
              tripId: trip.id,
              expense: e
            })} />
<Button secondary disabled={busy} label="Delete" onPress={() => confirm(`Delete expense “${e.title}”?`, () => change(t => ({
              ...t,
              expenses: t.expenses.filter(x => x.id !== e.id)
            })))} />
</View>
</View>)}
{!!trip.expenses.length && <View style={[s.card, s.pad]}>
<Text style={s.h3}>Equal-split balances</Text>
{balances(trip).map(b => <Text key={b.name} style={s.muted}>{b.name}: {b.amount === 0 ? 'settled' : `${b.amount > 0 ? 'is owed' : 'owes'} ${money(Math.abs(b.amount), trip.currency)}`}</Text>)}
<Text style={s.tiny}>Calculated records only. No money is transferred.</Text>
</View>}
</View>}
{tab === 'Checklist' && <View>
<Section title="Before you go" />
<TextInput accessibilityLabel="New preparation task" placeholder="Add a preparation task" value={task} onChangeText={setTask} style={s.input} />
<Button label="Add Task" disabled={busy || !task.trim()} onPress={() => {
          const title = task.trim();
          void run(async () => {
            await change(t => ({
              ...t,
              tasks: [...t.tasks, {
                id: uid(),
                title,
                done: false
              }]
            }));
            setTask('');
          });
        }} />
<Text style={[s.muted, {
          marginVertical: 12
        }]}>{trip.tasks.filter(t => t.done).length} of {trip.tasks.length} complete</Text>
{!trip.tasks.length && <Empty title="Leave with a clear head" detail="Add packing, check-in, document checks and anything else you want to remember." />}
{trip.tasks.map(task => <View key={task.id} style={[s.card, s.pad]}>
<Pressable accessibilityRole="checkbox" accessibilityState={{
            checked: task.done
          }} disabled={busy} onPress={() => {
            void run(() => change(t => ({
              ...t,
              tasks: t.tasks.map(x => x.id === task.id ? {
                ...x,
                done: !x.done
              } : x)
            })));
          }}>
<Text style={[s.body, task.done && {
              textDecorationLine: 'line-through'
            }]}>
{task.done ? '☑' : '□'}
{task.title}
</Text>
</Pressable>
<View style={{
            alignSelf: 'flex-end'
          }}>
<Button secondary disabled={busy} label="Remove" onPress={() => confirm(`Remove “${task.title}”?`, () => change(t => ({
              ...t,
              tasks: t.tasks.filter(x => x.id !== task.id)
            })))} />
</View>
</View>)}
</View>}
<View style={{
        marginTop: 32
      }}>
<Button secondary label="Delete Trip" disabled={busy} onPress={onDelete} />
<Text style={[s.tiny, {
          marginTop: 10
        }]}>{trip.coverPhoto ? 'Your selected cover photo. This trip is not published.' : 'Cover photographs are illustrative. This trip is not published.'}</Text>
</View>
</View>
</ScrollView>;
}
