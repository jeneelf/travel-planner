import { useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { choosePhoto } from '../photos';
import { Button, Notice, s } from '../ui';
type Props = { label: string; kind: 'profile' | 'cover'; value?: string; onChange: (value: string | undefined) => void; onBusyChange: (busy: boolean) => void };
export function PhotoField({ label, kind, value, onChange, onBusyChange }: Props) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const locked = useRef(false);
  async function pick() {
    if (locked.current) return;
    locked.current = true; setBusy(true); onBusyChange(true); setError('');
    try { const photo = await choosePhoto(kind); if (photo) onChange(photo); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not open that photo.'); }
    finally { locked.current = false; setBusy(false); onBusyChange(false); }
  }
  return <View style={{ marginBottom: 22 }}>
    <Text style={s.label}>{label}</Text>
    {!!value && <Image accessibilityLabel={label} source={{ uri: value }} style={kind === 'profile' ? { width: 96, height: 96, borderRadius: 48, marginBottom: 12 } : { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 }} />}
    <View style={s.row}>
      <Button secondary disabled={busy} label={busy ? 'Preparing photo…' : value ? 'Change Photo' : 'Choose Photo'} onPress={() => { void pick(); }} />
      {!!value && <Button secondary disabled={busy} label="Remove Photo" onPress={() => onChange(undefined)} />}
    </View>
    {!!error && <Notice error text={error} />}
    <Text style={s.tiny}>Saved on this device after you save the form. {kind === 'profile' ? 'Profile photos use a centered square crop.' : 'Your cover replaces the sample image.'}</Text>
  </View>;
}
