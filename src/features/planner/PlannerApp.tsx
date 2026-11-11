import { TravelersForm } from './components/TravelersForm';
import { SharePdfForm } from './components/SharePdfForm';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Data, Editor, Template, Trip } from './model';
import { usePlanner } from './storage';
import { displayDate, makeTemplate, readData, today, uid } from './logic';
import { templates } from './sampleData';
import { ActivityForm, BookingForm, ExpenseForm, IdeaForm, ProfileForm, TripForm } from './Forms';
import { Dashboard } from './Dashboard';
import { Avatar, PlusIcon, Button, C, Cover, Empty, FormPage, Notice, openLink, Section, s } from './ui';
import { DateField } from './components/DateField';
export default function PlannerApp() {
  const {
    data,
    loading,
    loadError,
    saving,
    save
  } = usePlanner();
  const [tab, setTab] = useState('Trips'),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [editor, setEditor] = useState<Editor | null>(null);
  const [query, setQuery] = useState(''),
    [collection, setCollection] = useState('All'),
    [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    title: string;
    action: () => Promise<void>;
  } | null>(null);
  const [preview, setPreview] = useState<Template | null>(null),
    [templateStart, setTemplateStart] = useState(today());
  const [restoreCandidate, setRestoreCandidate] = useState<Data | null>(null);
  const [backupOpen, setBackupOpen] = useState(false),
    [importText, setImportText] = useState('');
  const trip = data.trips.find(t => t.id === selectedId);
  const editorTrip = editor && 'tripId' in editor ? data.trips.find(t => t.id === editor.tripId) : undefined;
  const collections = [...new Set(data.ideas.map(i => i.collection))].sort();
  const selectedIdeas = data.ideas.filter(i => (collection === 'All' || i.collection === collection) && `${i.title} ${i.location} ${i.notes}`.toLowerCase().includes(query.toLowerCase()));
  function confirm(title: string, action: () => Promise<void>) {
    setConfirmation({
      title,
      action
    });
  }
  async function run(action: () => Promise<void>) {
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  }
  async function changeTrip(id: string, change: (trip: Trip) => Trip) {
    await save(previous => {
      if (!previous.trips.some(t => t.id === id)) throw Error('This trip no longer exists.');
      return {
        ...previous,
        trips: previous.trips.map(t => t.id === id ? change(t) : t)
      };
    });
  }
  function navigate(next: string) {
    setTab(next);
    setSelectedId(null);
    setQuery('');
    setError('');
  }
  function openEditor(next: Editor) {
    setEditor(next);
    setError('');
  }
  function closeEditor() {
    if (!saving) setEditor(null);
  }
  async function storeTrip(next: Trip) {
    await save(previous => {
      const original = previous.trips.find(t => t.id === next.id);
      // Preserve the current activity list when editing trip details.
      const updated = original ? {
        ...next,
        activities: original.activities,
        bookings: original.bookings,
        expenses: original.expenses,
        tasks: original.tasks
      } : next;
      return {
        ...previous,
        trips: original ? previous.trips.map(t => t.id === next.id ? updated : t) : [...previous.trips, updated]
      };
    });
    setSelectedId(next.id);
    setTab('Trips');
  }
  function tripCards(trips: Trip[]) {
    return trips.map(t => <Pressable key={t.id} accessibilityRole="button" accessibilityLabel={`Open ${t.name}`} style={s.card} onPress={() => {
      setSelectedId(t.id);
      setTab('Trips');
    }}>
<Cover city={t.city} photo={t.coverPhoto} />
<View style={s.pad}>
<Text style={s.h3}>{t.city}, {t.country}</Text>
<Text style={s.body}>
{t.name}
</Text>
<Text style={s.tiny}>{displayDate(t.startDate)} – {displayDate(t.endDate)}</Text>
</View>
</Pressable>);
  }
  if (loading) return <SafeAreaView style={s.screen}>
<View style={s.content}>
<Text style={s.h2}>Opening your planner…</Text>
</View>
</SafeAreaView>;
  if (loadError) return <SafeAreaView style={s.screen}>
<View style={s.content}>
<Text style={s.h2}>Your data needs attention</Text>
<Notice error text={loadError} />
<Text style={s.body}>Reload to retry. If this continues, share this message before clearing any app data.</Text>
</View>
</SafeAreaView>;
  return <SafeAreaView style={s.screen}>
<View style={s.container}>
{!!error && <View style={{
        padding: 12
      }}>
<Notice error text={error} />
<Button secondary label="Dismiss" onPress={() => setError('')} />
</View>}
{trip ? <Dashboard key={trip.id} trip={trip} profile={data.profile} busy={saving} onBack={() => setSelectedId(null)} onEdit={openEditor} change={fn => changeTrip(trip.id, fn)} confirm={confirm} onDelete={() => confirm(`Delete “${trip.name}” and all its activities, bookings, expenses and tasks? This cannot be undone in the app.`, async () => {
        await save(d => ({
          ...d,
          trips: d.trips.filter(t => t.id !== trip.id)
        }));
        setSelectedId(null);
      })} /> : <ScrollView contentContainerStyle={{
        paddingBottom: 24
      }}>
{tab === 'Trips' && <View>
<View style={s.header}>
<Text style={s.tiny}>YOUR NEXT CHAPTER</Text>
<Text style={[s.h1, {
              marginTop: 8
            }]}>Hello, {data.profile.name}</Text>
<Text style={s.muted}>A little planning. A lot to look forward to.</Text>
</View>
<View style={s.content}>
<Section title="My Trips" action="+ Plan a Trip" onPress={() => openEditor({
              kind: 'trip'
            })} />
<TextInput accessibilityLabel="Search trips" placeholder="Search your trips" value={query} onChangeText={setQuery} style={[s.input, {
              borderColor: C.line
            }]} />
{!data.trips.length ? <Empty title="Where are you heading?" detail="Create your first trip, or customize a starter itinerary in Discover." /> : tripCards(data.trips.filter(t => `${t.name} ${t.city} ${t.country}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.startDate.localeCompare(b.startDate)))}
{!!data.trips.length && !data.trips.some(t => `${t.name} ${t.city} ${t.country}`.toLowerCase().includes(query.toLowerCase())) && <Empty title="No matching trips" detail="Try another destination or trip name." />}
<Button secondary label="Browse starter itineraries" onPress={() => navigate('Discover')} />
</View>
</View>}
{tab === 'Discover' && <View>
<View style={s.header}>
<Text style={s.tiny}>MAKE IT YOURS</Text>
<Text style={s.h1}>A place to start</Text>
<Text style={s.muted}>Simple itineraries, ready for your own ideas.</Text>
</View>
<View style={s.content}>
<Notice text="Sample itineraries, not live community posts. Opening hours, availability, travel times and prices have not been verified." />
{templates.map(t => <View key={t.id} style={s.card}>
<Cover city={t.city} />
<View style={s.pad}>
<Text style={s.h3}>
{t.title}
</Text>
<Text style={s.tiny}>{t.city}, {t.country} · {t.days} days · SAMPLE</Text>
<Text style={s.muted}>
{t.description}
</Text>
<View style={[s.row, {
                  marginTop: 16
                }]}>
<Button label="View itinerary" onPress={() => {
                    setTemplateStart(today());
                    setPreview(t);
                  }} />
<Button secondary disabled={saving} label={data.ideas.some(i => i.url === `template:${t.id}`) ? 'Saved' : 'Save idea'} onPress={() => {
                    void run(async () => {
                      await save(d => d.ideas.some(i => i.url === `template:${t.id}`) ? d : {
                        ...d,
                        ideas: [...d.ideas, {
                          id: uid(),
                          title: t.title,
                          collection: 'Starter itineraries',
                          location: `${t.city}, ${t.country}`,
                          notes: t.description,
                          url: `template:${t.id}`
                        }]
                      });
                    });
                  }} />
</View>
</View>
</View>)}
</View>
</View>}
{tab === 'Saved' && <View>
<View style={s.header}>
<Text style={s.tiny}>FOR SOMEDAY OR NEXT WEEK</Text>
<Text style={s.h1}>Your collections</Text>
<Text style={s.muted}>Keep places, activities and links before you plan a trip.</Text>
</View>
<View style={s.content}>
<Button label="+ Save an Idea" onPress={() => openEditor({
              kind: 'idea'
            })} />
<TextInput accessibilityLabel="Search saved ideas" placeholder="Search ideas" value={query} onChangeText={setQuery} style={[s.input, {
              marginTop: 16,
              borderColor: C.line
            }]} />
<ScrollView horizontal contentContainerStyle={{
              gap: 8,
              marginBottom: 16
            }}>
{['All', ...collections].map(c => <Pressable key={c} accessibilityRole="button" onPress={() => setCollection(c)} style={[s.chip, collection === c && s.chipSelected]}>
<Text style={s.body}>
{c}
</Text>
</Pressable>)}
</ScrollView>
{!selectedIdeas.length && <Empty title="Keep the good ideas" detail="Save a place or link and give it a collection name." />}
{selectedIdeas.map(i => <View key={i.id} style={[s.card, s.pad]}>
<Text style={s.tiny}>
{i.collection.toUpperCase()}
</Text>
<Text style={s.h3}>
{i.title}
</Text>
<Text style={s.muted}>
{i.location}
</Text>
<Text style={s.muted}>
{i.notes}
</Text>
<View style={[s.row, {
                marginTop: 12
              }]}>
{i.url.startsWith('template:') ? <Button secondary label="View template" onPress={() => {
                  const t = templates.find(t => `template:${t.id}` === i.url);
                  if (t) {
                    setTemplateStart(today());
                    setPreview(t);
                  }
                }} /> : <Button secondary label="Edit" onPress={() => openEditor({
                  kind: 'idea',
                  idea: i
                })} />}
{!!i.url && !i.url.startsWith('template:') && <Button secondary label="Open link ↗" onPress={() => {
                  void run(() => openLink(i.url));
                }} />}
<Button secondary disabled={saving} label="Delete" onPress={() => confirm(`Delete saved idea “${i.title}”?`, () => save(d => ({
                  ...d,
                  ideas: d.ideas.filter(x => x.id !== i.id)
                })))} />
</View>
</View>)}
</View>
</View>}
{tab === 'Profile' && <View>
<View style={[s.header, {
            alignItems: 'center'
          }]}>
<Avatar name={data.profile.name} photo={data.profile.photo} size={76} />
<Text style={[s.h1, {
              marginTop: 12
            }]}>
{data.profile.name}
</Text>
<Text style={s.muted}>
{data.profile.bio}
</Text>
<View style={[s.row, {
              marginTop: 18
            }]}>
<Text style={s.body}>{data.trips.length} trips</Text>
<Text style={s.body}>· {data.ideas.length} saved ideas</Text>
</View>
</View>
<View style={s.content}>
<Button secondary label="Edit Profile" onPress={() => openEditor({
              kind: 'profile'
            })} />
<Section title="My itineraries" />
{tripCards(data.trips)}
{!data.trips.length && <Empty title="Your story starts here" detail="The trips you create will appear on your profile." />}
<Notice text="Local profile only. Trips are not published or shared. Following, messaging, invitations and public comments need an online account system." />
<Button label="Back up or restore my planner" onPress={() => {
              setImportText('');
              setBackupOpen(true);
            }} />
<Text style={[s.tiny, {
              marginTop: 12
            }]}>Your data stays on this device/browser. Uninstalling or clearing site data may remove it. Export a backup before major changes.</Text>
</View>
</View>}
</ScrollView>}
<View style={s.nav}>
{[{
          label: 'Trips',
          icon: '⌂'
        }, {
          label: 'Discover',
          icon: '⌕'
        }, {
          label: 'Create',
          icon: '+'
        }, {
          label: 'Saved',
          icon: '♡'
        }, {
          label: 'Profile',
          icon: '○'
        }].map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label === 'Create' ? 'Plan a Trip' : item.label} accessibilityState={{
          selected: tab === item.label
        }} disabled={saving} style={s.navItem} onPress={() => item.label === 'Create' ? openEditor({
          kind: 'trip'
        }) : navigate(item.label)}>
{item.label === 'Create' ? <View style={s.plus}>
<PlusIcon />
</View> : <><Text style={{
              fontSize: 25,
              color: tab === item.label ? '#08787A' : C.muted
            }}>
{item.icon}
</Text><Text style={[s.navText, tab === item.label && {
              color: '#08787A',
              fontWeight: '700'
            }]}>
{item.label}
</Text></>}
</Pressable>)}
</View>
</View>
<Modal visible={!!editor} animationType="slide" onRequestClose={closeEditor}>
{editor?.kind === 'trip' && <TripForm initial={editor.trip} onClose={closeEditor} onSave={storeTrip} />}
{editor?.kind === 'activity' && editorTrip && <ActivityForm trip={editorTrip} day={editor.day} initial={editor.activity} onClose={closeEditor} onSave={a => changeTrip(editorTrip.id, t => ({
        ...t,
        activities: t.activities.some(x => x.id === a.id) ? t.activities.map(x => x.id === a.id ? a : x) : [...t.activities, a]
      }))} />}
{editor?.kind === 'booking' && editorTrip && <BookingForm trip={editorTrip} initial={editor.booking} onClose={closeEditor} onSave={b => changeTrip(editorTrip.id, t => ({
        ...t,
        bookings: t.bookings.some(x => x.id === b.id) ? t.bookings.map(x => x.id === b.id ? b : x) : [...t.bookings, b]
      }))} />}
{editor?.kind === 'expense' && editorTrip && <ExpenseForm trip={editorTrip} initial={editor.expense} onClose={closeEditor} onSave={e => changeTrip(editorTrip.id, t => ({
        ...t,
        expenses: t.expenses.some(x => x.id === e.id) ? t.expenses.map(x => x.id === e.id ? e : x) : [...t.expenses, e]
      }))} />}
{editor?.kind === 'idea' && <IdeaForm initial={editor.idea} collections={collections} onClose={closeEditor} onSave={i => save(d => ({
        ...d,
        ideas: d.ideas.some(x => x.id === i.id) ? d.ideas.map(x => x.id === i.id ? i : x) : [...d.ideas, i]
      }))} />}
{editor?.kind === 'travelers' && editorTrip && <TravelersForm
  key={editorTrip.id}
  trip={editorTrip}
  onClose={closeEditor}
  onSave={names => changeTrip(
    editorTrip.id,
    current => ({ ...current, travelers: names })
  )}
/>}
{editor?.kind === 'pdf'  && editorTrip && <SharePdfForm trip={editorTrip} onClose={closeEditor} />}
{editor?.kind === 'profile' && <ProfileForm initial={data.profile} onClose={closeEditor} onSave={profile => save(d => ({
        ...d,
        profile
      }))} />}
</Modal>
<Modal visible={!!confirmation} transparent animationType="fade" onRequestClose={() => {
      if (!saving) setConfirmation(null);
    }}>
<View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.4)',
        justifyContent: 'center',
        padding: 24
      }}>
<View style={[s.card, s.pad, {
          width: '100%',
          maxWidth: 500,
          alignSelf: 'center'
        }]}>
<Text style={[s.h2, {
            marginBottom: 20
          }]}>
{confirmation?.title}
</Text>
<Button secondary disabled={saving} label="Cancel" onPress={() => setConfirmation(null)} />
<View style={{
            height: 12
          }} />
<Button danger disabled={saving} label={saving ? 'Saving…' : 'Confirm'} onPress={() => {
            if (confirmation) void run(async () => {
              await confirmation.action();
              setConfirmation(null);
            });
          }} />
{!!error && <Notice error text={error} />}
</View>
</View>
</Modal>
<Modal visible={!!preview} animationType="slide" onRequestClose={() => {
      if (!saving) setPreview(null);
    }}>
{preview && <FormPage title={preview.title} label="Create My Copy" onClose={() => setPreview(null)} onSave={async () => {
        await storeTrip(makeTemplate(preview, templateStart));
      }}>
<Cover city={preview.city} />
<Text style={[s.body, {
          marginVertical: 16
        }]}>
{preview.description}
</Text>
<Notice text="Sample itinerary. Confirm actual opening hours, ticket availability and transport before traveling. Costs start at zero until you enter estimates." />
<DateField label="Your start date" value={templateStart} onChange={setTemplateStart} />
{preview.items.map((a, i) => <View key={i} style={[s.card, s.pad]}>
<Text style={s.tiny}>DAY {a.day + 1}</Text>
<Text style={s.h3}>
{a.title}
</Text>
<Text style={s.muted}>{a.location} · {a.duration} min</Text>
</View>)}
</FormPage>}
</Modal>
<Modal visible={backupOpen} animationType="slide" onRequestClose={() => {
      if (!saving) setBackupOpen(false);
    }}>
<SafeAreaView style={s.screen}>
<ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
<Button secondary label="Close" disabled={saving} onPress={() => setBackupOpen(false)} />
<Text style={[s.h1, {
            marginVertical: 20
          }]}>Your planner backup</Text>
<Notice text="This JSON includes your trip notes, booking references and expense records. Keep the backup somewhere private. Restoring replaces this device’s current planner." />
<Text style={s.label}>Export: select and copy all the text below</Text>
<TextInput accessibilityLabel="Planner backup JSON" multiline editable={false} selectTextOnFocus value={JSON.stringify(data, null, 2)} style={[s.input, {
            height: 220,
            fontSize: 12
          }]} />
<Button secondary label="Share backup text" onPress={() => {
            void run(async () => {
              await Share.share({
                message: JSON.stringify(data, null, 2)
              });
            });
          }} />
<Text style={[s.label, {
            marginTop: 24
          }]}>Restore: paste a version 2 backup</Text>
<TextInput accessibilityLabel="Paste backup JSON" multiline value={importText} onChangeText={value => {
            setImportText(value);
            setRestoreCandidate(null);
          }} style={[s.input, {
            height: 180,
            fontSize: 12
          }]} />
<Button label="Review Restore" disabled={saving || !importText.trim()} onPress={() => {
            try {
              const restored = readData(importText);
              setError('');
              setRestoreCandidate(restored);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Invalid backup.');
            }
          }} />
{!!error && <Notice error text={error} />}
{restoreCandidate && <View style={{
            marginTop: 20
          }}>
<Notice text={`Replace all current data with ${restoreCandidate.trips.length} trips and ${restoreCandidate.ideas.length} ideas? Export your current backup first.`} />
<Button danger disabled={saving} label="Confirm Restore" onPress={() => {
              void run(async () => {
                await save(() => restoreCandidate);
                setSelectedId(null);
                setTab('Trips');
                setRestoreCandidate(null);
                setBackupOpen(false);
              });
            }} />
<Button secondary label="Cancel Restore" disabled={saving} onPress={() => setRestoreCandidate(null)} />
</View>}
</ScrollView>
</SafeAreaView>
</Modal>
</SafeAreaView>;
}
