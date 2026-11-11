import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from '../pickerStyles';
import { validDate, displayDate, calendarDate } from '../logic';
type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimum?: string;
  maximum?: string;
  disabled?: boolean;
};
export function DateField({
  label,
  value,
  onChange,
  minimum,
  maximum,
  disabled = false
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 12));
  });
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const firstWeekday = month.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 12)).getUTCDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  function openCalendar() {
    const initial = validDate(value) ? value : minimum && validDate(minimum) ? minimum : null;
    const now = new Date();
    const date = initial ? new Date(`${initial}T12:00:00Z`) : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 12));
    setMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12)));
    setOpen(true);
  }
  function moveMonth(amount: number) {
    setMonth(new Date(Date.UTC(year, monthIndex + amount, 1, 12)));
  }
  const previousDisabled = year === 1900 && monthIndex === 0 || !!minimum && calendarDate(year, monthIndex, 1) <= minimum.slice(0, 7) + '-01';
  const nextDisabled = year === 2100 && monthIndex === 11 || !!maximum && calendarDate(year, monthIndex, 1) >= maximum.slice(0, 7) + '-01';
  return <View>
<Text style={styles.label}>
{label}
</Text>
<Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value ? displayDate(value) : 'Choose date'}`} accessibilityState={{
      disabled,
      expanded: open
    }} disabled={disabled} onPress={() => open ? setOpen(false) : openCalendar()} style={[styles.input, disabled && styles.disabled]}>
<Text style={{
        color: '#172B2C',
        fontSize: 16
      }}>
{value ? displayDate(value) : 'Choose date'}
</Text>
</Pressable>
{open && <View style={{
      borderWidth: 1,
      borderColor: '#BCEEEE',
      borderRadius: 12,
      padding: 12,
      marginBottom: 24,
      backgroundColor: '#F1F8F8'
    }}>
<View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
<Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={previousDisabled || disabled} onPress={() => moveMonth(-1)} style={[styles.addButton, (previousDisabled || disabled) && styles.disabled]}>
<Text style={styles.addSymbol}>‹</Text>
</Pressable>
<Text style={{
          flex: 1,
          textAlign: 'center',
          color: '#172B2C',
          fontWeight: '700'
        }}>
{month.toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
          })}
</Text>
<Pressable accessibilityRole="button" accessibilityLabel="Next month" disabled={nextDisabled || disabled} onPress={() => moveMonth(1)} style={[styles.addButton, (nextDisabled || disabled) && styles.disabled]}>
<Text style={styles.addSymbol}>›</Text>
</Pressable>
</View>
<View style={{
        flexDirection: 'row'
      }}>
{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((letter, index) => <Text key={index} style={{
          width: '14.285714%',
          textAlign: 'center',
          paddingVertical: 8,
          color: '#526567'
        }}>
{letter}
</Text>)}
</View>
{Array.from({
        length: cellCount / 7
      }, (_, week) => <View key={week} style={{
        flexDirection: 'row'
      }}>
{Array.from({
          length: 7
        }, (_, weekday) => {
          const day = week * 7 + weekday - firstWeekday + 1;
          if (day < 1 || day > daysInMonth) {
            return <View key={weekday} style={{
              flex: 1,
              minHeight: 44
            }} />;
          }
          const date = calendarDate(year, monthIndex, day);
          const blocked = disabled || !!minimum && date < minimum || !!maximum && date > maximum;
          const selected = date === value;
          return <Pressable key={weekday} accessibilityRole="button" accessibilityLabel={displayDate(date)} accessibilityState={{
            selected,
            disabled: blocked
          }} disabled={blocked} onPress={() => {
            onChange(date);
            setOpen(false);
          }} style={{
            flex: 1,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: selected ? '#1BC3C5' : 'transparent',
            opacity: blocked ? 0.3 : 1
          }}>
<Text style={{
              color: '#172B2C'
            }}>
{day}
</Text>
</Pressable>;
        })}
</View>)}
<Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.cancelButton}>
<Text style={styles.cancelLabel}>Close calendar</Text>
</Pressable>
</View>}
</View>;
}
