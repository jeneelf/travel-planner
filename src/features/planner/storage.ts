import { utf8Bytes } from './photoData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import type { Data } from './model';
import { emptyData, readData, readTrips } from './logic';
const KEY = 'travel-planner.mvp.v2';
const OLD_KEY = 'travel-planner.trips.v1';
export function usePlanner() {
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const current = useRef(data),
    locked = useRef(false),
    ready = useRef(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        let next: Data;
        if (raw !== null) next = readData(raw);else {
          const old = await AsyncStorage.getItem(OLD_KEY);
          next = emptyData();
          if (old !== null) next.trips = readTrips(JSON.parse(old));
          // Preserve v1 untouched. Write v2 only after successful validation.
          await AsyncStorage.setItem(KEY, JSON.stringify(next));
        }
        if (active) {
          current.current = next;
          setData(next);
          ready.current = true;
        }
      } catch (error) {
        if (active) setLoadError(`Could not load your planner. Existing data was not replaced. ${error instanceof Error ? error.message : ''}`);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  async function save(change: (previous: Data) => Data) {
    if (!ready.current) throw Error('Your planner has not loaded.');
    if (locked.current) throw Error('A save is already in progress. Please try again.');
    locked.current = true;
    setSaving(true);
    try {
      const next = readData(JSON.stringify(change(current.current)));
      const serialized = JSON.stringify(next);
      const size = utf8Bytes(serialized);
      if (size > 1800000 && size > utf8Bytes(JSON.stringify(current.current))) {
        throw Error('Local storage is getting full. Remove a photo or export a backup and delete an old trip before adding more.');
      }
      await AsyncStorage.setItem(KEY, serialized);
      current.current = next;
      setData(next);
    } finally {
      locked.current = false;
      setSaving(false);
    }
  }
  return {
    data,
    loading,
    loadError,
    saving,
    save
  };
}
