import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Field, Notice, s } from '../ui';
export function TravelerField({ value, onChange }: { value: string[]; onChange: (names: string[]) => void }) {
  const [name, setName] = useState(''), [error, setError] = useState('');
  function add() {
    const next = name.trim();
    if (!next) return;
    if (value.some(x => x.toLowerCase() === next.toLowerCase())) { setError('That traveler is already listed.'); return; }
    onChange([...value, next]); setName(''); setError('');
  }
  return <View style={{ marginBottom: 20 }}>
    <Text style={s.label}>Travelers</Text>
    {value.map(person => <View key={person} style={[s.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
      <Text style={s.body}>{person}</Text><Button secondary label={`Remove ${person}`} onPress={() => onChange(value.filter(x => x !== person))} />
    </View>)}
    <Field label="Traveler name" value={name} onChange={setName} placeholder="Add a friend or travel partner" />
    <Button secondary label="Add Traveler" disabled={!name.trim()} onPress={add} />
    {!!error && <Notice error text={error} />}
    <Text style={s.tiny}>This is a local planning list. No invitation is sent and nobody gains editing access. Existing expense records keep their original payer names.</Text>
  </View>;
}
