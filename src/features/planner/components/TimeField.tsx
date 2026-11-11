import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { styles } from '../pickerStyles';
import { formatTime12 } from '../logic';
type TimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
export function TimeField({
  value,
  onChange,
  disabled = false
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  function openPicker() {
    const [savedHour, savedMinute] = value ? value.split(':').map(Number) : [9, 0];
    setHour(savedHour % 12 || 12);
    setMinute(savedMinute);
    setPeriod(savedHour >= 12 ? 'PM' : 'AM');
    setOpen(true);
  }
  function confirm() {
    const hour24 = hour % 12 + (period === 'PM' ? 12 : 0);
    onChange(`${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    setOpen(false);
  }
  function options(label: string, values: number[], selected: number, choose: (value: number) => void) {
    return <View style={{
      flex: 1
    }}>
<Text style={[styles.label, {
        textAlign: 'center'
      }]}>
{label}
</Text>
<ScrollView style={{
        height: 176
      }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
{values.map(number => <Pressable key={number} accessibilityRole="button" accessibilityLabel={`${label} ${number}`} accessibilityState={{
          selected: selected === number
        }} disabled={disabled} onPress={() => choose(number)} style={{
          padding: 12,
          minHeight: 44,
          borderRadius: 8,
          backgroundColor: selected === number ? '#1BC3C5' : '#F1F8F8',
          marginBottom: 4
        }}>
<Text style={{
            textAlign: 'center',
            color: '#172B2C'
          }}>
{label === 'Minute' ? String(number).padStart(2, '0') : number}
</Text>
</Pressable>)}
</ScrollView>
</View>;
  }
  return <View>
<Text style={styles.label}>Time · destination local time</Text>
<Pressable accessibilityRole="button" accessibilityLabel={value ? formatTime12(value) : 'Choose time'} accessibilityState={{
      disabled,
      expanded: open
    }} disabled={disabled} onPress={() => open ? setOpen(false) : openPicker()} style={[styles.input, disabled && styles.disabled]}>
<Text style={{
        color: '#172B2C',
        fontSize: 16
      }}>
{value ? formatTime12(value) : 'Choose time'}
</Text>
</Pressable>
{open && <View style={{
      marginBottom: 24
    }}>
<Text style={[styles.tripName, {
        marginBottom: 16
      }]}>
            {hour}:{String(minute).padStart(2, '0')} {period}
          </Text>
<View style={{
        flexDirection: 'row',
        gap: 12
      }}>
{options('Hour', Array.from({
          length: 12
        }, (_, index) => index + 1), hour, setHour)}
{options('Minute', Array.from({
          length: 60
        }, (_, index) => index), minute, setMinute)}
<View style={{
          flex: 1
        }}>
<Text style={[styles.label, {
            textAlign: 'center'
          }]}>
                AM / PM
              </Text>
{(['AM', 'PM'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{
            selected: period === item
          }} disabled={disabled} onPress={() => setPeriod(item)} style={{
            padding: 12,
            minHeight: 44,
            borderRadius: 8,
            marginBottom: 4,
            backgroundColor: period === item ? '#1BC3C5' : '#F1F8F8'
          }}>
<Text style={{
              textAlign: 'center',
              color: '#172B2C'
            }}>
{item}
</Text>
</Pressable>)}
</View>
</View>
<Pressable accessibilityRole="button" disabled={disabled} onPress={confirm} style={[styles.primaryButton, {
        marginTop: 16
      }]}>
<Text style={styles.primaryLabel}>Set Time</Text>
</Pressable>
<Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.cancelButton}>
<Text style={styles.cancelLabel}>Cancel</Text>
</Pressable>
</View>}
</View>;
}
