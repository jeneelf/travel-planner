import { useState } from 'react';
import type { Trip } from '../model';
import { FormPage } from '../ui';
import { TravelerField } from './TravelerField';

type Props = {
  trip: Trip;
  onClose: () => void;
  onSave: (names: string[]) => Promise<void>;
};

export function TravelersForm({ trip, onClose, onSave }: Props) {
  const [names, setNames] = useState<string[]>(trip.travelers);

  return <FormPage
    title="Travelers"
    label="Save Travelers"
    onClose={onClose}
    onSave={async () => {
      if (!names.length) throw Error('Keep at least one traveler.');
      await onSave(names);
    }}
  >
    <TravelerField value={names} onChange={setNames} />
  </FormPage>;
}
