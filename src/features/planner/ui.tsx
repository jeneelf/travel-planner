import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const C = {
  teal: '#19BFC2',
  ink: '#173235',
  muted: '#617579',
  orange: '#FF850A',
  line: '#E0EAEA',
  pale: '#ECF8F7',
  red: '#B42318'
};
export const photos: Record<string, string> = {
  Milan: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1000&q=80',
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80',
  'Abu Dhabi': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1000&q=80'
};
export const defaultPhoto = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&q=80';
export function Cover({
  city,
  photo,
  children,
  height = 170
}: {
  city: string;
  photo?: string;
  children?: ReactNode;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  const uri = photo ?? photos[city] ?? defaultPhoto;
  useEffect(() => setFailed(false), [uri]);
  return <View style={{
    height,
    backgroundColor: '#65C8C5',
    overflow: 'hidden',
    justifyContent: 'flex-end'
  }}>
{!failed && <Image accessible={false} source={{
      uri
    }} onError={() => setFailed(true)} style={StyleSheet.absoluteFill} />}
{children && <View style={{
      backgroundColor: 'rgba(0,0,0,0.35)',
      padding: 22
    }}>
{children}
</View>}
</View>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  danger = false,
  disabled = false
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{
    disabled
  }} disabled={disabled} onPress={onPress} style={({
    pressed
  }) => [s.button, secondary && s.secondary, danger && {
    backgroundColor: C.red
  }, (disabled || pressed) && {
    opacity: .55
  }]}>
<Text style={[s.buttonText, danger && {
      color: 'white'
    }]}>
{label}
</Text>
</Pressable>;
}
export function Field({
  label,
  value,
  onChange,
  placeholder = '',
  multiline = false,
  numeric = false
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return <View>
<Text style={s.label}>
{label}
</Text>
<TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#819194" keyboardType={numeric ? 'decimal-pad' : 'default'} multiline={multiline} style={[s.input, multiline && {
      minHeight: 90,
      textAlignVertical: 'top'
    }]} />
</View>;
}
export function Choices({
  label,
  items,
  value,
  onChange
}: {
  label: string;
  items: string[];
  value: string;
  onChange: (text: string) => void;
}) {
  return <View style={{
    marginBottom: 18
  }}>
<Text style={s.label}>
{label}
</Text>
<View style={s.row}>
{items.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{
        selected: value === item
      }} onPress={() => onChange(item)} style={[s.chip, value === item && s.chipSelected]}>
<Text style={s.body}>
{item}
</Text>
</Pressable>)}
</View>
</View>;
}
export function SearchField({
  label,
  value,
  onChange,
  items
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  items: string[];
}) {
  const [open, setOpen] = useState(false);
  const results = items.filter(x => x.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
  return <View>
<Text style={s.label}>
{label}
</Text>
<TextInput accessibilityLabel={label} style={s.input} value={value} placeholder="Type or select" onFocus={() => setOpen(true)} onChangeText={v => {
      onChange(v);
      setOpen(true);
    }} />
{open && <View style={[s.card, {
      marginTop: -10
    }]}>
{results.map(x => <Pressable key={x} accessibilityRole="button" onPress={() => {
        onChange(x);
        setOpen(false);
      }} style={{
        padding: 12
      }}>
<Text style={s.body}>
{x}
</Text>
</Pressable>)}
<Button secondary label={results.length ? 'Close suggestions' : 'Keep typed location'} onPress={() => setOpen(false)} />
</View>}
</View>;
}
export function Empty({
  title,
  detail
}: {
  title: string;
  detail: string;
}) {
  return <View style={s.empty}>
<Text style={s.h2}>
{title}
</Text>
<Text style={s.muted}>
{detail}
</Text>
</View>;
}
export function Section({
  title,
  action,
  onPress
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return <View style={s.section}>
<Text style={s.h2}>
{title}
</Text>
{action && onPress && <Button secondary label={action} onPress={onPress} />}
</View>;
}
export function Notice({
  text,
  error = false
}: {
  text: string;
  error?: boolean;
}) {
  return <Text accessibilityRole={error ? 'alert' : undefined} style={[s.notice, error && {
    color: C.red,
    backgroundColor: '#FFF1EE'
  }]}>
{text}
</Text>;
}
export function FormPage({
  title,
  children,
  onClose,
  onSave,
  disabled = false,
  label = 'Save'
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => Promise<void>;
  disabled?: boolean;
  label?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit() {
    if (busy || disabled) return;
    setBusy(true);
    setError('');
    try {
      await onSave();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }
  return <SafeAreaView style={s.screen}>
<KeyboardAvoidingView style={{
      flex: 1
    }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.form}>
<Button secondary label="Cancel" disabled={busy || disabled} onPress={onClose} />
<Text style={[s.h1, {
          marginTop: 20
        }]}>
{title}
</Text>
<View style={s.progress} />
<View pointerEvents={busy ? 'none' : 'auto'}>
{children}
</View>
{!!error && <Notice text={error} error />}
<Button label={busy ? 'Saving…' : label} disabled={busy || disabled} onPress={() => {
          void submit();
        }} />
</ScrollView>
</KeyboardAvoidingView>
</SafeAreaView>;
}
export async function openLink(url: string) {
  if (!/^https?:\/\//i.test(url)) throw Error('Use a complete http:// or https:// link.');
  await Linking.openURL(url);
}
export const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 1050,
    alignSelf: 'center'
  },
  content: {
    padding: 20,
    paddingBottom: 30
  },
  form: {
    padding: 24,
    paddingBottom: 50,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center'
  },
  header: {
    backgroundColor: '#C6F0EC',
    padding: 24,
    paddingTop: 28
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: C.ink
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: C.ink
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    color: C.ink
  },
  body: {
    fontSize: 15,
    color: C.ink,
    lineHeight: 22
  },
  muted: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
    marginTop: 5
  },
  tiny: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 18
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center'
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 24,
    marginBottom: 14
  },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: 'white'
  },
  pad: {
    padding: 16
  },
  button: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '700'
  },
  secondary: {
    backgroundColor: C.pale
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: C.ink,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: C.orange,
    borderRadius: 6,
    padding: 13,
    fontSize: 16,
    color: C.ink,
    marginBottom: 18,
    backgroundColor: 'white'
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: '#F0F5F5',
    minHeight: 44
  },
  chipSelected: {
    backgroundColor: '#ABE9E7',
    borderWidth: 1,
    borderColor: C.teal
  },
  empty: {
    padding: 24,
    borderRadius: 14,
    backgroundColor: C.pale,
    marginBottom: 16
  },
  notice: {
    padding: 12,
    backgroundColor: '#EFF7F6',
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    borderRadius: 8,
    marginBottom: 16
  },
  progress: {
    height: 4,
    backgroundColor: C.orange,
    borderRadius: 4,
    marginTop: 18,
    marginBottom: 24
  },
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: C.line,
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: 'white'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50
  },
  navText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4
  },
  plus: {
    width: 48,
    height: 48,
    backgroundColor: C.teal,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D6EFEE',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export function Avatar({ name, photo, size = 44 }: { name: string; photo?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center' }}>
    {photo && !failed ? <Image accessibilityLabel={`${name}'s profile photo`} source={{ uri: photo }} style={{ width: size, height: size }} onError={() => setFailed(true)} /> : <Text style={s.h3}>{name.slice(0, 2).toUpperCase()}</Text>}
  </View>;
}

// Two centered bars avoid text baseline alignment problems.
export function PlusIcon() {
  return <View accessible={false} style={{ width: 24, height: 24 }}>
    <View style={{
      position: 'absolute',
      left: 2,
      top: 11,
      width: 20,
      height: 2,
      backgroundColor: C.ink
    }} />
    <View style={{
      position: 'absolute',
      left: 11,
      top: 2,
      width: 2,
      height: 20,
      backgroundColor: C.ink
    }} />
  </View>;
}
